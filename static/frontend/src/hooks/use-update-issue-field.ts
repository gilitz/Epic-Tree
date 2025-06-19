import { useState } from 'react';
import { invoke } from '@forge/bridge';

interface UseUpdateIssueFieldProps {
  onSuccess?: (issueKey: string, fieldName: string, newValue: unknown) => void;
  onError?: (error: string) => void;
}

interface UpdateIssueFieldResponse {
  success: boolean;
  error?: string;
}

interface UseUpdateIssueFieldReturn {
  updateField: (issueKey: string, fieldName: string, fieldValue: unknown) => Promise<boolean>;
  isUpdating: boolean;
  error: string | null;
}

export const useUpdateIssueField = ({ 
  onSuccess, 
  onError 
}: UseUpdateIssueFieldProps = {}): UseUpdateIssueFieldReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = async (
    issueKey: string, 
    fieldName: string, 
    fieldValue: unknown
  ): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      console.log(`🔄 FRONTEND: Updating ${fieldName} for ${issueKey} to:`, fieldValue);
      
      const response: UpdateIssueFieldResponse = await invoke('updateIssueField', {
        issueKey,
        fieldName,
        fieldValue
      });

      if (response.success) {
        console.log(`✅ FRONTEND: Successfully updated ${fieldName} for ${issueKey}`);
        
        // Don't refresh data automatically after successful update
        // Trust the optimistic update - only refresh on errors or manual refresh
        // This prevents any flicker between old and new values
        
        onSuccess?.(issueKey, fieldName, fieldValue);
        return true;
      } else {
        const errorMessage = response.error || 'Unknown error occurred';
        console.error(`❌ FRONTEND: Failed to update ${fieldName} for ${issueKey}:`, errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      console.error(`❌ FRONTEND: Error updating ${fieldName} for ${issueKey}:`, err);
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateField,
    isUpdating,
    error
  };
}; 