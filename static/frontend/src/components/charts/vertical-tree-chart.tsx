/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';

import { useFetchIssuesByEpicId } from '../../hooks/use-fetch-issues-by-epic';
import { useFetchIssueById } from '../../hooks/use-fetch-issue-by-id';
import { useFetchSubtasksByKeys } from '../../hooks/use-fetch-subtasks-by-keys';
import getLinkComponent from './get-link-component';

// Import new components and utilities
import { VerticalTreeChartProps, TreeData } from './types';
import { transformDataToTree } from './tree-data-utils';
import { TreeNode } from './tree-node';
import { ToggleButtons } from './toggle-buttons';
import { LoadingComponent, NetworkErrorComponent, LoadingIssuesComponent } from './loading-error-components';

const defaultMargin = { top: 30, left: 40, right: 40, bottom: 30 };

export function VerticalTreeChart({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: VerticalTreeChartProps): JSX.Element | null {
  
  const [layout, _setLayout] = useState<'polar' | 'cartesian'>('cartesian');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const [linkType, setLinkType] = useState<'diagonal' | 'step' | 'curve' | 'line'>('step');
  const [stepPercent, _setStepPercent] = useState<number>(0.5);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltipOpenNodeId, setTooltipOpenNodeId] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

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
      sizeWidth = innerWidth * 0.8; // Use 80% of available width
      sizeHeight = innerHeight * 0.8; // Use 80% of available height
    } else {
      sizeWidth = innerHeight * 0.8; // Use 80% of available height
      sizeHeight = innerWidth * 0.8; // Use 80% of available width
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
    return <LoadingComponent />;
  }

  // Handle network error states
  if (rootEpicIssue?.fields?.summary?.includes('Network Error') || 
      rootEpicIssue?.fields?.summary?.includes('Error loading')) {
    return <NetworkErrorComponent />;
  }

  // Don't render if we only have loading state
  if (transformedTreeData.name === 'Loading...' && transformedTreeData.children?.length === 0) {
    return <LoadingIssuesComponent />;
  }

  // Toggle orientation between vertical and horizontal
  const toggleOrientation = () => {
    setOrientation(orientation === 'vertical' ? 'horizontal' : 'vertical');
  };

  // Toggle link type between line, diagonal, and step
  const toggleLinkType = () => {
    if (linkType === 'line') {
      setLinkType('diagonal');
    } else if (linkType === 'diagonal') {
      setLinkType('step');
    } else {
      setLinkType('line');
    }
  };

  // Toggle full screen
  const toggleFullScreen = () => {
    const element = document.documentElement;
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return totalWidth < 10 ? null : (
    <ChartContainer isDarkTheme={isDarkTheme}>
      <ToggleButtons
        orientation={orientation}
        linkType={linkType}
        isDarkTheme={isDarkTheme}
        toggleOrientation={toggleOrientation}
        toggleLinkType={toggleLinkType}
        toggleTheme={toggleTheme}
        toggleFullScreen={toggleFullScreen}
      />
      <svg width="100%" height="100%" viewBox={`0 0 ${totalWidth} ${totalHeight}`}>
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
        
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={data}
            size={[sizeWidth, sizeHeight]}
            separation={(a: any, b: any) => {
              // Reduced separation values for tighter spacing
              if (a?.parent === b?.parent) {
                // Siblings - tight spacing
                return 0.5;
              } else {
                // Non-siblings - moderate spacing
                return 0.8;
              }
            }}
          >
            {(tree) => (
              <Group top={origin.y + 10} left={origin.x + 50}>
                
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
                  const width = 120; // Reduced width for more compact nodes
                  const height = 28; // Reduced height for more compact nodes

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
                  
                  return (
                    <TreeNode
                      key={index}
                      nodeData={nodeData}
                      width={width}
                      height={height}
                      left={left}
                      top={top}
                      hoveredNodeId={hoveredNodeId}
                      tooltipOpenNodeId={tooltipOpenNodeId}
                      setHoveredNodeId={setHoveredNodeId}
                      setTooltipOpenNodeId={setTooltipOpenNodeId}
                    />
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
const ChartContainer = styled.div<{ isDarkTheme: boolean }>`
  width: 100%;
  height: 100vh;
  position: relative;
  background: ${props => props.isDarkTheme ? '#1a1a1a' : '#f8fafc'};
  transition: background-color 0.3s ease;
  
  .clickable-node:active {
    filter: brightness(0.85) !important;
  }
`;

 