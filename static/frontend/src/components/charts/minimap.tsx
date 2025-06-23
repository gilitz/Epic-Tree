import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../theme/theme-context';

// Helper function to render simplified tree nodes
const renderSimplifiedTree = (treeData: any, colors: any, scale: number, svgWidth: number, svgHeight: number, orientation: string): JSX.Element[] => {
  const nodes: JSX.Element[] = [];
  
  // Calculate available space in scaled coordinates
  const scaledWidth = svgWidth;
  const scaledHeight = svgHeight;
  
  const traverseTree = (node: any, x: number, y: number, depth: number = 0) => {
    if (!node) return;
    
    // Simple node representation - small rectangles to mimic actual nodes
    const nodeWidth = Math.max(2, 6 / Math.sqrt(scale));
    const nodeHeight = Math.max(1.5, 3 / Math.sqrt(scale));
    
    // Safe status checking
    const statusString = typeof node.status === 'string' ? node.status.toLowerCase() : 
                        node.status?.name ? String(node.status.name).toLowerCase() : '';
    
    const nodeColor = node.isEpic ? colors.jira.epic : 
                     statusString.includes('done') ? colors.jira.done :
                     statusString.includes('progress') ? colors.jira.inProgress :
                     colors.interactive.primary;
    
    nodes.push(
      <rect
        key={`${node.key || node.name}-${depth}-${x}-${y}`}
        x={x - nodeWidth/2}
        y={y - nodeHeight/2}
        width={nodeWidth}
        height={nodeHeight}
        fill={nodeColor}
        opacity={0.9}
        stroke={nodeColor}
        strokeWidth={0.3}
        strokeOpacity={1}
        rx={0.3}
      />
    );
    
    // Render children with orientation-aware spacing
    if (node.children && Array.isArray(node.children)) {
      const isHorizontal = orientation === 'horizontal';
      
      node.children.forEach((child: any, index: number) => {
        let childX: number, childY: number;
        
        if (isHorizontal) {
          // Horizontal layout: children go to the right and spread vertically
          const levelSpacing = Math.max(25, 50 / Math.sqrt(scale));
          const childSpacing = Math.max(8, 15 / Math.sqrt(scale));
          
          childX = x + levelSpacing;
          childY = y + (index - (node.children.length - 1) / 2) * childSpacing;
        } else {
          // Vertical layout: children go down and spread horizontally
          const levelSpacing = Math.max(15, 30 / Math.sqrt(scale));
          const childSpacing = Math.max(12, 25 / Math.sqrt(scale));
          
          childX = x + (index - (node.children.length - 1) / 2) * childSpacing;
          childY = y + levelSpacing;
        }
        
        // Draw simple line to child
        nodes.push(
          <line
            key={`line-${node.key || node.name}-${child.key || child.name}-${index}`}
            x1={x}
            y1={y}
            x2={childX}
            y2={childY}
            stroke={colors.tree.lines}
            strokeWidth={Math.max(0.3, 0.8 / Math.sqrt(scale))}
            opacity={0.8}
          />
        );
        
        traverseTree(child, childX, childY, depth + 1);
      });
    }
  };
  
  // Start from appropriate root position based on orientation and available space
  if (treeData) {
    const isHorizontal = orientation === 'horizontal';
    const rootX = isHorizontal ? scaledWidth * 0.15 : scaledWidth * 0.5;  // Left side for horizontal, center for vertical
    const rootY = isHorizontal ? scaledHeight * 0.5 : scaledHeight * 0.2; // Center for horizontal, top for vertical
    
    traverseTree(treeData, rootX, rootY);
  }
  
  return nodes;
};

interface MinimapProps {
  svgWidth: number;
  svgHeight: number;
  containerWidth: number;
  containerHeight: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  treeData: any;
  orientation: 'vertical' | 'horizontal';
}

interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  svgWidth,
  svgHeight,
  containerWidth: _containerWidth,
  containerHeight: _containerHeight,
  scrollContainerRef,
  treeData,
  orientation: _orientation
}) => {
  const { colors } = useTheme();
  const [viewportRect, setViewportRect] = useState<ViewportRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const minimapRef = useRef<HTMLDivElement>(null);

  // Minimap dimensions - responsive to container size and screen size
  const isSmallScreen = _containerWidth < 1200 || _containerHeight < 800;
  const baseWidth = isSmallScreen ? 150 : 200;
  const baseHeight = isSmallScreen ? 110 : 150;
  
  const MINIMAP_WIDTH = Math.min(baseWidth, Math.max(60, svgWidth * 0.12));
  const MINIMAP_HEIGHT = Math.min(baseHeight, Math.max(30, svgHeight * 0.12));

  // Calculate scale factors with more space for content
  const contentPadding = 4; // Minimal padding for content area
  const scaleX = (MINIMAP_WIDTH - contentPadding * 2) / svgWidth;
  const scaleY = (MINIMAP_HEIGHT - contentPadding * 2) / svgHeight;
  const scale = Math.min(scaleX, scaleY);

  // Scaled dimensions
  const scaledSvgWidth = svgWidth * scale;
  const scaledSvgHeight = svgHeight * scale;

  // Center the scaled content in the minimap with minimal padding
  const offsetX = (MINIMAP_WIDTH - scaledSvgWidth) / 2;
  const offsetY = (MINIMAP_HEIGHT - scaledSvgHeight) / 2;

  const updateViewport = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollTop = scrollContainer.scrollTop;
    const clientWidth = scrollContainer.clientWidth;
    const clientHeight = scrollContainer.clientHeight;

    // Calculate viewport rectangle in minimap coordinates
    const viewportX = Math.max(offsetX, (scrollLeft * scale) + offsetX);
    const viewportY = Math.max(offsetY, (scrollTop * scale) + offsetY);
    const maxViewportX = offsetX + scaledSvgWidth;
    const maxViewportY = offsetY + scaledSvgHeight;
    
    const viewportWidth = Math.min(
      clientWidth * scale, 
      maxViewportX - viewportX,
      scaledSvgWidth
    );
    const viewportHeight = Math.min(
      clientHeight * scale, 
      maxViewportY - viewportY,
      scaledSvgHeight
    );

    setViewportRect({
      x: viewportX,
      y: viewportY,
      width: Math.max(0, viewportWidth),
      height: Math.max(0, viewportHeight)
    });

    // Show minimap only if content is significantly larger than container
    const isScrollable = (svgWidth > clientWidth * 1.1) || (svgHeight > clientHeight * 1.1);
    setIsVisible(isScrollable && treeData);
  }, [scale, offsetX, offsetY, scaledSvgWidth, scaledSvgHeight, svgWidth, svgHeight, treeData]);

  // Update viewport on scroll and resize
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    updateViewport();

    const handleScroll = () => updateViewport();
    const handleResize = () => updateViewport();

    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateViewport]);

  // Handle minimap click to scroll to position
  const handleMinimapClick = useCallback((event: React.MouseEvent) => {
    if (!scrollContainerRef.current || !minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert click coordinates to scroll position
    const scrollX = ((clickX - offsetX) / scale) - (scrollContainerRef.current.clientWidth / 2);
    const scrollY = ((clickY - offsetY) / scale) - (scrollContainerRef.current.clientHeight / 2);

    scrollContainerRef.current.scrollTo({
      left: Math.max(0, Math.min(scrollX, svgWidth - scrollContainerRef.current.clientWidth)),
      top: Math.max(0, Math.min(scrollY, svgHeight - scrollContainerRef.current.clientHeight)),
      behavior: 'smooth'
    });
  }, [scale, offsetX, offsetY, svgWidth, svgHeight]);

  if (!isVisible || !treeData) return null;

  return (
    <MinimapContainer
      ref={minimapRef}
      colors={colors}
      width={MINIMAP_WIDTH}
      height={MINIMAP_HEIGHT}
      orientation={_orientation}
      onClick={handleMinimapClick}
    >
      <MinimapSvg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
      >
        {/* Background with darker contrast for light theme */}
        <defs>
          <linearGradient id="minimap-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.surface.secondary} stopOpacity="0.7" />
            <stop offset="100%" stopColor={colors.surface.tertiary} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        <rect
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          fill="url(#minimap-bg)"
          rx={8}
        />
        
        {/* Scaled content area with darker background for light theme */}
        <rect
          x={offsetX}
          y={offsetY}
          width={scaledSvgWidth}
          height={scaledSvgHeight}
          fill="#2a2a2a"
          fillOpacity="0.85"
          stroke={colors.border.primary}
          strokeWidth={0.5}
          strokeOpacity="0.6"
          rx={3}
        />
        
        {/* Simplified tree representation */}
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {/* Render simplified nodes */}
          {treeData && renderSimplifiedTree(treeData, colors, scale, svgWidth, svgHeight, _orientation)}
        </g>
        
        {/* Viewport indicator */}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          fill={colors.interactive.primary}
          fillOpacity={0.2}
          stroke={colors.interactive.primary}
          strokeWidth={2}
          rx={2}
        />
      </MinimapSvg>
    </MinimapContainer>
  );
};

const MinimapContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['colors', 'width', 'height', 'orientation'].includes(prop),
})<{ colors: any; width: number; height: number; orientation: string }>`
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background: ${props => props.colors.surface.primary}F0; /* 94% opacity */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${props => props.colors.border.secondary}80; /* 50% opacity border */
  border-radius: 10px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  /* Consistent padding for both orientations */
  padding: 4px;
  
  &:hover {
    background: ${props => props.colors.surface.primary}F8; /* 97% opacity on hover */
    border-color: ${props => props.colors.border.focus}A0; /* 63% opacity */
    box-shadow: 
      0 6px 25px rgba(0, 0, 0, 0.15),
      0 3px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-2px) scale(1.02);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
    transition: all 0.1s ease;
  }
`;

const MinimapSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`; 