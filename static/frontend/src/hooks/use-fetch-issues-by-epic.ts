import { useEffect, useState, useRef } from 'react';
import { events, invoke } from '@forge/bridge';

interface UseFetchIssuesByEpicIdProps {
  epicId: string;
}

interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuelinks: unknown[];
    subtasks: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface IssuesResponse {
  issues?: Issue[];
  [key: string]: unknown;
}

interface UseFetchIssuesByEpicIdReturn {
  issuesByEpic: Issue[];
  loading: boolean;
  error: string | null;
}

// Helper function to detect network/proxy errors
const _isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  const errorString = error.toString().toLowerCase();
  return errorString.includes('squid') || 
         errorString.includes('proxy') || 
         errorString.includes('network') ||
         errorString.includes('cannot forward') ||
         errorString.includes('tunnel.atlassian-dev.net') ||
         errorString.includes('unable to forward') ||
         errorString.includes('there was an error invoking the function');
};

export const useFetchIssuesByEpicId = ({ epicId }: UseFetchIssuesByEpicIdProps): UseFetchIssuesByEpicIdReturn => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  
  const handleFetchSuccess = (data: IssuesResponse): void => {
    // Only update state if component is still mounted
    if (!isMountedRef.current) return;
    
    if (data && data.issues && Array.isArray(data.issues)) {
      setIssues(data.issues);
    } else {
      setIssues([]);
    }
    setLoading(false);
    setError(null);
  };

  const handleFetchError = (error: Error): void => {
    // Only update state if component is still mounted
    if (!isMountedRef.current) return;
    
    // Set empty array on error to prevent crashes
    setIssues([]);
    setLoading(false);
    setError(error.message || 'Failed to fetch issues');
  };

  useEffect(() => {
    // Don't fetch if epicId is empty
    if (!epicId) {
      if (isMountedRef.current) {
        setIssues([]);
        setLoading(false);
        setError(null);
      }
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    const fetchIssuesByEpicId = async (): Promise<IssuesResponse> => {
      try {
        const result = await invoke('fetchIssuesByEpicId', { epicId }) as IssuesResponse;
        return result;
      } catch (error) {
        // Re-throw to be caught by the .catch() handler
        throw error;
      }
    };
    
    fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);

    const subscribeForIssueChangedEvent = () =>
      events.on('JIRA_ISSUE_CHANGED', () => {
        // Only fetch if component is still mounted
        if (isMountedRef.current) {
          fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);
        }
      });
    const subscription = subscribeForIssueChangedEvent();
    
    return () => {
      isMountedRef.current = false;
      subscription.then((subscription) => subscription.unsubscribe());
    };
  }, [epicId]);

  // Reset the mounted ref when the hook is reused
  useEffect(() => {
    isMountedRef.current = true;
  });

  return { issuesByEpic: issues, loading, error };
}; 