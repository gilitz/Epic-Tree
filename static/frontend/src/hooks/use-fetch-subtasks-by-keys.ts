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
          if (response.issues.length > 0) {
            console.log('🎯 REAL SUBTASK DETAILS:', response.issues.map(st => ({
              key: st.key,
              summary: st.fields?.summary,
              assignee: st.fields?.assignee?.displayName,
              status: st.fields?.status?.name
            })));
          }
        } else {
          console.warn('🔍 FRONTEND: No subtasks found in response, response structure:', response);
          setSubtasks([]);
        }
      } catch (err) {
        console.error('🔍 FRONTEND: Subtasks by keys API ERROR:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subtasks');
        setSubtasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtasks();
  }, [subtaskKeys.join(',')]); // Dependency on serialized subtask keys
  console.log('🎯 SUBTASKS:', subtasks);
  return { subtasks, loading, error };
}; 