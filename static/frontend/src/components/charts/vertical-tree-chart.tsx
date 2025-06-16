import React, { useState, useMemo } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';
import { useForceUpdate } from './use-force-update';
import { LinkControls } from './link-controls';
import { useFetchIssuesByEpicId } from '../../hooks/use-fetch-issues-by-epic';
import { useFetchIssueById } from '../../hooks/use-fetch-issue-by-id';
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
  issuelinks?: any[];
  blockingIssues?: BlockingIssue[];
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
  
  // Helper function to extract blocking issues from issuelinks
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
  
  
  const transformDataToTree = ({ epic, issues }: { epic: Epic | null; issues: Issue[] }): TreeData => {
    
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return { name: 'Loading...', children: [] }; // Return minimal structure while loading
    }

    try {
      return {
        name: epic?.fields?.summary || 'Unknown Epic',
        key: epic?.key,
        summary: epic?.fields?.summary,
        priority: epic?.fields?.priority,
        assignee: epic?.fields?.assignee,
        status: epic?.fields?.status,
        labels: epic?.fields?.labels || [],
        issuelinks: epic?.fields?.issuelinks || [],
        blockingIssues: extractBlockingIssues(epic?.fields?.issuelinks || []),
        isEpic: true,
        children: issues.map(issue => {
          // Safely handle issue structure
          const issueFields = issue?.fields;
          const subtasks = issueFields?.subtasks || [];
          
          return {
            name: issueFields?.summary || issue?.key || 'Unknown Issue',
            key: issue?.key,
            summary: issueFields?.summary,
            priority: issueFields?.priority,
            assignee: issueFields?.assignee,
            status: issueFields?.status,
            labels: issueFields?.labels || [],
            issuelinks: issueFields?.issuelinks || [],
            blockingIssues: extractBlockingIssues(issueFields?.issuelinks || []),
            isEpic: false,
            children: subtasks.map(subtask => {
              return { 
                name: subtask?.key || 'Unknown Subtask',
                key: subtask?.key,
                summary: subtask?.key, // Subtasks only have key, not full fields
                priority: undefined,
                assignee: undefined,
                status: undefined,
                labels: [], // Subtasks don't have full fields data
                children: [], 
                issuelinks: [],
                blockingIssues: [], // Subtasks don't have full issuelinks data
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

  const transformedTreeData = transformDataToTree({ epic: rootEpicIssue, issues: issuesByEpic });

  const data = useMemo(() => {
    try {
      return hierarchy(transformedTreeData);
    } catch (error) {
      console.error("Error creating hierarchy:", error);
      return hierarchy({ name: 'Error', children: [] });
    }
  }, [issuesByEpic, rootEpicIssue]);
  
  // Don't render the chart until we have real data or there's an error
  if (!issuesByEpic && !rootEpicIssue) {
    return <div>Loading Epic Tree...</div>;
  }

  // Don't render if we only have loading state
  if (transformedTreeData.name === 'Loading...' && transformedTreeData.children?.length === 0) {
    return <div>Loading Epic Tree...</div>;
  }

  return totalWidth < 10 ? null : (
    <div>
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
                  const truncatedName = nodeName && typeof nodeName === 'string' && nodeName.length > 12 
                    ? nodeName.substring(0, 12) + '...' 
                    : nodeName || 'Unknown';
                  
                  const tooltipContent = (
                    <IssueTooltip
                      issueKey={nodeData.key}
                      summary={nodeData.summary}
                      priority={nodeData.priority}
                      assignee={nodeData.assignee}
                      status={nodeData.status}
                      labels={nodeData.labels}
                      blockingIssues={nodeData.blockingIssues}
                      isEpic={nodeData.isEpic}
                    />
                  );
                  
                  return (
                    <Tooltip content={tooltipContent} interactive key={index}>
                      <a 
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
                            fontSize={12}
                            fontFamily="Arial"
                            textAnchor="middle"
                            style={{ pointerEvents: 'none' }}
                            fill={node.depth === 0 ? '#ffffff' : '#ffffff'}
                          >
                            {truncatedName}
                          </text>
                        </Group>
                      </a>
                    </Tooltip>
                  );
                })}
              </Group>
            )}
          </Tree>
        </Group>
      </svg>
    </div>
  );
} 