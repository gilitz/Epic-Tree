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
  // - Not loading field metadata
  // - Priority field is editable for this issue type
  // - Icon URL is available
  return !fieldsLoading && isFieldEditable('priority') && !!priorityIconUrl;
}; 