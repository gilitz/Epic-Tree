/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlockingIssue, BlockedIssue, TreeData, Issue, Epic } from './types';

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

    const treeData = {
      name: (epic?.fields?.summary as string) || (epic?.key as string) || 'Epic Tree',
      key: (epic?.key as string) || 'ET-2',
      summary: (epic?.fields?.summary as string) || 'Loading epic...',
      priority: epic?.fields?.priority ? {
        ...(epic.fields.priority as any),
        id: (epic.fields.priority as any)?.id
      } as TreeData['priority'] : undefined,
      assignee: epic?.fields?.assignee as TreeData['assignee'],
      status: epic?.fields?.status as TreeData['status'],
      labels: (epic?.fields?.labels as string[]) || [],
      storyPoints: (epic?.fields?.customfield_10016 as number) || (epic?.fields?.storyPoints as number),
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
          storyPoints: (issueFields?.customfield_10016 as number) || (issueFields?.storyPoints as number),
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
              storyPoints: (subtaskFields?.customfield_10016 as number) || 0,
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
          }) 
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