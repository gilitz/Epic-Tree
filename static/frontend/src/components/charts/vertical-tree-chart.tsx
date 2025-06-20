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
import { useTheme } from '../../theme/theme-context';
import getLinkComponent from './get-link-component';

// Import new components and utilities
import { VerticalTreeChartProps, TreeData } from './types';
import { transformDataToTree } from './tree-data-utils';
import { TreeNode } from './tree-node';
import { ToggleButtons } from './toggle-buttons';
import { LoadingComponent, NetworkErrorComponent, LoadingIssuesComponent } from './loading-error-components';

const defaultMargin = { top: 30, left: 40, right: 40, bottom: 30 };

// Constants for fixed spacing
const NODE_WIDTH = 120;
const NODE_HEIGHT = 28;
const HORIZONTAL_SPACING = 180; // Fixed horizontal spacing between nodes
const VERTICAL_SPACING = 50; // Fixed vertical spacing between levels
const MIN_CONTAINER_PADDING = 50; // Minimum padding around the tree

export function VerticalTreeChart({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: VerticalTreeChartProps): JSX.Element | null {
  
  const { colors, isDarkTheme, toggleTheme } = useTheme();
  const [layout, _setLayout] = useState<'polar' | 'cartesian'>('cartesian');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const linkType = 'diagonal';
  const [stepPercent, _setStepPercent] = useState<number>(0.5);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltipOpenNodeId, setTooltipOpenNodeId] = useState<string | null>(null);

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;

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

  // Calculate tree dimensions based on actual data
  const { treeWidth, treeHeight, origin } = useMemo(() => {
    if (!data) {
      return { treeWidth: 0, treeHeight: 0, origin: { x: 0, y: 0 } };
    }

    // Calculate the maximum width and height needed for the tree
    const descendants = data.descendants();
    const maxDepth = Math.max(...descendants.map(d => d.depth));
    
    // Count nodes at each level to determine maximum width needed
    const nodesByLevel: { [key: number]: number } = {};
    descendants.forEach(node => {
      nodesByLevel[node.depth] = (nodesByLevel[node.depth] || 0) + 1;
    });
    const maxNodesAtLevel = Math.max(...Object.values(nodesByLevel));

    let calculatedTreeWidth: number;
    let calculatedTreeHeight: number;

    if (orientation === 'vertical') {
      // For vertical orientation: width = max nodes horizontally, height = depth vertically
      calculatedTreeWidth = maxNodesAtLevel * HORIZONTAL_SPACING;
      calculatedTreeHeight = (maxDepth + 1) * VERTICAL_SPACING;
    } else {
      // For horizontal orientation: width = depth horizontally, height = max nodes vertically  
      calculatedTreeWidth = HORIZONTAL_SPACING * 2.1;
      calculatedTreeHeight = VERTICAL_SPACING * 10;
    }

    return {
      treeWidth: calculatedTreeWidth,
      treeHeight: calculatedTreeHeight,
      origin: { x: MIN_CONTAINER_PADDING, y: MIN_CONTAINER_PADDING }
    };
  }, [data, orientation, innerWidth, innerHeight]);

  // Calculate SVG dimensions (tree size + padding)
  const svgWidth = treeWidth + (MIN_CONTAINER_PADDING * 2) + margin.left + margin.right;
  const svgHeight = treeHeight + (MIN_CONTAINER_PADDING * 2) + margin.top + margin.bottom;

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

  // Link type is now fixed to curve, no toggle needed

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



  return totalWidth < 10 ? null : (
    <ChartContainer colors={colors}>
      <ToggleButtons
        orientation={orientation}
        isDarkTheme={isDarkTheme}
        toggleOrientation={toggleOrientation}
        toggleTheme={toggleTheme}
        toggleFullScreen={toggleFullScreen}
      />
      <ScrollableContainer colors={colors}>
        <svg 
          width={svgWidth} 
          height={svgHeight}
          style={{ minWidth: totalWidth, minHeight: totalHeight }}
        >
          <defs>
            <LinearGradient id="links-gradient" from={colors.tree.lines} to={colors.tree.linesHover} />
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
              size={[treeWidth, treeHeight]}
              separation={(_a: any, _b: any) => {
                // Fixed separation based on constants
                if (orientation === 'vertical') {
                  return HORIZONTAL_SPACING / treeWidth;
                } else {
                  return VERTICAL_SPACING / treeHeight;
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
                      stroke={colors.tree.lines}
                      strokeWidth="1.5"
                      fill="none"
                    />
                  ))}

                  {(tree.descendants() || []).map((node, index) => {
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
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
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
      </ScrollableContainer>
    </ChartContainer>
  );
}

// Styled Components
const ChartContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  width: 100%;
  height: 100vh;
  position: relative;
  background: ${props => props.colors.background.primary};
  transition: background-color 0.3s ease;
  
  .clickable-node:active {
    filter: brightness(0.85) !important;
  }
`;

const ScrollableContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  width: 100%;
  height: calc(100vh - 60px); /* Account for toggle buttons */
  overflow: auto;
  position: relative;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.colors.surface.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors.border.secondary};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.colors.text.tertiary};
    }
  }
  
  /* For Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.colors.border.secondary} ${props => props.colors.surface.secondary};
`;

 