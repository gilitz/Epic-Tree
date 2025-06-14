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
    issuelinks: any[];
    subtasks: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface UseFetchIssueByIdReturn {
  issue: Issue | null;
}

export const useFetchIssueById = ({ issueId }: UseFetchIssueByIdProps): UseFetchIssueByIdReturn => {
  const [issue, setIssue] = useState<Issue | null>(null);
  
  const handleFetchSuccess = (data: Issue): void => {
    setIssue(data);
    if (!data) {
      throw new Error('No issue returned');
    }
  };

  const handleFetchError = (error: Error): void => {
    console.error('Failed to get issue by id', error);
  };

  useEffect(() => {
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