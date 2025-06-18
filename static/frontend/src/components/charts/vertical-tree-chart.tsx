/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';

import { LinkControls } from './link-controls';
import { useFetchIssuesByEpicId } from '../../hooks/use-fetch-issues-by-epic';
import { useFetchIssueById } from '../../hooks/use-fetch-issue-by-id';
import { useFetchSubtasksByKeys } from '../../hooks/use-fetch-subtasks-by-keys';
import getLinkComponent from './get-link-component';
import { Tooltip } from '../tooltip';
import { IssueTooltip } from '../issue-tooltip';
import { router } from '@forge/bridge';

interface BlockingIssue {
  key: string;
  summary: string;
  status?: {
    name: string;
  };
}

interface BlockedIssue {
  key: string;
  summary: string;
  status?: {
    name: string;
  };
}

interface TreeData {
  name: string;
  key?: string;
  summary?: string;
  priority?: {
    name: string;
    iconUrl?: string;
  };
  assignee?: {
    displayName: string;
    avatarUrls?: {
      '16x16': string;
    };
  };
  status?: {
    name: string;
    statusCategory?: {
      colorName: string;
    };
  };
  labels?: string[];
  storyPoints?: number;
  issueType?: {
    name: string;
    iconUrl?: string;
  };
  reporter?: {
    displayName: string;
    avatarUrls?: {
      '16x16': string;
    };
  };
  created?: string;
  updated?: string;
  dueDate?: string;
  resolution?: {
    name: string;
  };
  components?: Array<{ name: string }>;
  fixVersions?: Array<{ name: string }>;
  issuelinks?: any[];
  blockingIssues?: BlockingIssue[];
  blockedIssues?: BlockedIssue[];
  children?: TreeData[];
  isEpic?: boolean;
}

interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuelinks: unknown[];
    subtasks: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Epic {
  fields: {
    summary: string;
    issuelinks: unknown[];
    [key: string]: unknown;
  };
  errorMessages?: string[];
  [key: string]: unknown;
}

interface VerticalTreeChartProps {
  width: number;
  height: number;
  margin?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}



const defaultMargin = { top: 50, left: 80, right: 80, bottom: 50 };

export function VerticalTreeChart({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: VerticalTreeChartProps): JSX.Element | null {
  
  const [layout, setLayout] = useState<'polar' | 'cartesian'>('cartesian');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const [linkType, setLinkType] = useState<'diagonal' | 'step' | 'curve' | 'line'>('step');
  const [stepPercent, setStepPercent] = useState<number>(0.5);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltipOpenNodeId, setTooltipOpenNodeId] = useState<string | null>(null);

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;

  let origin: { x: number; y: number };
  let sizeWidth: number;
  let sizeHeight: number;

  if (layout === 'polar') {
    origin = {
      x: innerWidth / 2,
      y: innerHeight / 2,
    };
    sizeWidth = 2 * Math.PI;
    sizeHeight = Math.min(innerWidth, innerHeight) / 2;
  } else {
    origin = { x: 0, y: 0 };
    if (orientation === 'vertical') {
      sizeWidth = innerWidth;
      sizeHeight = innerHeight;
    } else {
      sizeWidth = innerHeight;
      sizeHeight = innerWidth;
    }
  }

  const LinkComponent = getLinkComponent({ layout, linkType, orientation }) as any;
  const { issuesByEpic } = useFetchIssuesByEpicId({ epicId: 'ET-2' });
  const { issue: rootEpicIssue } = useFetchIssueById({ issueId: 'ET-2' });
  
  // Get all subtask keys directly from the issues
  const subtaskKeys = useMemo(() => {
    if (!issuesByEpic || !Array.isArray(issuesByEpic)) {
      return [];
    }
    
    const allSubtaskKeys: string[] = [];
    issuesByEpic.forEach(issue => {
      if (issue.fields?.subtasks && Array.isArray(issue.fields.subtasks) && issue.fields.subtasks.length > 0) {
        issue.fields.subtasks.forEach(subtask => {
          // Type guard for subtask with key property
          if (subtask && typeof subtask === 'object' && 'key' in subtask && typeof (subtask as any).key === 'string') {
            allSubtaskKeys.push((subtask as any).key);
          }
        });
      }
    });
    
    return allSubtaskKeys;
  }, [issuesByEpic]);
  
  const { subtasks } = useFetchSubtasksByKeys({ subtaskKeys });
  // Helper function to extract blocking issues from issuelinks (issues that block this issue)
  const extractBlockingIssues = (issuelinks: any[]): BlockingIssue[] => {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractBlockedIssues = (issuelinks: any[]): BlockedIssue[] => {
    if (!issuelinks || !Array.isArray(issuelinks)) return [];
    
    return issuelinks
      .filter(link => link.type?.name === 'Blocks' && link.outwardIssue)
      .map(link => ({
        key: link.outwardIssue.key,
        summary: link.outwardIssue.fields?.summary || link.outwardIssue.key,
        status: link.outwardIssue.fields?.status
      }));
  };
  
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformDataToTree = ({ epic, issues, subtasksData }: { epic: Epic | null; issues: Issue[]; subtasksData: any[] }): TreeData => {

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
        priority: epic?.fields?.priority as TreeData['priority'],
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
            priority: issueFields?.priority as TreeData['priority'],
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
                priority: (subtaskFields?.priority as TreeData['priority']) || { name: 'Unknown', iconUrl: '' },
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


  const transformedTreeData = transformDataToTree({ epic: rootEpicIssue, issues: issuesByEpic, subtasksData: subtasks });

  // Use real data only
  const finalTreeData = transformedTreeData;
  
  

  const data = useMemo(() => {
    try {
      const hierarchy_data = hierarchy(finalTreeData);
      return hierarchy_data;
    } catch (error) {
      return hierarchy({ name: 'Error', children: [] });
    }
  }, [finalTreeData]);
  

  
  // Handle error states and loading
  if (!issuesByEpic && !rootEpicIssue) {
    return (
      <LoadingContainer>
        <LoadingTitle>Loading Epic Tree...</LoadingTitle>
        <LoadingSubtitle>
          Fetching epic and issue data...
        </LoadingSubtitle>
      </LoadingContainer>
    );
  }

  // Handle network error states
  if (rootEpicIssue?.fields?.summary?.includes('Network Error') || 
      rootEpicIssue?.fields?.summary?.includes('Error loading')) {
    return (
      <ErrorContainer>
        <ErrorTitle>⚠️ Network Error</ErrorTitle>
        <ErrorMessage>
          Unable to load epic data. Please check your connection and try refreshing the page.
        </ErrorMessage>
        <ErrorSubtitle>
          Epic ID: ET-2
        </ErrorSubtitle>
      </ErrorContainer>
    );
  }

  // Don't render if we only have loading state
  if (transformedTreeData.name === 'Loading...' && transformedTreeData.children?.length === 0) {
    return (
      <LoadingContainer>
        <LoadingTitle>Loading Epic Tree...</LoadingTitle>
        <LoadingSubtitle>
          Loading issues for epic...
        </LoadingSubtitle>
      </LoadingContainer>
    );
  }

  return totalWidth < 10 ? null : (
    <ChartContainer>
      <LinkControls
        layout={layout}
        orientation={orientation}
        linkType={linkType}
        stepPercent={stepPercent}
        setLayout={setLayout}
        setOrientation={setOrientation}
        setLinkType={setLinkType}
        setStepPercent={setStepPercent}
      />
              <svg width={totalWidth} height={totalHeight}>
        <defs>
          <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
          <filter id="hover-shadow-gray" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4a5568" floodOpacity="0.8"/>
          </filter>
          <filter id="hover-shadow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.8"/>
          </filter>
          <filter id="hover-shadow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#dc2626" floodOpacity="0.8"/>
          </filter>
          <filter id="hover-shadow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4ade80" floodOpacity="0.8"/>
          </filter>
          <filter id="hover-shadow-yellow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.8"/>
          </filter>
        </defs>
        <rect width={totalWidth} height={totalHeight} rx={14} fill="#272b4d" />
        
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={data}
            size={[sizeWidth, sizeHeight]}
            separation={(a: any, b: any) => {
              // Much more reasonable separation values
              if (a?.parent === b?.parent) {
                // Siblings - moderate spacing
                return 1;
              } else {
                // Non-siblings - slightly more spacing
                return 1.5;
              }
            }}
          >
            {(tree) => (
              <Group top={origin.y} left={origin.x}>
                
                {(tree.links() || []).map((link, index) => (
                  <LinkComponent
                    key={index}
                    data={link}
                    percent={stepPercent}
                    stroke="rgb(254,110,158,0.6)"
                    strokeWidth="1"
                    fill="none"
                  />
                ))}

                {(tree.descendants() || []).map((node, index) => {
                  const width = 140; // Increased width to accommodate icon + text
                  const height = 32; // Slightly increased height

                  let top: number;
                  let left: number;
                  if (layout === 'polar') {
                    const [radialX, radialY] = pointRadial(node.x, node.y);
                    top = radialY;
                    left = radialX;
                  } else if (orientation === 'vertical') {
                    top = node.y;
                    left = node.x;
                  } else {
                    top = node.x;
                    left = node.y;
                  }
                  const nodeData = node.data as TreeData;
                  const nodeName = nodeData.name || 'Unknown';
                  
                  // Get the actual Jira priority icon URL
                  const priorityIconUrl = nodeData.priority?.iconUrl;
                  
                  // Use the full name - SVG will handle overflow with CSS
                  const displayName = nodeName || 'Unknown';
                  
                                     // Unified node styling based on status and blocking state
                   const getNodeStyling = (nodeData: TreeData, isHovered: boolean) => {
                     const isDone = nodeData.status?.statusCategory?.colorName === 'green' || 
                                   nodeData.status?.name?.toLowerCase().includes('done') ||
                                   nodeData.status?.name?.toLowerCase().includes('closed') ||
                                   nodeData.resolution?.name;
                     
                     const isInProgress = nodeData.status?.statusCategory?.colorName === 'yellow' ||
                                         nodeData.status?.name?.toLowerCase().includes('in progress') ||
                                         nodeData.status?.name?.toLowerCase().includes('progress');
                     
                     const isBlocked = nodeData.blockingIssues && nodeData.blockingIssues.length > 0;
                     
                     // Base styling - all nodes look the same
                     let fill = '#272b4d';
                     let stroke = '#4a5568';
                     let strokeWidth = 2;
                     
                     // Status-based modifications
                     if (isDone) {
                       fill = '#017d2d'; // Green background for done items (matching image)
                     }
                     
                     if (isInProgress) {
                       fill = '#baa625'; // Yellow background for in progress items
                     }
                     
                     if (isBlocked) {
                       stroke = '#dc2626'; // Red border for blocked items
                       strokeWidth = 3;
                     }
                    
                                                              // Choose shadow color based on node state
                     let shadowFilter = '';
                     if (isHovered) {
                       if (isBlocked) {
                         shadowFilter = 'url(#hover-shadow-red)';
                       } else if (isDone) {
                         shadowFilter = 'url(#hover-shadow-green)';
                       } else if (isInProgress) {
                         shadowFilter = 'url(#hover-shadow-yellow)';
                       } else {
                         shadowFilter = 'url(#hover-shadow-gray)';
                       }
                     }
                     
                     return {
                       fill,
                       stroke,
                       strokeWidth,
                       strokeOpacity: 1,
                       rx: 4, // Consistent border radius
                       filter: shadowFilter || undefined
                     };
                  };
                  
                  const isHovered = hoveredNodeId === nodeData.key;
                  const isTooltipOpen = tooltipOpenNodeId === nodeData.key;
                  const shouldShowHoverEffect = isHovered || isTooltipOpen;
                  const nodeStyling = getNodeStyling(nodeData, shouldShowHoverEffect);
                  
                  // Handle node click
                  const handleNodeClick = async (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (nodeData.key) {
                      try {
                        await router.open(`/browse/${nodeData.key}`);
                      } catch (error) {
                        window.location.href = `https://gilitz.atlassian.net/browse/${nodeData.key}`;
                      }
                    }
                  };
                  
                  const tooltipContent = (
                    <IssueTooltip
                      issueKey={nodeData.key}
                      summary={nodeData.summary}
                      priority={nodeData.priority}
                      assignee={nodeData.assignee}
                      status={nodeData.status}
                      labels={nodeData.labels}
                      storyPoints={nodeData.storyPoints}
                      issueType={nodeData.issueType}
                      reporter={nodeData.reporter}
                      created={nodeData.created}
                      updated={nodeData.updated}
                      dueDate={nodeData.dueDate}
                      resolution={nodeData.resolution}
                      components={nodeData.components}
                      fixVersions={nodeData.fixVersions}
                      blockingIssues={nodeData.blockingIssues}
                      blockedIssues={nodeData.blockedIssues}
                      isEpic={nodeData.isEpic}
                    />
                  );
                  
                  return (
                    <Tooltip 
                      content={tooltipContent} 
                      interactive={true}
                      key={index}
                      onShow={() => setTooltipOpenNodeId(nodeData.key || null)}
                      onHide={() => setTooltipOpenNodeId(null)}
                    >
                      <g transform={`translate(${left}, ${top})`}>
                        {/* Direct SVG rect - no styled components */}
                        <rect
                          height={height}
                          width={width}
                          y={-height / 2}
                          x={-width / 2}
                          fill={nodeStyling.fill}
                          stroke={nodeStyling.stroke}
                          strokeWidth={nodeStyling.strokeWidth}
                          strokeOpacity={nodeStyling.strokeOpacity}
                          rx={nodeStyling.rx}
                          filter={nodeStyling.filter}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'filter 0.2s ease-in-out'
                          }}
                          onClick={handleNodeClick}
                          onMouseEnter={() => setHoveredNodeId(nodeData.key || null)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        />

                        {/* Priority Icon */}
                        {priorityIconUrl && (
                          <image
                            x={-width / 2 + 4}
                            y={-8}
                            width={16}
                            height={16}
                            href={priorityIconUrl}
                            style={{ pointerEvents: 'none' }}
                          />
                        )}
                        
                        {/* Node Text with automatic ellipsis */}
                        <foreignObject
                          x={-width / 2 + (priorityIconUrl ? 24 : 12)}
                          y={-8}
                          width={width - (priorityIconUrl ? 32 : 20)}
                          height={16}
                          style={{ pointerEvents: 'none' }}
                        >
                          <div
                            style={{
                              fontSize: '10px',
                              fontFamily: 'Arial',
                              color: nodeStyling.fill === '#017d2d' || nodeStyling.fill === '#baa625' ? '#000000' : '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: '16px',
                              transition: 'color 0.2s ease-in-out'
                            }}
                          >
                            {displayName}
                          </div>
                        </foreignObject>
                        

                      </g>
                    </Tooltip>
                  );
                })}
              </Group>
            )}
          </Tree>
        </Group>
      </svg>
    </ChartContainer>
  );
}

// Styled Components
const LoadingContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const LoadingTitle = styled.div`
  display: block;
`;

const LoadingSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const ErrorTitle = styled.div`
  color: #d32f2f;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  margin-top: 8px;
`;

const ErrorSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const ChartContainer = styled.div`
  display: block;
`;

 