import { useEffect, useState } from 'react';
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
    customfield_10016?: number;
    parent?: {
      key: string;
    };
    [key: string]: unknown;
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

  // Serialize the keys for dependency checking
  const subtaskKeysString = subtaskKeys.join(',');

  useEffect(() => {
    if (!subtaskKeys || subtaskKeys.length === 0) {
      setSubtasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchSubtasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response: SubtasksResponse = await invoke('fetchSubtasksByKeys', { subtaskKeys });
        
        
        if (response && response.issues) {
          setSubtasks(response.issues);
        } else {
          setSubtasks([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subtasks');
        setSubtasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtasks();
  }, [subtaskKeys, subtaskKeysString]); // Include both dependencies
  
  return { subtasks, loading, error };
}; 