import { useEffect, useState, useRef } from 'react';
import { invoke } from '@forge/bridge';

interface Subtask {
  id: string;
  key: string;
  fields: {
    summary: string;
    status?: {
      name: string;
      statusCategory?: {
        colorName: string;
      };
    };
    priority?: {
      name: string;
      iconUrl?: string;
    };
    assignee?: {
      displayName: string;
      avatarUrls?: {
        '16x16': string;
      };
    };
    reporter?: {
      displayName: string;
      avatarUrls?: {
        '16x16': string;
      };
    };
    labels?: string[];
    issuelinks?: unknown[];
    issuetype?: {
      name: string;
      iconUrl?: string;
    };
    created?: string;
    updated?: string;
    duedate?: string;
    resolution?: {
      name: string;
    };
    components?: Array<{ name: string }>;
    fixVersions?: Array<{ name: string }>;
    parent?: {
      key: string;
    };
    [key: string]: unknown; // Allow dynamic custom fields
  };
  [key: string]: unknown;
}

interface SubtasksResponse {
  issues: Subtask[];
  total: number;
  maxResults: number;
  startAt: number;
}

interface UseFetchSubtasksByKeysProps {
  subtaskKeys: string[];
}

interface UseFetchSubtasksByKeysReturn {
  subtasks: Subtask[];
  loading: boolean;
  error: string | null;
}

export const useFetchSubtasksByKeys = ({ subtaskKeys }: UseFetchSubtasksByKeysProps): UseFetchSubtasksByKeysReturn => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Serialize the keys for dependency checking
  const subtaskKeysString = subtaskKeys.join(',');

  useEffect(() => {
    if (!subtaskKeys || subtaskKeys.length === 0) {
      if (isMountedRef.current) {
        setSubtasks([]);
        setLoading(false);
        setError(null);
      }
      return;
    }

    const fetchSubtasks = async () => {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response: SubtasksResponse = await invoke('fetchSubtasksByKeys', { subtaskKeys });
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          if (response && response.issues) {
            setSubtasks(response.issues);
          } else {
            setSubtasks([]);
          }
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch subtasks');
          setSubtasks([]);
        }
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchSubtasks();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
    };
  }, [subtaskKeys, subtaskKeysString]); // Include both dependencies

  // Reset the mounted ref when the hook is reused
  useEffect(() => {
    isMountedRef.current = true;
  });
  
  return { subtasks, loading, error };
}; 