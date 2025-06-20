/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styled from 'styled-components';
import { TreeData } from './types';
import { getNodeStyling } from './node-styling';
import { NodeTooltip } from '../tooltip';
import { IssueTooltipContent } from '../issue-tooltip';
import { NodePriorityDisplay } from './node-priority-display';
import { useOptimisticUpdates } from '../../contexts/optimistic-updates-context';
import { useShouldShowPriorityIcon } from '../../hooks/use-should-show-priority-icon';
import { useTheme } from '../../theme/theme-context';
import { router } from '@forge/bridge';

interface TreeNodeProps {
  nodeData: TreeData;
  width: number;
  height: number;
  left: number;
  top: number;
  hoveredNodeId: string | null;
  tooltipOpenNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  setTooltipOpenNodeId: (id: string | null) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  nodeData,
  width,
  height,
  left,
  top,
  hoveredNodeId,
  tooltipOpenNodeId,
  setHoveredNodeId,
  setTooltipOpenNodeId
}) => {
  const { getOptimisticValue } = useOptimisticUpdates();
  const { colors } = useTheme();
  
  const nodeName = nodeData.name || 'Unknown';
  const displayName = nodeName || 'Unknown';
  
  // Check if priority icon should be shown based on field editability
  const shouldShowPriorityIcon = useShouldShowPriorityIcon({
    issueKey: nodeData.key,
    defaultPriority: nodeData.priority
  });
  
  // Get optimistic priority data for tooltip
  const optimisticPriorityData = nodeData.key 
    ? getOptimisticValue(nodeData.key, 'priority') as { value: string | null; displayName?: string; iconUrl?: string } | undefined
    : undefined;
  
  // Create priority object with optimistic updates for tooltip
  const tooltipPriority = optimisticPriorityData ? {
    id: optimisticPriorityData.value,
    name: optimisticPriorityData.displayName || nodeData.priority?.name || 'Unknown',
    iconUrl: optimisticPriorityData.iconUrl || nodeData.priority?.iconUrl
  } : nodeData.priority;
  
  const isHovered = hoveredNodeId === nodeData.key;
  const isTooltipOpen = tooltipOpenNodeId === nodeData.key;
  const shouldShowHoverEffect = isHovered || isTooltipOpen;
  const nodeStyling = getNodeStyling(nodeData, shouldShowHoverEffect, false, colors);
  
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
    <IssueTooltipContent
      issueKey={nodeData.key}
      summary={nodeData.summary}
      priority={tooltipPriority}
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
    <NodeTooltip 
      content={tooltipContent} 
      interactive={true}
      onShow={() => setTooltipOpenNodeId(nodeData.key || null)}
      onHide={() => setTooltipOpenNodeId(null)}
    >
      <g 
        transform={`translate(${left}, ${top})`}
        tabIndex={-1}
        focusable="false"
        onClick={handleNodeClick}
        style={{ 
          outline: 'none',
          cursor: 'pointer',
          pointerEvents: 'all'
        }}
      >
        {/* Background layer to hide lines behind transparent nodes */}
        <rect
          height={height}
          width={width}
          y={-height / 2}
          x={-width / 2}
          fill={colors.background.primary}
          stroke="none"
          rx={nodeStyling.rx}
          style={{ pointerEvents: 'none' }}
        />
        
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
          tabIndex={-1}
          focusable="false"
          transform={'scale(1)'}
          style={{ 
            cursor: 'pointer',
            transition: 'filter 0.2s ease-in-out, fill 0.15s ease-out, stroke 0.15s ease-out, transform 0.15s ease-out',
            outline: 'none',
            outlineStyle: 'none',
            border: 'none',
            transformOrigin: 'center',
            pointerEvents: 'all'
          }}
          className="clickable-node"
          onClick={handleNodeClick}
          onMouseEnter={() => setHoveredNodeId(nodeData.key || null)}
          onMouseLeave={() => setHoveredNodeId(null)}
        />

        {/* Check if blocked */}
        {(() => {
          const isBlocked = nodeData.blockingIssues && nodeData.blockingIssues.length > 0;
          const iconSpacing = 16; // Space for each icon (reduced from 20)
          const rightMargin = 8; // Right margin from edge
          let iconsWidth = 0;
          
          // Calculate total width needed for icons
          if (shouldShowPriorityIcon) iconsWidth += iconSpacing;
          if (isBlocked) iconsWidth += iconSpacing;
          
          return (
            <>
              {/* Priority Icon - moved to the right side */}
              {shouldShowPriorityIcon && (
                <NodePriorityDisplay
                  issueKey={nodeData.key}
                  defaultPriority={nodeData.priority}
                  x={width / 2 - rightMargin - iconsWidth + (isBlocked ? 0 : iconSpacing - 16)}
                  y={-8}
                  width={16}
                  height={16}
                />
              )}
              
              {/* Blocked Icon - rightmost, same size as priority icon */}
              {isBlocked && (
                <foreignObject
                  x={width / 2 - rightMargin - 16}
                  y={-8}
                  width={16}
                  height={16}
                  style={{ pointerEvents: 'none' }}
                >
                  <BlockedIconContainer>
                    🚫
                  </BlockedIconContainer>
                </foreignObject>
              )}
            </>
          );
        })()}
        
        {/* Node Text with automatic ellipsis - adjusted for icons on the right */}
        <foreignObject
          x={-width / 2 + 8}
          y={-8}
          width={width - 16 - ((() => {
            const isBlocked = nodeData.blockingIssues && nodeData.blockingIssues.length > 0;
            let iconsWidth = 0;
                         if (shouldShowPriorityIcon) iconsWidth += 16;
                         if (isBlocked) iconsWidth += 16;
            return iconsWidth;
          })())}
          height={16}
          style={{ pointerEvents: 'none' }}
        >
          <NodeTextContainer textColor={nodeStyling.textColor}>
            {displayName}
          </NodeTextContainer>
        </foreignObject>
      </g>
    </NodeTooltip>
  );
};

// Styled Components
const BlockedIconContainer = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 16px;
`;

const NodeTextContainer = styled.div<{ textColor: string }>`
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 500;
  color: ${props => props.textColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 16px;
  transition: color 0.2s ease-in-out;
`; 