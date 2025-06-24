import { useEffect, useState, useRef } from 'react';
import { events, invoke } from '@forge/bridge';

interface UseFetchIssueByIdProps {
  issueId: string;
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

interface UseFetchIssueByIdReturn {
  issue: Issue | null;
  loading: boolean;
  error: string | null;
}

export const useFetchIssueById = ({ issueId }: UseFetchIssueByIdProps): UseFetchIssueByIdReturn => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  
  const handleFetchSuccess = (data: Issue): void => {
    // Only update state if component is still mounted
    if (!isMountedRef.current) return;
    
    if (data && data.id) {
      setIssue(data);
    } else {
      setIssue(null);
    }
    setLoading(false);
    setError(null);
  };

  const handleFetchError = (error: Error): void => {
    // Only update state if component is still mounted
    if (!isMountedRef.current) return;
    
    setIssue(null); // Set null on error to prevent crashes
    setLoading(false);
    setError(error.message || 'Failed to fetch issue');
  };

  useEffect(() => {
    // Don't fetch if issueId is empty
    if (!issueId) {
      if (isMountedRef.current) {
        setIssue(null);
        setLoading(false);
        setError(null);
      }
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    const fetchIssueById = async (): Promise<Issue> => invoke('fetchIssueById', { issueId });
    fetchIssueById().then(handleFetchSuccess).catch(handleFetchError);

    const subscribeForIssueChangedEvent = () =>
      events.on('JIRA_ISSUE_CHANGED', () => {
        // Only fetch if component is still mounted
        if (isMountedRef.current) {
          fetchIssueById().then(handleFetchSuccess).catch(handleFetchError);
        }
      });
    const subscription = subscribeForIssueChangedEvent();
    
    return () => {
      isMountedRef.current = false;
      subscription.then((subscription) => subscription.unsubscribe());
    };
  }, [issueId]);

  // Reset the mounted ref when the hook is reused
  useEffect(() => {
    isMountedRef.current = true;
  });

  return { issue, loading, error };
}; 