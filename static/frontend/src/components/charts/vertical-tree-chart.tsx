import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';
import { useForceUpdate } from './use-force-update';
import { LinkControls } from './link-controls';
import { useFetchIssuesByEpicId } from '../../hooks/use-fetch-issues-by-epic';
import { useFetchIssueById } from '../../hooks/use-fetch-issue-by-id';
import { useFetchSubtasks } from '../../hooks/use-fetch-subtasks';
import getLinkComponent from './get-link-component';
import { Tooltip } from '../tooltip';
import { IssueTooltip } from '../issue-tooltip';

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
  isExpanded?: boolean;
  isEpic?: boolean;
  data?: TreeData;
}

interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuelinks: any[];
    subtasks: Array<{ key: string }>;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Epic {
  fields: {
    summary: string;
    issuelinks: any[];
    [key: string]: any;
  };
  errorMessages?: string[];
  [key: string]: any;
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

const datamock: TreeData = {
  name: 'Epic Tree',
  children: [
    {
      name: 'Feature A',
      children: [
        { name: 'Task A1' },
        { name: 'Task A2' },
        { name: 'Task A3' },
        {
          name: 'Story C',
          children: [
            {
              name: 'Subtask C1',
            },
            {
              name: 'Story D',
              children: [
                {
                  name: 'Task D1',
                },
                {
                  name: 'Task D2',
                },
                {
                  name: 'Task D3',
                },
              ],
            },
          ],
        },
      ],
    },
    { name: 'Bug Fix Z' },
    {
      name: 'Feature B',
      children: [{ name: 'Task B1' }, { name: 'Task B2' }, { name: 'Task B3' }],
    },
  ],
};

const defaultMargin = { top: 30, left: 30, right: 30, bottom: 70 };

export function VerticalTreeChart({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: VerticalTreeChartProps): JSX.Element | null {
  
  const [layout, setLayout] = useState<'polar' | 'cartesian'>('cartesian');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const [linkType, setLinkType] = useState<'diagonal' | 'step' | 'curve' | 'line'>('step');
  const [stepPercent, setStepPercent] = useState<number>(0.5);
  const forceUpdate = useForceUpdate();

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
  
  // Get all parent keys from issues to fetch their subtasks
  const parentKeys = useMemo(() => {
    if (!issuesByEpic || !Array.isArray(issuesByEpic)) return [];
    return issuesByEpic
      .filter(issue => issue?.fields?.subtasks && issue.fields.subtasks.length > 0)
      .map(issue => issue.key);
  }, [issuesByEpic]);
  
  const { subtasks } = useFetchSubtasks({ parentKeys });
  
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
  
  
  const transformDataToTree = ({ epic, issues, subtasksData }: { epic: Epic | null; issues: Issue[]; subtasksData: any[] }): TreeData => {
    
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return { name: 'Loading...', children: [] }; // Return minimal structure while loading
    }

    try {
      // Create a map of subtasks by parent key for quick lookup
      const subtasksByParent = new Map<string, any[]>();
      if (subtasksData && Array.isArray(subtasksData)) {
        subtasksData.forEach(subtask => {
          const parentKey = subtask?.fields?.parent?.key;
          if (parentKey) {
            if (!subtasksByParent.has(parentKey)) {
              subtasksByParent.set(parentKey, []);
            }
            subtasksByParent.get(parentKey)!.push(subtask);
          }
        });
      }

      return {
        name: epic?.fields?.summary || 'Unknown Epic',
        key: epic?.key,
        summary: epic?.fields?.summary,
        priority: epic?.fields?.priority,
        assignee: epic?.fields?.assignee,
        status: epic?.fields?.status,
        labels: epic?.fields?.labels || [],
        storyPoints: epic?.fields?.customfield_10016 || epic?.fields?.storyPoints,
        issueType: epic?.fields?.issuetype,
        reporter: epic?.fields?.reporter,
        created: epic?.fields?.created,
        updated: epic?.fields?.updated,
        dueDate: epic?.fields?.duedate,
        resolution: epic?.fields?.resolution,
        components: epic?.fields?.components || [],
        fixVersions: epic?.fields?.fixVersions || [],
        issuelinks: epic?.fields?.issuelinks || [],
        blockingIssues: extractBlockingIssues(epic?.fields?.issuelinks || []),
        blockedIssues: extractBlockedIssues(epic?.fields?.issuelinks || []),
        isEpic: true,
        children: issues.map(issue => {
          // Safely handle issue structure
          const issueFields = issue?.fields;
          const issueSubtasks = subtasksByParent.get(issue?.key) || [];
          
          return {
            name: issueFields?.summary || issue?.key || 'Unknown Issue',
            key: issue?.key,
            summary: issueFields?.summary,
            priority: issueFields?.priority,
            assignee: issueFields?.assignee,
            status: issueFields?.status,
            labels: issueFields?.labels || [],
            storyPoints: issueFields?.customfield_10016 || issueFields?.storyPoints,
            issueType: issueFields?.issuetype,
            reporter: issueFields?.reporter,
            created: issueFields?.created,
            updated: issueFields?.updated,
            dueDate: issueFields?.duedate,
            resolution: issueFields?.resolution,
            components: issueFields?.components || [],
            fixVersions: issueFields?.fixVersions || [],
            issuelinks: issueFields?.issuelinks || [],
            blockingIssues: extractBlockingIssues(issueFields?.issuelinks || []),
            blockedIssues: extractBlockedIssues(issueFields?.issuelinks || []),
            isEpic: false,
            children: issueSubtasks.map(subtask => {
              const subtaskFields = subtask?.fields;
              return { 
                name: subtaskFields?.summary || subtask?.key || 'Unknown Subtask',
                key: subtask?.key,
                summary: subtaskFields?.summary,
                priority: subtaskFields?.priority,
                assignee: subtaskFields?.assignee,
                status: subtaskFields?.status,
                labels: subtaskFields?.labels || [],
                storyPoints: subtaskFields?.customfield_10016 || subtaskFields?.storyPoints,
                issueType: subtaskFields?.issuetype,
                reporter: subtaskFields?.reporter,
                created: subtaskFields?.created,
                updated: subtaskFields?.updated,
                dueDate: subtaskFields?.duedate,
                resolution: subtaskFields?.resolution,
                components: subtaskFields?.components || [],
                fixVersions: subtaskFields?.fixVersions || [],
                children: [], 
                issuelinks: subtaskFields?.issuelinks || [],
                blockingIssues: extractBlockingIssues(subtaskFields?.issuelinks || []),
                blockedIssues: extractBlockedIssues(subtaskFields?.issuelinks || []),
                isEpic: false
              };
            }) 
          };
        })
      };
    } catch (error) {
      console.error("Error transforming data:", error);
      return { name: 'Error loading data', children: [] };
    }
  };

  const transformedTreeData = transformDataToTree({ epic: rootEpicIssue, issues: issuesByEpic, subtasksData: subtasks });

  const data = useMemo(() => {
    try {
      return hierarchy(transformedTreeData);
    } catch (error) {
      console.error("Error creating hierarchy:", error);
      return hierarchy({ name: 'Error', children: [] });
    }
  }, [issuesByEpic, rootEpicIssue, subtasks]);
  
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
        <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
        <rect width={totalWidth} height={totalHeight} rx={14} fill="#272b4d" />
        
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={data}
            size={[sizeWidth, sizeHeight]}
            separation={(a: any, b: any) => (a?.parent === b?.parent ? 1 : 0.5) / (a?.depth || 1)}
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
                  const width = 80;
                  const height = 40;

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
                  
                  // Helper function to truncate text for node display
                  const truncateForNode = (text: string, maxLength: number = 12): string => {
                    if (!text || typeof text !== 'string') return 'Unknown';
                    if (text.length <= maxLength) return text;
                    return text.substring(0, maxLength) + '...';
                  };
                  
                  const truncatedName = truncateForNode(nodeName);
                  
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
                    <Tooltip content={tooltipContent} interactive key={index}>
                      <IssueLink 
                        key={index} 
                        data-testid="issue-field-summary.ui.inline-read.link-item" 
                        data-is-router-link="true" 
                        data-vc="link-item"  
                        aria-disabled="false" 
                        href="https://gilitz.atlassian.net/browse/ET-2" 
                        target='_parent'
                      >
                        <Group top={top} left={left} key={index}>
                          {node.depth === 0 && (
                            <circle
                              r={20}
                              fill="url('#links-gradient')"
                            //   onClick={() => {
                            //     node.data.isExpanded = !node.data.isExpanded;
                            //     forceUpdate();
                            //   }}
                            />
                          )}
                          {node.depth !== 0 && (
                            <rect
                              height={height}
                              width={width}
                              y={-height / 2}
                              x={-width / 2}
                              fill="#272b4d"
                              stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                              strokeWidth={1}
                              strokeDasharray={node.data.children ? '0' : '2,2'}
                              strokeOpacity={node.data.children ? 1 : 0.6}
                              rx={node.data.children ? 0 : 10}
                            //   onClick={() => {
                            //     node.data.isExpanded = !node.data.isExpanded;
                            //     forceUpdate();
                            //   }}
                            />
                          )}

                          <text
                            dy=".33em"
                            fontSize={node.depth === 0 ? 10 : 11}
                            fontFamily="Arial"
                            textAnchor="middle"
                            style={{ pointerEvents: 'none' }}
                            fill={node.depth === 0 ? '#ffffff' : '#ffffff'}
                          >
                            {node.depth === 0 ? (
                              <tspan x="0" dy="0">{truncateForNode(nodeName, 8)}</tspan>
                            ) : (
                              <tspan x="0" dy="0">{truncatedName}</tspan>
                            )}
                          </text>
                        </Group>
                      </IssueLink>
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

const IssueLink = styled.a`
  position: relative;
  z-index: 99999;
`; 