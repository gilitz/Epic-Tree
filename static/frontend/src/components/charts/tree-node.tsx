/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TreeData } from './types';
import { getNodeStyling } from './node-styling';
import { NodeTooltip } from '../tooltip';
import { IssueTooltipContent } from '../issue-tooltip';
import { NodePriorityDisplay } from './node-priority-display';
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
  const nodeName = nodeData.name || 'Unknown';
  const priorityIconUrl = nodeData.priority?.iconUrl;
  const displayName = nodeName || 'Unknown';
  
  const isHovered = hoveredNodeId === nodeData.key;
  const isTooltipOpen = tooltipOpenNodeId === nodeData.key;
  const shouldShowHoverEffect = isHovered || isTooltipOpen;
  const nodeStyling = getNodeStyling(nodeData, shouldShowHoverEffect, false);
  
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

        {/* Priority Icon with optimistic updates */}
        <NodePriorityDisplay
          issueKey={nodeData.key}
          defaultPriority={nodeData.priority}
          x={-width / 2 + 4}
          y={-8}
          width={16}
          height={16}
        />
        
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
              fontSize: '12px',
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
    </NodeTooltip>
  );
}; 