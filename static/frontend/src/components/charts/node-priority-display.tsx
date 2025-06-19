import React from 'react';
import { useOptimisticUpdates } from '../../contexts/optimistic-updates-context';

interface NodePriorityDisplayProps {
  issueKey?: string;
  defaultPriority?: {
    name: string;
    iconUrl?: string;
  };
  x: number;
  y: number;
  width: number;
  height: number;
}

export const NodePriorityDisplay: React.FC<NodePriorityDisplayProps> = ({
  issueKey,
  defaultPriority,
  x,
  y,
  width,
  height
}) => {
  const { getOptimisticValue } = useOptimisticUpdates();
  
  // Get optimistic priority data if available
  const optimisticPriorityData = issueKey 
    ? getOptimisticValue(issueKey, 'priority') as { value: string | null; displayName?: string; iconUrl?: string } | undefined
    : undefined;
  
  // Use optimistic icon URL if available, otherwise fall back to default
  const priorityIconUrl = optimisticPriorityData?.iconUrl || defaultPriority?.iconUrl;
  
  // Only render if we have an icon URL
  if (!priorityIconUrl) {
    return null;
  }
  
  return (
    <image
      x={x}
      y={y}
      width={width}
      height={height}
      href={priorityIconUrl}
      style={{ pointerEvents: 'none' }}
    />
  );
}; 