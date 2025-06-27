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
import { LargeLoadingSpinner } from '../loading-spinner';
import { Minimap } from './minimap';
import { EpicBreakdown } from '../epic-breakdown';

const defaultMargin = { top: 20, left: 40, right: 20, bottom: 20 };

// Constants for fixed spacing
const NODE_WIDTH = 120;
const NODE_HEIGHT = 28;
const EPIC_NODE_WIDTH = NODE_WIDTH * 1.5; // 50% longer
const EPIC_NODE_HEIGHT = NODE_HEIGHT * 2 - 12; // Double height minus 4px
const HORIZONTAL_SPACING = 180; // Fixed horizontal spacing between nodes (vertical mode)
const VERTICAL_SPACING = 65; // Fixed vertical spacing between levels (vertical mode)
// Horizontal mode specific spacing - bigger node spacing
const HORIZONTAL_MODE_NODE_SPACING = 50; // Much bigger vertical spacing between nodes (no overlap)


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
  const [actualNodeBounds, setActualNodeBounds] = useState<{ minY: number; maxY: number } | null>(null);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const _innerWidth = totalWidth - margin.left - margin.right;
  const _innerHeight = totalHeight - margin.top - margin.bottom;

  const LinkComponent = getLinkComponent({ layout, linkType, orientation }) as any;
  
  // Get the current issue context
  const { currentIssueKey, loading: contextLoading, error: contextError } = useFetchCurrentContext();
  
  // Only proceed if we have a valid epic key
  const epicId = currentIssueKey;
  
  // Only fetch data if we have a valid epic ID
  const { issuesByEpic, loading: issuesLoading, error: _issuesError } = useFetchIssuesByEpicId({ epicId: epicId || '' });
  const { issue: rootEpicIssue, loading: epicLoading, error: _epicError } = useFetchIssueById({ issueId: epicId || '' });
  
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
  
  const { subtasks, loading: subtasksLoading, error: _subtasksError } = useFetchSubtasksByKeys({ subtaskKeys });

  const transformedTreeData = transformDataToTree({ epic: rootEpicIssue, issues: issuesByEpic, subtasksData: subtasks });

  // Check if we are still loading any data
  const isLoading = useMemo(() => {
    // If we don't have an epic ID, we're not loading
    if (!epicId) return false;
    
    // Check if any of the main data fetches are still loading
    if (epicLoading || issuesLoading) return true;
    
    // If we have subtask keys to fetch, check if subtasks are still loading
    if (subtaskKeys.length > 0 && subtasksLoading) return true;
    
    return false;
  }, [epicId, epicLoading, issuesLoading, subtaskKeys.length, subtasksLoading]);

  // Check if we have fully loaded data (epic + issues + subtasks if any exist)
  const isFullyLoaded = useMemo(() => {
    // If we're still loading, we're not fully loaded
    if (isLoading) return false;
    
    // Check for data availability
    if (!rootEpicIssue) return false;
    if (!issuesByEpic) return false;
    
    // If we have issues with subtasks, make sure subtasks are loaded too
    const hasIssuesWithSubtasks = issuesByEpic.some(issue => 
      issue.fields?.subtasks && Array.isArray(issue.fields.subtasks) && issue.fields.subtasks.length > 0
    );
    
    if (hasIssuesWithSubtasks && subtaskKeys.length > 0 && (!subtasks || subtasks.length === 0)) {
      return false;
    }
    
    return true;
  }, [isLoading, rootEpicIssue, issuesByEpic, subtasks, subtaskKeys]);

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
      calculatedTreeWidth = maxNodesAtLevel * HORIZONTAL_SPACING + 50; // Much tighter fit for vertical
      calculatedTreeHeight = (maxDepth + 1) * VERTICAL_SPACING;
    } else {
      // For horizontal orientation: FIXED spacing between nodes regardless of count
      const LEVEL_SPACING = 300; // Increased spacing between levels to match layout logic
      calculatedTreeWidth = (maxDepth + 1) * LEVEL_SPACING + 150; // Reduced extra width to minimize right padding
      
      // Calculate height more accurately by considering ALL nodes, not just max at one level
      let totalNodesHeight = 0;
      const TASK_NODE_SPACING = 60; // Same as in layout logic
      const SUBTASK_NODE_SPACING = 40; // Same as in layout logic
      
      // Count nodes by depth to calculate actual space needed
      const nodesByDepth: { [key: number]: number } = {};
      descendants.forEach(node => {
        nodesByDepth[node.depth] = (nodesByDepth[node.depth] || 0) + 1;
      });
      
      // Calculate space needed for each depth level
      Object.keys(nodesByDepth).forEach(depthStr => {
        const depth = parseInt(depthStr);
        const nodeCount = nodesByDepth[depth];
        
        if (depth === 0) {
          // Epic node
          totalNodesHeight += EPIC_NODE_HEIGHT;
        } else if (nodeCount > 0) {
          // Use appropriate spacing based on depth
          const spacing = depth === 1 ? TASK_NODE_SPACING : SUBTASK_NODE_SPACING;
          const levelHeight = (nodeCount - 1) * spacing + NODE_HEIGHT;
          totalNodesHeight = Math.max(totalNodesHeight, levelHeight);
        }
      });
      
             // Add generous padding to prevent any cutting
       const TOP_PADDING = 150; // Much more top padding
       const BOTTOM_PADDING = 150; // Reduced bottom padding to cut dead space
       calculatedTreeHeight = totalNodesHeight + TOP_PADDING + BOTTOM_PADDING;
    }

    return {
      treeWidth: calculatedTreeWidth,
      treeHeight: calculatedTreeHeight,
      origin: { 
        x: orientation === 'horizontal' ? 200 : 10, // Much more left padding for horizontal mode
        y: 10
      }
    };
  }, [data, orientation]);

  // Calculate SVG dimensions - much tighter for vertical, optimized for horizontal
  const svgWidth = treeWidth + margin.left + margin.right + (orientation === 'horizontal' ? EPIC_NODE_WIDTH + 200 : 10); // Much less right padding for vertical
  
  // Calculate SVG height based on actual node bounds if available, otherwise use calculated height
  // This ensures the SVG height fits tightly around the actual content
  const svgHeight = useMemo(() => {
    if (actualNodeBounds && orientation === 'vertical') {
      // Only use tight bounds for vertical mode
      const TREE_PADDING = 10; // Very minimal padding
      const actualTreeHeight = (actualNodeBounds.maxY - actualNodeBounds.minY) + (TREE_PADDING * 2);
      return actualTreeHeight + margin.top + margin.bottom + 40; // Just enough space for content
    }
    // For horizontal mode or when bounds not available, use calculated height with more padding
    const extraPadding = orientation === 'horizontal' ? 200 : 40; // Reduced bottom padding for horizontal to cut dead space
    return treeHeight + margin.top + margin.bottom + extraPadding;
  }, [actualNodeBounds, treeHeight, margin, orientation]);

  // Effect to measure actual node bounds after Tree component renders
  React.useEffect(() => {
    if (!svgRef.current || !data) return;

    const measureNodeBounds = () => {
      const svg = svgRef.current;
      if (!svg) return;

      // Find all TreeNode elements
      const nodeElements = svg.querySelectorAll('[data-testid="tree-node"]');
      
      if (nodeElements.length === 0) return;

      let minY = Infinity;
      let maxY = -Infinity;

      nodeElements.forEach((element) => {
        // Get the transform attribute to extract the Y position
        const transform = element.getAttribute('transform');
        if (!transform) return;

        const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (!translateMatch) return;

        const nodeY = parseFloat(translateMatch[2]);
        
        // Find the rect element within this node to get height
        const rectElement = element.querySelector('rect:last-of-type'); // Get the main node rect (not the background)
        if (!rectElement) return;

        const height = parseFloat(rectElement.getAttribute('height') || '0');
        const y = parseFloat(rectElement.getAttribute('y') || '0');
        
        // Calculate actual top and bottom positions
        const nodeTop = nodeY + y; // y is negative (e.g., -height/2)
        const nodeBottom = nodeY + y + height;
        
        minY = Math.min(minY, nodeTop);
        maxY = Math.max(maxY, nodeBottom);
      });

      if (minY !== Infinity && maxY !== -Infinity) {
        setActualNodeBounds({ minY, maxY });
      }
    };

    // Measure after a short delay to ensure Tree component has rendered
    const timeoutId = setTimeout(measureNodeBounds, 100);
    return () => clearTimeout(timeoutId);
  }, [data, orientation, finalTreeData]);

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

  // Show loading state if we're still loading OR if we haven't fully loaded yet
  if (isLoading || !isFullyLoaded) {
    // Show epic key/name if we have it, otherwise show generic loading
    if (rootEpicIssue && !epicLoading) {
      return (
        <InitialLoadingContainer colors={colors}>
          <EpicKeyDisplay colors={colors}>
            {rootEpicIssue.key}: {rootEpicIssue.fields?.summary || 'Loading...'}
          </EpicKeyDisplay>
          <LargeLoadingSpinner margin="0 0 20px 0" />
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

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 1.2)); // Max zoom 1.2x
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6)); // Min zoom 0.6x
  };



  return totalWidth < 10 ? null : (
    <ChartContainer colors={colors}>
      {isFullyLoaded && issuesByEpic && issuesByEpic.length > 0 && rootEpicIssue && (
        <FilterBar 
          issuesByEpic={issuesByEpic} 
          epicKey={rootEpicIssue.key || epicId}
          orientation={orientation}
          isDarkTheme={isDarkTheme}
          toggleOrientation={toggleOrientation}
          toggleTheme={toggleTheme}
          toggleFullScreen={toggleFullScreen}
          showBreakdown={showBreakdown}
          toggleBreakdown={() => setShowBreakdown(!showBreakdown)}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
        />
      )}
      
      {/* Conditionally render Epic Breakdown or Tree View */}
      {showBreakdown && rootEpicIssue ? (
        <EpicBreakdown
          epicSummary={String(rootEpicIssue.fields?.summary || '')}
          epicDescription={String(rootEpicIssue.fields?.description || '')}
          existingIssues={issuesByEpic}
          treeData={finalTreeData}
        />
      ) : (
        <ScrollableContainer ref={scrollContainerRef} colors={colors} $orientation={orientation}>
        <svg 
          ref={svgRef}
          width={svgWidth} 
          height={svgHeight}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
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
              size={orientation === 'horizontal' ? [treeWidth * 1.1, treeHeight * 1.5] : [treeWidth * 0.9, treeHeight]}
              separation={() => {
                // Fixed separation based on constants
                if (orientation === 'vertical') {
                  return HORIZONTAL_SPACING / treeWidth;
                } else {
                  return HORIZONTAL_MODE_NODE_SPACING / treeHeight;
                }
              }}
            >
              {(tree) => {
                const descendants = tree.descendants();
                
                // ONLY FOR HORIZONTAL MODE: Apply fixed spacing between nodes AND levels
                if (orientation === 'horizontal') {
                  const TASK_NODE_SPACING = 60; // 60px between task nodes (level 1)
                  const SUBTASK_NODE_SPACING = 40; // 40px between subtask nodes (level 2+) - smaller spacing
                  const FIXED_LEVEL_SPACING = 300; // FIXED 300px between levels (line length)
                  const MIN_NODE_SPACING = 35; // Minimum spacing to prevent overlaps
                  const nodesByDepth: { [depth: number]: any[] } = {};
                  const nodesByParent: { [parentId: string]: any[] } = {};
                  
                  // Group nodes by depth and by parent
                  descendants.forEach(node => {
                    if (!nodesByDepth[node.depth]) {
                      nodesByDepth[node.depth] = [];
                    }
                    nodesByDepth[node.depth].push(node);
                    
                    // Group by parent for centering children around parent
                    const parentId = node.parent ? node.parent.data.key || 'root' : 'root';
                    if (!nodesByParent[parentId]) {
                      nodesByParent[parentId] = [];
                    }
                    nodesByParent[parentId].push(node);
                  });
                  
                  // Process nodes by depth order (parents first, then children)
                  const sortedDepths = Object.keys(nodesByDepth).map(d => parseInt(d)).sort((a, b) => a - b);
                  
                  sortedDepths.forEach(depth => {
                    const nodesAtThisDepth = nodesByDepth[depth];
                    
                    // Set FIXED horizontal position based on depth (this controls line length)
                    const fixedHorizontalPosition = depth * FIXED_LEVEL_SPACING;
                    
                    if (depth === 0) {
                      // Root node (Epic) - position it with enough space for its larger width
                      const rootNode = nodesAtThisDepth[0];
                      // Ensure the epic node has enough space on the left with much more padding
                      const minPosition = EPIC_NODE_WIDTH / 2 + 200; // Much more static padding for better spacing
                      rootNode.x = Math.max(treeHeight / 2, minPosition);
                      rootNode.y = fixedHorizontalPosition;
                    } else {
                      // For child nodes, center them around their parent with collision detection
                      const processedNodes = new Set();
                      const placedNodes: { x: number; node: any }[] = [];
                      
                      nodesAtThisDepth.forEach(node => {
                        if (processedNodes.has(node)) return;
                        
                        const parentId = node.parent ? node.parent.data.key || 'root' : 'root';
                        const siblings = nodesByParent[parentId].filter(n => n.depth === depth);
                        
                        if (siblings.length === 1) {
                          // Single child - try to align with parent, but check for collisions
                          const singleNode = siblings[0];
                          let desiredX = singleNode.parent.x;
                          
                          // Check for collision with already placed nodes
                          const checkCollision = (x: number) => placedNodes.some(placed => Math.abs(placed.x - x) < MIN_NODE_SPACING);
                          while (checkCollision(desiredX)) {
                            desiredX += MIN_NODE_SPACING;
                          }
                          
                          singleNode.x = desiredX;
                          singleNode.y = fixedHorizontalPosition;
                          placedNodes.push({ x: desiredX, node: singleNode });
                          processedNodes.add(singleNode);
                        } else {
                          // Multiple siblings - center around parent with collision avoidance
                          const parentX = node.parent.x;
                          // Use different spacing based on depth: tasks (level 1) vs subtasks (level 2+)
                          const nodeSpacing = depth === 1 ? TASK_NODE_SPACING : SUBTASK_NODE_SPACING;
                          const totalSpaceNeeded = (siblings.length - 1) * nodeSpacing;
                          let startX = parentX - (totalSpaceNeeded / 2);
                          
                          // Check if this group would collide with existing nodes
                          const groupEndX = startX + totalSpaceNeeded;
                          const hasCollision = placedNodes.some(placed => 
                            (placed.x >= startX - MIN_NODE_SPACING && placed.x <= groupEndX + MIN_NODE_SPACING)
                          );
                          
                          // If collision detected, find a safe position
                          if (hasCollision) {
                            // Find the rightmost placed node and position after it
                            const rightmostX = Math.max(...placedNodes.map(p => p.x), 0);
                            startX = rightmostX + MIN_NODE_SPACING * 2;
                          }
                          
                          // Sort siblings to maintain consistent order
                          siblings.sort((a, b) => a.x - b.x);
                          
                          siblings.forEach((sibling, index) => {
                            const nodeX = startX + (index * nodeSpacing);
                            sibling.x = nodeX;
                            sibling.y = fixedHorizontalPosition;
                            placedNodes.push({ x: nodeX, node: sibling });
                            processedNodes.add(sibling);
                          });
                        }
                      });
                    }
                  });
                }
                
                return (
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

                    {descendants.map((node, index) => {
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
                );
              }}
            </Tree>
          </Group>
        </svg>
      </ScrollableContainer>
      )}
      
      {/* Minimap */}
      {!showBreakdown && isFullyLoaded && (
        <Minimap
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          containerWidth={totalWidth}
          containerHeight={totalHeight}
          scrollContainerRef={scrollContainerRef}
          treeData={finalTreeData}
          orientation={orientation}
        />
      )}
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
  display: flex;
  flex-direction: column;
  
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
  flex: 1;
  
  /* Responsive padding using clamp */
  padding: ${props => props.$orientation === 'horizontal' 
    ? 'clamp(8px, 2vh, 16px) clamp(8px, 2vw, 16px) clamp(30px, 8vh, 60px) clamp(8px, 2vw, 16px)' 
    : 'clamp(50px, 12vh, 100px) clamp(8px, 2vw, 16px) clamp(8px, 2vh, 16px) clamp(8px, 2vw, 16px)'};
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: clamp(4px, 1vw, 8px);
    height: clamp(4px, 1vw, 8px);
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.colors.surface.secondary};
    border-radius: clamp(2px, 0.5vw, 4px);
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors.border.secondary};
    border-radius: clamp(2px, 0.5vw, 4px);
    
    &:hover {
      background: ${props => props.colors.text.tertiary};
    }
  }
  
  /* For Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.colors.border.secondary} ${props => props.colors.surface.secondary};
`;

// Initial loading styled components

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
  padding: clamp(16px, 4vw, 40px);
`;

const EpicKeyDisplay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 600;
  color: ${props => props.colors.text.primary};
  margin-bottom: clamp(20px, 5vw, 40px);
  text-align: center;
  max-width: 90%;
  word-wrap: break-word;
  line-height: 1.4;
`;

const LoadingText = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: clamp(13px, 3vw, 16px);
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
  padding: clamp(16px, 4vw, 40px) clamp(12px, 3vw, 20px);
  text-align: center;
`;

const NoEpicIcon = styled.div`
  font-size: clamp(40px, 8vw, 64px);
  margin-bottom: clamp(16px, 4vw, 24px);
  opacity: 0.7;
`;

const NoEpicTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: clamp(18px, 4.5vw, 28px);
  font-weight: 600;
  color: ${props => props.colors.text.primary};
  margin-bottom: clamp(10px, 2.5vw, 16px);
  line-height: 1.3;
`;

const NoEpicMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: clamp(13px, 3vw, 16px);
  color: ${props => props.colors.text.secondary};
  max-width: min(500px, 90vw);
  line-height: 1.5;
  margin-bottom: clamp(8px, 2vw, 12px);
`;

const NoEpicSubtitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  font-size: clamp(11px, 2.5vw, 14px);
  color: ${props => props.colors.text.tertiary};
  font-style: italic;
`;

 