import { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';

interface UseFetchEditableFieldsProps {
  issueKey: string;
}

interface UseFetchEditableFieldsReturn {
  editableFields: string[];
  loading: boolean;
  error: string | null;
  isFieldEditable: (fieldName: string) => boolean;
}

export const useFetchEditableFields = ({ 
  issueKey 
}: UseFetchEditableFieldsProps): UseFetchEditableFieldsReturn => {
  const [editableFields, setEditableFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEditableFields = async () => {
      if (!issueKey) {
        if (isMounted) {
          setEditableFields([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const response = await invoke('fetchEditableFields', { issueKey }) as { editableFields: string[] };
        
        if (isMounted) {
          setEditableFields(response.editableFields || []);
        }
      } catch (err) {
        console.error('❌ FRONTEND: Error fetching editable fields:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch editable fields');
          setEditableFields(['summary']); // Fallback to at least summary
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEditableFields();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [issueKey]);

  const isFieldEditable = (fieldName: string): boolean => {
    return editableFields.includes(fieldName);
  };

  return {
    editableFields,
    loading,
    error,
    isFieldEditable
  };
}; 