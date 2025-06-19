import { TreeData } from './types';

export const getNodeStyling = (nodeData: TreeData, isHovered: boolean, isClicked: boolean) => {
  const isDone = nodeData.status?.statusCategory?.colorName === 'green' || 
                nodeData.status?.name?.toLowerCase().includes('done') ||
                nodeData.status?.name?.toLowerCase().includes('closed') ||
                nodeData.resolution?.name;
  
  const isInProgress = nodeData.status?.statusCategory?.colorName === 'yellow' ||
                      nodeData.status?.name?.toLowerCase().includes('in progress') ||
                      nodeData.status?.name?.toLowerCase().includes('progress');
  
  const isBlocked = nodeData.blockingIssues && nodeData.blockingIssues.length > 0;
  
  // Base styling - all nodes look the same
  let fill = '#575f6b'; // Much brighter grayish-blue background
  let stroke = '#4a5568';
  let strokeWidth = 2;
  
  // Status-based modifications
  if (isDone) {
    fill = '#017d2d'; // Green background for done items (matching image)
  }
  
  if (isInProgress) {
    fill = '#baa625'; // Yellow background for in progress items
  }
  
  if (isBlocked) {
    stroke = '#dc2626'; // Red border for blocked items
    strokeWidth = 2;
  }
  
  // Darken colors when clicked
  if (isClicked) {
    // Darken fill color by reducing brightness
    if (isDone) {
      fill = '#014a1f'; // Darker green
    } else if (isInProgress) {
      fill = '#8a7a1a'; // Darker yellow
    } else {
      fill = '#64748b'; // Darker grayish-blue for clicked state
    }
    
    // Darken stroke color
    if (isBlocked) {
      stroke = '#a21e1e'; // Darker red
    } else {
      stroke = '#3a4252'; // Darker default stroke
    }
  }

  // Choose shadow color based on node state
  let shadowFilter = '';
  if (isHovered) {
    if (isBlocked) {
      shadowFilter = 'url(#hover-shadow-red)';
    } else if (isDone) {
      shadowFilter = 'url(#hover-shadow-green)';
    } else if (isInProgress) {
      shadowFilter = 'url(#hover-shadow-yellow)';
    } else {
      shadowFilter = 'url(#hover-shadow-gray)';
    }
  }
  
  return {
    fill,
    stroke,
    strokeWidth,
    strokeOpacity: 1,
    rx: 4, // Consistent border radius
    filter: shadowFilter || undefined
  };
}; 