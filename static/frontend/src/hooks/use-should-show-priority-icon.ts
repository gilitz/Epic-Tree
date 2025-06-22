import { useFetchEditableFields } from './use-fetch-editable-fields';
import { useOptimisticUpdates } from '../contexts/optimistic-updates-context';

interface UseShouldShowPriorityIconProps {
  issueKey?: string;
  defaultPriority?: {
    name: string;
    iconUrl?: string;
  };
}

export const useShouldShowPriorityIcon = ({ 
  issueKey, 
  defaultPriority 
}: UseShouldShowPriorityIconProps): boolean => {
  const { getOptimisticValue } = useOptimisticUpdates();
  const { isFieldEditable, loading: fieldsLoading } = useFetchEditableFields({ 
    issueKey: issueKey || '' 
  });
  
  // Get optimistic priority data if available
  const optimisticPriorityData = issueKey 
    ? getOptimisticValue(issueKey, 'priority') as { value: string | null; displayName?: string; iconUrl?: string } | undefined
    : undefined;
  
  // Use optimistic icon URL if available, otherwise fall back to default
  const priorityIconUrl = optimisticPriorityData?.iconUrl || defaultPriority?.iconUrl;
  
  // Show priority icon if:
  // - Icon URL is available
  // - Loading is NOT complete OR priority field is editable for this issue type
  return !!priorityIconUrl && (fieldsLoading || isFieldEditable('priority'));
}; 