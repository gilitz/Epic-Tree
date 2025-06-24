/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlockingIssue, BlockedIssue, TreeData, Issue, Epic } from './types';
import { getStoryPoints } from '../../config/jira-fields';

// Helper function to extract blocking issues from issuelinks (issues that block this issue)
export const extractBlockingIssues = (issuelinks: any[]): BlockingIssue[] => {
  if (!issuelinks || !Array.isArray(issuelinks)) return [];
  
  return issuelinks
    .filter(link => link.type?.name === 'Blocks' && link.inwardIssue)
    .map(link => ({
      key: link.inwardIssue.key,
      summary: link.inwardIssue.fields?.summary || link.inwardIssue.key,
      status: link.inwardIssue.fields?.status
    }));
};

// Helper function to extract blocked issues from issuelinks (issues that this issue blocks)
export const extractBlockedIssues = (issuelinks: any[]): BlockedIssue[] => {
  if (!issuelinks || !Array.isArray(issuelinks)) return [];
  
  return issuelinks
    .filter(link => link.type?.name === 'Blocks' && link.outwardIssue)
    .map(link => ({
      key: link.outwardIssue.key,
      summary: link.outwardIssue.fields?.summary || link.outwardIssue.key,
      status: link.outwardIssue.fields?.status
    }));
};

// Filter function to check if a node matches the filter criteria
export const nodeMatchesFilters = (node: TreeData, filters: { 
  assignees: string[]; 
  statuses: string[]; 
  priorities: string[]; 
  labels: string[]; 
  blockingStatus: string[]; 
}): boolean => {
  // If no filters are applied, show all nodes
  if (filters.assignees.length === 0 && 
      filters.statuses.length === 0 && 
      filters.priorities.length === 0 && 
      filters.labels.length === 0 && 
      filters.blockingStatus.length === 0) {
    return true;
  }

  let matchesAssigneeFilter = true;
  let matchesStatusFilter = true;
  let matchesPriorityFilter = true;
  let matchesLabelsFilter = true;
  let matchesBlockingFilter = true;

  // Check assignee filter
  if (filters.assignees.length > 0) {
    if (filters.assignees.includes('unassigned')) {
      // If "unassigned" is selected, check if node has no assignee OR if other assignees are also selected
      const hasNoAssignee = !node.assignee || !node.assignee.displayName;
      const otherAssignees = filters.assignees.filter(a => a !== 'unassigned');
      const hasSelectedAssignee = node.assignee && node.assignee.accountId && otherAssignees.includes(node.assignee.accountId);
      matchesAssigneeFilter = hasNoAssignee || hasSelectedAssignee;
    } else {
      // Only check for specific assignees
      matchesAssigneeFilter = node.assignee && node.assignee.accountId && filters.assignees.includes(node.assignee.accountId);
    }
  }

  // Check status filter
  if (filters.statuses.length > 0) {
    matchesStatusFilter = node.status && filters.statuses.includes(node.status.name);
  }

  // Check priority filter
  if (filters.priorities.length > 0) {
    // Only check for specific priorities
    matchesPriorityFilter = node.priority && filters.priorities.some(priorityId => {
      return node.priority?.name === priorityId || 
             (node.priority as any)?.id === priorityId;
    });
  }

  // Check labels filter
  if (filters.labels.length > 0) {
    // Only check for specific labels
    matchesLabelsFilter = node.labels && node.labels.some(label => filters.labels.includes(label));
  }

  // Check blocking status filter
  if (filters.blockingStatus.length > 0) {
    const isBlocking = node.blockedIssues && node.blockedIssues.length > 0;
    const isBlocked = node.blockingIssues && node.blockingIssues.length > 0;

    matchesBlockingFilter = filters.blockingStatus.some(status => {
      switch (status) {
        case 'blocking':
          return isBlocking;
        case 'blocked':
          return isBlocked;
        default:
          return false;
      }
    });
  }

  return matchesAssigneeFilter && matchesStatusFilter && matchesPriorityFilter && matchesLabelsFilter && matchesBlockingFilter;
};

// Recursive function to filter tree data with context tracking
export const filterTreeData = (node: TreeData, filters: { 
  assignees: string[]; 
  statuses: string[]; 
  priorities: string[]; 
  labels: string[]; 
  blockingStatus: string[]; 
}): TreeData | null => {
  // Always include the root epic node, but filter its children
  if (node.isEpic) {
    const filteredChildren = node.children
      ?.map(child => filterTreeData(child, filters))
      .filter((child): child is TreeData => child !== null) || [];
    
    return {
      ...node,
      children: filteredChildren
    };
  }

  // For non-epic nodes, check if the node itself matches
  const nodeMatches = nodeMatchesFilters(node, filters);
  
  // Filter children recursively
  const filteredChildren = node.children
    ?.map(child => filterTreeData(child, filters))
    .filter((child): child is TreeData => child !== null) || [];

  // Include the node if:
  // 1. The node itself matches the filters, OR
  // 2. The node has children that match the filters (so we don't lose parent nodes)
  if (nodeMatches || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
      // Add a flag to indicate if this node is shown for context only
      isContextOnly: !nodeMatches && filteredChildren.length > 0
    };
  }

  return null;
};

export const transformDataToTree = ({ epic, issues, subtasksData }: { epic: Epic | null; issues: Issue[]; subtasksData: any[] }): TreeData => {
  try {
    // Create a map of detailed subtask data by key
    const subtaskDetailMap = new Map<string, any>();
    if (subtasksData && Array.isArray(subtasksData)) {
      subtasksData.forEach((subtask) => {
        if (subtask?.key) {
          subtaskDetailMap.set(subtask.key, subtask);
        }
      });
    }

    // Track which subtasks have been assigned to prevent duplicates
    const assignedSubtasks = new Set<string>();

    const treeData = {
      name: (epic?.fields?.summary as string) || (epic?.key as string) || 'Epic Tree',
      key: (epic?.key as string),
      summary: (epic?.fields?.summary as string) || 'Loading epic...',
      priority: epic?.fields?.priority ? {
        ...(epic.fields.priority as any),
        id: (epic.fields.priority as any)?.id
      } as TreeData['priority'] : undefined,
      assignee: epic?.fields?.assignee as TreeData['assignee'],
      status: epic?.fields?.status as TreeData['status'],
      labels: (epic?.fields?.labels as string[]) || [],
      storyPoints: getStoryPoints(epic?.fields),
      issueType: epic?.fields?.issuetype as TreeData['issueType'],
      reporter: epic?.fields?.reporter as TreeData['reporter'],
      created: epic?.fields?.created as string,
      updated: epic?.fields?.updated as string,
      dueDate: epic?.fields?.duedate as string,
      resolution: epic?.fields?.resolution as TreeData['resolution'],
      components: (epic?.fields?.components as Array<{ name: string }>) || [],
      fixVersions: (epic?.fields?.fixVersions as Array<{ name: string }>) || [],
      issuelinks: (epic?.fields?.issuelinks as any[]) || [],
      blockingIssues: extractBlockingIssues((epic?.fields?.issuelinks as any[]) || []),
      blockedIssues: extractBlockedIssues((epic?.fields?.issuelinks as any[]) || []),
      isEpic: true,
      children: (!issues || !Array.isArray(issues) || issues.length === 0) ? [] : issues.map((issue) => {
        // Safely handle issue structure
        const issueFields = issue?.fields;
        const issueSubtasks = Array.isArray(issueFields?.subtasks) ? issueFields.subtasks : [];
        
        const issueNode = {
          name: (issueFields?.summary as string) || (issue?.key as string) || 'Unknown Issue',
          key: issue?.key as string,
          summary: issueFields?.summary as string,
          priority: issueFields?.priority ? {
            ...(issueFields.priority as any),
            id: (issueFields.priority as any)?.id
          } as TreeData['priority'] : undefined,
          assignee: issueFields?.assignee as TreeData['assignee'],
          status: issueFields?.status as TreeData['status'],
          labels: (issueFields?.labels as string[]) || [],
          storyPoints: getStoryPoints(issueFields),
          issueType: issueFields?.issuetype as TreeData['issueType'],
          reporter: issueFields?.reporter as TreeData['reporter'],
          created: issueFields?.created as string,
          updated: issueFields?.updated as string,
          dueDate: issueFields?.duedate as string,
          resolution: issueFields?.resolution as TreeData['resolution'],
          components: (issueFields?.components as Array<{ name: string }>) || [],
          fixVersions: (issueFields?.fixVersions as Array<{ name: string }>) || [],
          issuelinks: (issueFields?.issuelinks as any[]) || [],
          blockingIssues: extractBlockingIssues((issueFields?.issuelinks as any[]) || []),
          blockedIssues: extractBlockedIssues((issueFields?.issuelinks as any[]) || []),
          isEpic: false,
          children: issueSubtasks.map((subtask) => {
            // Type guard and safe key access
            const subtaskKey = (subtask && typeof subtask === 'object' && 'key' in subtask) 
              ? (subtask as any).key as string 
              : undefined;
            
            // Skip if this subtask has already been assigned to another parent
            if (subtaskKey && assignedSubtasks.has(subtaskKey)) {
              console.warn(`⚠️ Duplicate subtask detected: ${subtaskKey} is assigned to multiple parent tasks!`);
              return null;
            }
            
            // Mark this subtask as assigned
            if (subtaskKey) {
              assignedSubtasks.add(subtaskKey);
            }
            
            // Get detailed data for this subtask if available
            const subtaskDetail = subtaskKey ? subtaskDetailMap.get(subtaskKey) : undefined;
            const subtaskFields = subtaskDetail?.fields;
            
            return { 
              name: (subtaskFields?.summary as string) || subtaskKey || 'Unknown Subtask',
              key: subtaskKey,
              summary: (subtaskFields?.summary as string) || (subtaskKey ? `Subtask: ${subtaskKey}` : 'Unknown Subtask'),
              priority: subtaskFields?.priority ? {
                ...(subtaskFields.priority as any),
                id: (subtaskFields.priority as any)?.id
              } as TreeData['priority'] : { name: 'Unknown', iconUrl: '' },
              assignee: (subtaskFields?.assignee as TreeData['assignee']) || { displayName: 'Unassigned', avatarUrls: { '16x16': '' } },
              status: (subtaskFields?.status as TreeData['status']) || { name: 'Unknown', statusCategory: { colorName: 'medium-gray' } },
              labels: (subtaskFields?.labels as string[]) || [],
              storyPoints: getStoryPoints(subtaskFields),
              issueType: (subtaskFields?.issuetype as TreeData['issueType']) || { name: 'Sub-task', iconUrl: '' },
              reporter: (subtaskFields?.reporter as TreeData['reporter']) || { displayName: 'Unknown', avatarUrls: { '16x16': '' } },
              created: (subtaskFields?.created as string) || new Date().toISOString(),
              updated: (subtaskFields?.updated as string) || new Date().toISOString(),
              dueDate: (subtaskFields?.duedate as string) || undefined,
              resolution: (subtaskFields?.resolution as TreeData['resolution']) || undefined,
              components: (subtaskFields?.components as Array<{ name: string }>) || [],
              fixVersions: (subtaskFields?.fixVersions as Array<{ name: string }>) || [],
              children: [], 
              issuelinks: (subtaskFields?.issuelinks as any[]) || [],
              blockingIssues: extractBlockingIssues((subtaskFields?.issuelinks as any[]) || []),
              blockedIssues: extractBlockedIssues((subtaskFields?.issuelinks as any[]) || []),
              isEpic: false
            };
          }).filter(subtask => subtask !== null) 
        };
        
        return issueNode;
      })
    };
    
    return treeData;
  } catch (error) {
    return { 
      name: 'Error loading data', 
      key: 'error',
      summary: 'Error occurred',
      isEpic: true,
      children: [] 
    };
  }
}; 