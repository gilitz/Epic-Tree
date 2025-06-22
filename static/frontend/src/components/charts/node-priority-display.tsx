import React from 'react';
import { useOptimisticUpdates } from '../../contexts/optimistic-updates-context';
import { useFetchEditableFields } from '../../hooks/use-fetch-editable-fields';

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
  
  // Check if priority field is editable for this issue
  const { isFieldEditable, loading: fieldsLoading } = useFetchEditableFields({ 
    issueKey: issueKey || '' 
  });
  
  // Get optimistic priority data if available
  const optimisticPriorityData = issueKey 
    ? getOptimisticValue(issueKey, 'priority') as { value: string | null; displayName?: string; iconUrl?: string } | undefined
    : undefined;
  
  // Use optimistic icon URL if available, otherwise fall back to default
  const priorityIconUrl = optimisticPriorityData?.iconUrl || defaultPriority?.iconUrl;
  
  // Don't render if:
  // - No icon URL available
  // - Loading is complete AND priority field is not editable for this issue type
  if (!priorityIconUrl || (!fieldsLoading && !isFieldEditable('priority'))) {
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