/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';

import { useFetchIssuesByEpicId } from '../../hooks/use-fetch-issues-by-epic';
import { useFetchIssueById } from '../../hooks/use-fetch-issue-by-id';
import { useFetchSubtasksByKeys } from '../../hooks/use-fetch-subtasks-by-keys';
import { useFetchCurrentContext } from '../../hooks/use-fetch-current-context';
import { useTheme } from '../../theme/theme-context';
import getLinkComponent from './get-link-component';

// Import new components and utilities
import { VerticalTreeChartProps, TreeData } from './types';
import { transformDataToTree, filterTreeData } from './tree-data-utils';
import { TreeNode } from './tree-node';
import { LoadingComponent, NetworkErrorComponent } from './loading-error-components';
import { FilterBar } from '../filter-bar';
import { useFilters } from '../../contexts/filter-context';

const defaultMargin = { top: 30, left: 70, right: 40, bottom: 30 };

// Constants for fixed spacing
const NODE_WIDTH = 120;
const NODE_HEIGHT = 28;
const EPIC_NODE_WIDTH = NODE_WIDTH * 1.5; // 50% longer
const EPIC_NODE_HEIGHT = NODE_HEIGHT * 2 - 12; // Double height minus 4px
const HORIZONTAL_SPACING = 180; // Fixed horizontal spacing between nodes (vertical mode)
const VERTICAL_SPACING = 65; // Fixed vertical spacing between levels (vertical mode)
// Horizontal mode specific spacing - bigger node spacing
const HORIZONTAL_MODE_NODE_SPACING = 50; // Much bigger vertical spacing between nodes (no overlap)
const MIN_CONTAINER_PADDING = 50; // Minimum padding around the tree

export function VerticalTreeChart({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: VerticalTreeChartProps): JSX.Element | null {
  
  const { colors, isDarkTheme, toggleTheme } = useTheme();
  const { filters } = useFilters();
  const [layout, _setLayout] = useState<'polar' | 'cartesian'>('cartesian');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const linkType = 'diagonal';
  const [stepPercent, _setStepPercent] = useState<number>(0.5);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltipOpenNodeId, setTooltipOpenNodeId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const _innerWidth = totalWidth - margin.left - margin.right;
  const _innerHeight = totalHeight - margin.top - margin.bottom;

  const LinkComponent = getLinkComponent({ layout, linkType, orientation }) as any;
  
  // Get the current issue context
  const { currentIssueKey, loading: contextLoading, error: contextError } = useFetchCurrentContext();
  
  // Only proceed if we have a valid epic key
  const epicId = currentIssueKey;
  
  // Only fetch data if we have a valid epic ID
  const { issuesByEpic } = useFetchIssuesByEpicId({ epicId: epicId || '' });
  const { issue: rootEpicIssue } = useFetchIssueById({ issueId: epicId || '' });
  
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

  // Check if we have fully loaded data (epic + issues + subtasks if any exist)
  const isFullyLoaded = useMemo(() => {
    if (!rootEpicIssue) return false;
    if (!issuesByEpic) return false;
    
    // If we have issues with subtasks, wait for subtasks to load too
    const hasIssuesWithSubtasks = issuesByEpic.some(issue => 
      issue.fields?.subtasks && Array.isArray(issue.fields.subtasks) && issue.fields.subtasks.length > 0
    );
    
    if (hasIssuesWithSubtasks && subtaskKeys.length > 0 && (!subtasks || subtasks.length === 0)) {
      return false;
    }
    
    return true;
  }, [rootEpicIssue, issuesByEpic, subtasks, subtaskKeys]);

  // Set initialization state when fully loaded
  React.useEffect(() => {
    if (isFullyLoaded && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isFullyLoaded, hasInitialized]);

  // Apply filters to the tree data
  const finalTreeData = useMemo(() => {
    if (!transformedTreeData) return transformedTreeData;
    
    const filteredData = filterTreeData(transformedTreeData, filters);
    return filteredData || transformedTreeData;
  }, [transformedTreeData, filters]);

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
      // Dynamic level spacing calculation: max nodes at any level * (node height + top/bottom padding)
      const dynamicLevelSpacing = maxNodesAtLevel * (NODE_HEIGHT - 12); // 18px top + 18px bottom = 36px total padding
      // Dynamic width calculation based on tree depth using dynamic spacing
      calculatedTreeWidth = (maxDepth + 1) * dynamicLevelSpacing;
      // Dynamic height calculation based on maximum nodes at any level
      calculatedTreeHeight = maxNodesAtLevel * HORIZONTAL_MODE_NODE_SPACING;
    }

    return {
      treeWidth: calculatedTreeWidth,
      treeHeight: calculatedTreeHeight,
      origin: { x: MIN_CONTAINER_PADDING, y: MIN_CONTAINER_PADDING }
    };
  }, [data, orientation]);

  // Calculate SVG dimensions (tree size + padding)
  const svgWidth = treeWidth + (MIN_CONTAINER_PADDING * 2) + margin.left + margin.right;
  const svgHeight = treeHeight + (MIN_CONTAINER_PADDING * 2) + margin.top + margin.bottom;

  // Handle context loading and errors first
  if (contextLoading) {
    return <LoadingComponent />;
  }

  if (contextError || !epicId) {
    return (
      <NoEpicContainer colors={colors}>
        <NoEpicIcon>📊</NoEpicIcon>
        <NoEpicTitle colors={colors}>Epic Tree View</NoEpicTitle>
        <NoEpicMessage colors={colors}>
          This panel displays the tree structure of Epic issues and their child stories/tasks.
        </NoEpicMessage>
        <NoEpicSubtitle colors={colors}>
          Please navigate to an Epic issue to see its tree visualization.
        </NoEpicSubtitle>
      </NoEpicContainer>
    );
  }

  // Handle network error states
  if (rootEpicIssue?.fields?.summary?.includes('Network Error') || 
      rootEpicIssue?.fields?.summary?.includes('Error loading')) {
    return <NetworkErrorComponent />;
  }

  // Show initial loading only if we haven't fully loaded yet and haven't initialized
  if (!isFullyLoaded && !hasInitialized) {
    // Show epic key/name if we have it, otherwise show generic loading
    if (rootEpicIssue) {
      return (
        <InitialLoadingContainer colors={colors}>
          <EpicKeyDisplay colors={colors}>
            {rootEpicIssue.key}: {rootEpicIssue.fields?.summary || 'Loading...'}
          </EpicKeyDisplay>
          <CenteredLoadingSpinner colors={colors} />
          <LoadingText colors={colors}>Loading full Epic tree...</LoadingText>
        </InitialLoadingContainer>
      );
    } else {
      return <LoadingComponent />;
    }
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
      } else if ((element as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (element as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      } else if ((element as unknown as { msRequestFullscreen?: () => void }).msRequestFullscreen) {
        (element as unknown as { msRequestFullscreen: () => void }).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      } else if ((document as unknown as { msExitFullscreen?: () => void }).msExitFullscreen) {
        (document as unknown as { msExitFullscreen: () => void }).msExitFullscreen();
      }
    }
  };



  return totalWidth < 10 ? null : (
    <ChartContainer colors={colors}>
      {issuesByEpic && issuesByEpic.length > 0 && rootEpicIssue && (
        <FilterBar 
          issuesByEpic={issuesByEpic} 
          epicKey={rootEpicIssue.key || epicId}
          orientation={orientation}
          isDarkTheme={isDarkTheme}
          toggleOrientation={toggleOrientation}
          toggleTheme={toggleTheme}
          toggleFullScreen={toggleFullScreen}
        />
      )}
      <ScrollableContainer colors={colors} $orientation={orientation}>
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
            <filter id="hover-shadow-purple" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.8"/>
            </filter>
          </defs>
          
          <Group top={margin.top} left={margin.left}>
            <Tree
              root={data}
              size={[treeWidth, treeHeight]}
              separation={() => {
                // Fixed separation based on constants
                if (orientation === 'vertical') {
                  return HORIZONTAL_SPACING / treeWidth;
                } else {
                  return HORIZONTAL_MODE_NODE_SPACING / treeHeight;
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
                    
                    // Use larger dimensions for epic nodes
                    const nodeWidth = nodeData.isEpic ? EPIC_NODE_WIDTH : NODE_WIDTH;
                    const nodeHeight = nodeData.isEpic ? EPIC_NODE_HEIGHT : NODE_HEIGHT;
                    
                    return (
                      <TreeNode
                        key={index}
                        nodeData={nodeData}
                        width={nodeWidth}
                        height={nodeHeight}
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
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$orientation',
})<{ colors: any; $orientation: 'vertical' | 'horizontal' }>`
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  transition: border-color 0.3s ease;
  padding-left: ${props => props.$orientation === 'horizontal' ? '24px' : '0'};
  
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

// Initial loading styled components
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const InitialLoadingContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: ${props => props.colors.background.primary};
`;

const EpicKeyDisplay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.colors.text.primary};
  margin-bottom: 40px;
  text-align: center;
  max-width: 80%;
  word-wrap: break-word;
`;

const CenteredLoadingSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.colors.border.primary};
  border-top: 4px solid ${props => props.colors.interactive.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: 16px;
  color: ${props => props.colors.text.secondary};
  text-align: center;
`;

// No Epic styled components
const NoEpicContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: ${props => props.colors.background.primary};
  padding: 40px 20px;
  text-align: center;
`;

const NoEpicIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
`;

const NoEpicTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.colors.text.primary};
  margin-bottom: 16px;
`;

const NoEpicMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: 16px;
  color: ${props => props.colors.text.secondary};
  max-width: 500px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const NoEpicSubtitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: 14px;
  color: ${props => props.colors.text.tertiary};
  font-style: italic;
`;

 