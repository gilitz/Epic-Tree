import { TreeData } from './types';
import { ThemeColors } from '../../theme/colors';

export const getNodeStyling = (
  nodeData: TreeData, 
  isHovered: boolean, 
  isClicked: boolean,
  colors: ThemeColors
) => {
  const isDone = nodeData.status?.statusCategory?.colorName === 'green' || 
                nodeData.status?.name?.toLowerCase().includes('done') ||
                nodeData.status?.name?.toLowerCase().includes('closed') ||
                nodeData.resolution?.name;
  
  const isInProgress = nodeData.status?.statusCategory?.colorName === 'yellow' ||
                      nodeData.status?.name?.toLowerCase().includes('in progress') ||
                      nodeData.status?.name?.toLowerCase().includes('progress');
  
  const isBlocked = nodeData.blockingIssues && nodeData.blockingIssues.length > 0;
  
  // Base styling using theme colors
  let fill = colors.jira.todoBg;
  let stroke = colors.jira.todoBorder;
  let strokeWidth = 1.5;
  let textColor = colors.text.primary;
  
  // Status-based modifications using theme colors
  if (isDone) {
    fill = colors.jira.doneBg;
    stroke = colors.jira.doneBorder;
    textColor = colors.jira.done;
  } else if (isInProgress) {
    fill = colors.jira.inProgressBg;
    stroke = colors.jira.inProgressBorder;
    textColor = colors.jira.inProgress;
  } else {
    fill = colors.jira.todoBg;
    stroke = colors.jira.todoBorder;
    textColor = colors.jira.todo;
  }
  
  // Blocked state - no longer changes border, will show icon instead
  
  // Hover state enhancements - keep the same background color
  if (isHovered) {
    strokeWidth = 2;
    // Don't change the fill color on hover, keep the same background
  }
  
  // Clicked state modifications
  if (isClicked) {
    strokeWidth = 2.5;
    fill = colors.surface.active;
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
      shadowFilter = 'url(#hover-shadow-blue)';
    }
  }
  
  return {
    fill,
    stroke,
    strokeWidth,
    strokeOpacity: 1,
    rx: 6, // More rounded corners for modern look
    filter: shadowFilter || undefined,
    textColor
  };
}; 