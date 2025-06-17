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
    issuelinks?: any[];
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
    [key: string]: any;
  };
  [key: string]: any;
}

interface SubtasksResponse {
  issues: Subtask[];
  total: number;
  maxResults: number;
  startAt: number;
}

interface UseFetchSubtasksProps {
  parentKeys: string[];
}

interface UseFetchSubtasksReturn {
  subtasks: Subtask[];
  loading: boolean;
  error: string | null;
}

export const useFetchSubtasks = ({ parentKeys }: UseFetchSubtasksProps): UseFetchSubtasksReturn => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentKeys || parentKeys.length === 0) {
      setSubtasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchSubtasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching subtasks for parent keys:', parentKeys);
        const response: SubtasksResponse = await invoke('fetchSubtasksByParentKeys', { parentKeys });
        
        if (response && response.issues) {
          setSubtasks(response.issues);
          console.log(`Successfully fetched ${response.issues.length} subtasks`);
        } else {
          console.warn('No subtasks found in response');
          setSubtasks([]);
        }
      } catch (err) {
        console.error('Failed to fetch subtasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subtasks');
        setSubtasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtasks();
  }, [parentKeys.join(',')]); // Dependency on serialized parent keys

  return { subtasks, loading, error };
}; 