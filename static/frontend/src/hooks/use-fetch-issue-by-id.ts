import { useEffect, useState } from 'react';
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
}

export const useFetchIssueById = ({ issueId }: UseFetchIssueByIdProps): UseFetchIssueByIdReturn => {
  const [issue, setIssue] = useState<Issue | null>(null);
  
  const handleFetchSuccess = (data: Issue): void => {
    if (data && data.id) {
      setIssue(data);
    } else {
      setIssue(null);
    }
  };

  const handleFetchError = (_error: Error): void => {
    setIssue(null); // Set null on error to prevent crashes
  };

  useEffect(() => {
    // Don't fetch if issueId is empty
    if (!issueId) {
      setIssue(null);
      return;
    }

    const fetchIssueById = async (): Promise<Issue> => invoke('fetchIssueById', { issueId });
    fetchIssueById().then(handleFetchSuccess).catch(handleFetchError);

    const subscribeForIssueChangedEvent = () =>
      events.on('JIRA_ISSUE_CHANGED', () => {
        fetchIssueById().then(handleFetchSuccess).catch(handleFetchError);
      });
    const subscription = subscribeForIssueChangedEvent();
    
    return () => {
      subscription.then((subscription) => subscription.unsubscribe());
    };
  }, [issueId]);

  return { issue };
}; 