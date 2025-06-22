import { useState } from 'react';
import { invoke } from '@forge/bridge';

interface UseUpdateIssueParentProps {
  onSuccess?: (issueKey: string, newParentKey: string | null) => void;
  onError?: (error: string) => void;
}

interface UpdateIssueParentResponse {
  success: boolean;
  error?: string;
}

interface UseUpdateIssueParentReturn {
  updateParent: (issueKey: string, newParentKey: string | null) => Promise<boolean>;
  isUpdating: boolean;
  error: string | null;
}

export const useUpdateIssueParent = ({ 
  onSuccess, 
  onError 
}: UseUpdateIssueParentProps = {}): UseUpdateIssueParentReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParent = async (
    issueKey: string, 
    newParentKey: string | null
  ): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response: UpdateIssueParentResponse = await invoke('updateIssueParent', {
        issueKey,
        newParentKey
      });

      if (response.success) {
        onSuccess?.(issueKey, newParentKey);
        return true;
      } else {
        const errorMessage = response.error || 'Unknown error occurred';
        console.error(`❌ FRONTEND: Failed to update parent for ${issueKey}:`, errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      console.error(`❌ FRONTEND: Error updating parent for ${issueKey}:`, err);
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateParent,
    isUpdating,
    error
  };
}; 