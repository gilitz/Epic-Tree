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
    console.log('=== PARENT KEYS GENERATION ===');
    console.log('Issues by epic:', issuesByEpic);
    
    if (!issuesByEpic || !Array.isArray(issuesByEpic)) {
      console.log('No issues or not an array');
      return [];
    }
    
         const keys = issuesByEpic
       .filter(issue => {
         const hasSubtasks = issue?.fields?.subtasks && issue.fields.subtasks.length > 0;
         console.log(`Issue ${issue?.key}: has ${issue?.fields?.subtasks?.length || 0} subtasks (${hasSubtasks ? 'YES' : 'NO'})`);
         console.log(`  Issue ${issue?.key} subtasks field:`, issue?.fields?.subtasks);
         return hasSubtasks;
       })
      .map(issue => {
        console.log(`Adding parent key: ${issue.key}`);
        return issue.key;
      });
    
    console.log('Final parent keys:', keys);
    return keys;
  }, [issuesByEpic]);
  
  const { subtasks } = useFetchSubtasks({ parentKeys });
  
  // Debug the subtasks hook results
  console.log('=== SUBTASKS HOOK DEBUG ===');
  console.log('Parent keys for subtasks fetch:', parentKeys);
  console.log('Subtasks hook result:', subtasks);
  console.log('Subtasks count:', subtasks?.length || 0);
  console.log('Subtasks details:', subtasks?.map(st => ({ 
    key: st.key, 
    summary: st.fields?.summary, 
    parent: st.fields?.parent?.key 
  })) || []);

  // Add more detailed debugging about the data flow
  console.log('=== DATA FLOW DEBUG ===');
  console.log('Issues by epic loaded:', !!issuesByEpic);
  console.log('Issues by epic count:', issuesByEpic?.length || 0);
  console.log('Root epic loaded:', !!rootEpicIssue);
  console.log('Root epic key:', rootEpicIssue?.key);
  console.log('Subtasks loaded:', !!subtasks);
  console.log('Transform input - epic:', rootEpicIssue?.key, 'issues:', issuesByEpic?.length || 0, 'subtasks:', subtasks?.length || 0);
  
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
    
    console.log('=== TRANSFORM DATA DEBUG ===');
    console.log('Epic:', epic?.key, epic?.fields?.summary);
    console.log('Issues count:', issues?.length || 0);
    console.log('Subtasks data count:', subtasksData?.length || 0);
    console.log('Raw subtasks data:', subtasksData);

    try {
      // Create a map of subtasks by parent key for quick lookup
      const subtasksByParent = new Map<string, any[]>();
      if (subtasksData && Array.isArray(subtasksData)) {
        console.log('Processing subtasks data:', subtasksData.length, 'subtasks found');
        subtasksData.forEach((subtask, index) => {
          console.log(`Subtask ${index}:`, subtask);
          const parentKey = subtask?.fields?.parent?.key;
          console.log(`Subtask ${subtask?.key} parent key:`, parentKey);
          if (parentKey) {
            if (!subtasksByParent.has(parentKey)) {
              subtasksByParent.set(parentKey, []);
            }
            subtasksByParent.get(parentKey)!.push(subtask);
            console.log(`Added subtask ${subtask.key} to parent ${parentKey}`);
          } else {
            console.log(`Subtask ${subtask?.key} has no parent key!`);
          }
        });
      } else {
        console.log('No subtasks data or not an array');
      }
      
      console.log('Subtasks by parent map:', subtasksByParent);

      const treeData = {
        name: epic?.fields?.summary || epic?.key || 'Epic Tree',
        key: epic?.key || 'ET-2',
        summary: epic?.fields?.summary || 'Loading epic...',
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
        children: (!issues || !Array.isArray(issues) || issues.length === 0) ? [] : issues.map((issue, issueIndex) => {
          // Safely handle issue structure
          const issueFields = issue?.fields;
          const issueSubtasks = subtasksByParent.get(issue?.key) || [];
          
          console.log(`\nIssue ${issueIndex} (${issue?.key}):`, {
            key: issue?.key,
            summary: issueFields?.summary,
            subtasksCount: issueSubtasks.length,
            subtasks: issueSubtasks.map(st => ({ key: st.key, summary: st.fields?.summary }))
          });
          
          const issueNode = {
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
            children: issueSubtasks.map((subtask, subtaskIndex) => {
              const subtaskFields = subtask?.fields;
              console.log(`  Subtask ${subtaskIndex} (${subtask?.key}):`, {
                key: subtask?.key,
                summary: subtaskFields?.summary,
                parent: subtaskFields?.parent?.key
              });
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
          
          console.log(`Issue ${issue?.key} final children count:`, issueNode.children.length);
          return issueNode;
        })
      };
      
      console.log('=== FINAL TREE STRUCTURE ===');
      console.log('Epic children count:', treeData.children.length);
      treeData.children.forEach((child, index) => {
        console.log(`Child ${index} (${child.key}): ${child.children.length} subtasks`);
      });
      
      return treeData;
    } catch (error) {
      console.error("Error transforming data:", error);
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

  // Add a simple test data structure to ensure we always have something to render
  const testTreeData = {
    name: 'Test Epic',
    key: 'TEST-1',
    summary: 'Test Epic Node',
    isEpic: true,
    children: [
      {
        name: 'Test Story 1',
        key: 'TEST-2',
        summary: 'Test Story Node 1',
        isEpic: false,
        children: [
          {
            name: 'Test Subtask 1',
            key: 'TEST-3',
            summary: 'Test Subtask Node 1',
            isEpic: false,
            children: []
          }
        ]
      },
      {
        name: 'Test Story 2',
        key: 'TEST-4',
        summary: 'Test Story Node 2',
        isEpic: false,
        children: []
      }
    ]
  };

  // Use real data if we have issues, otherwise use test data
  const finalTreeData = (issuesByEpic && issuesByEpic.length > 0) || (rootEpicIssue && rootEpicIssue.key)
    ? transformedTreeData 
    : testTreeData;

  console.log('=== FINAL DATA CHOICE ===');
  console.log('Using data:', finalTreeData === testTreeData ? 'TEST DATA' : 'REAL DATA');
  console.log('Final tree data:', finalTreeData);
  console.log('Real data children count:', transformedTreeData.children?.length || 0);
  if (transformedTreeData.children) {
    transformedTreeData.children.forEach((child, index) => {
      console.log(`Child ${index}: ${child.key} has ${child.children?.length || 0} subtasks`);
    });
  }
  
  

  const data = useMemo(() => {
    try {
      const hierarchy_data = hierarchy(finalTreeData);
      console.log('=== HIERARCHY DEBUG ===');
      console.log('Root node:', hierarchy_data);
      console.log('Descendants count:', hierarchy_data.descendants().length);
      hierarchy_data.descendants().forEach((node, index) => {
        console.log(`Hierarchy node ${index}:`, {
          depth: node.depth,
          data: node.data,
          hasChildren: !!node.children,
          childrenCount: node.children?.length || 0
        });
      });
      return hierarchy_data;
    } catch (error) {
      console.error("Error creating hierarchy:", error);
      return hierarchy({ name: 'Error', children: [] });
    }
  }, [finalTreeData]);
  
  // Add debug logging for layout calculations
  console.log('=== LAYOUT DEBUG ===');
  console.log('Total dimensions:', { totalWidth, totalHeight });
  console.log('Margins:', margin);
  console.log('Inner dimensions:', { innerWidth, innerHeight });
  console.log('Size:', { sizeWidth, sizeHeight });
  console.log('Origin:', origin);
  console.log('Layout:', layout, 'Orientation:', orientation);
  
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
                {console.log('=== TREE RENDER DEBUG ===')}
                {console.log('Tree object:', tree)}
                {console.log('Tree links count:', (tree.links() || []).length)}
                {console.log('Tree descendants count:', (tree.descendants() || []).length)}
                {console.log('Origin:', origin)}
                
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
                  const width = 60;
                  const height = 30;

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
                  
                  // Debug logging for node structure and positions
                  console.log(`Node ${index}: depth=${node.depth}, key=${nodeData.key}, name=${nodeName}, position=(${left}, ${top}), raw=(${node.x}, ${node.y})`);
                  
                  // Helper function to truncate text for node display
                  const truncateForNode = (text: string, maxLength: number = 10): string => {
                    if (!text || typeof text !== 'string') return 'Unknown';
                    if (text.length <= maxLength) return text;
                    return text.substring(0, maxLength) + '...';
                  };
                  
                  const truncatedName = truncateForNode(nodeName);
                  
                  // Different colors for different node types
                  const getNodeColors = (depth: number, hasChildren: boolean) => {
                    if (depth === 0) {
                      return {
                        stroke: '#fd9b93',
                        fill: '#272b4d',
                        strokeWidth: 3
                      };
                    } else if (depth === 1) {
                      return {
                        stroke: hasChildren ? '#03c0dc' : '#26deb0',
                        fill: '#272b4d',
                        strokeWidth: 2
                      };
                    } else {
                      return {
                        stroke: '#ffc400',
                        fill: '#272b4d',
                        strokeWidth: 1
                      };
                    }
                  };
                  
                  const nodeColors = getNodeColors(node.depth, (node.children?.length || 0) > 0);
                  
                  // Handle node click
                  const handleNodeClick = async (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (nodeData.key) {
                      try {
                        console.log(`Attempting to open issue: ${nodeData.key}`);
                        await router.open(`/browse/${nodeData.key}`);
                      } catch (error) {
                        console.error('Failed to open issue via router:', error);
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
                    <Tooltip content={tooltipContent} interactive key={index}>
                      <g transform={`translate(${left}, ${top})`}>
                        {/* Direct SVG rect - no styled components */}
                        <rect
                          height={height}
                          width={width}
                          y={-height / 2}
                          x={-width / 2}
                          fill={nodeColors.fill}
                          stroke={nodeColors.stroke}
                          strokeWidth={nodeColors.strokeWidth}
                          strokeDasharray={
                            node.depth === 0 
                              ? '0' 
                              : node.depth === 1 && (node.children?.length || 0) > 0
                                ? '0' 
                                : '2,2'
                          }
                          strokeOpacity={1}
                          rx={node.depth === 0 ? 5 : node.depth === 2 ? 8 : 3}
                          style={{ cursor: 'pointer' }}
                          onClick={handleNodeClick}
                        />

                        <text
                          dy=".33em"
                          fontSize={node.depth === 0 ? 9 : node.depth === 2 ? 8 : 10}
                          fontFamily="Arial"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none' }}
                          fill="#ffffff"
                        >
                          <tspan x="0" dy="0">
                            {node.depth === 0 ? truncateForNode(nodeName, 6) : truncatedName} 
                          </tspan>
                        </text>
                        
                        {/* Debug: Show node depth */}
                        <text
                          dy="1.2em"
                          fontSize="7"
                          fontFamily="Arial"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none' }}
                          fill="#888"
                        >
                          <tspan x="0" dy="0">d:{node.depth} k:{nodeData.key}</tspan>
                        </text>
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

const IssueLink = styled.a`
  position: relative;
  z-index: 99999;
`;

const NodeGroup = styled.div`
  position: relative;
  z-index: 99999;
`; 