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
    const fetchEditableFields = async () => {
      if (!issueKey) {
        setEditableFields([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await invoke('fetchEditableFields', { issueKey }) as { editableFields: string[] };
        
        setEditableFields(response.editableFields || []);
      } catch (err) {
        console.error('❌ FRONTEND: Error fetching editable fields:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch editable fields');
        setEditableFields(['summary']); // Fallback to at least summary
      } finally {
        setLoading(false);
      }
    };

    fetchEditableFields();
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