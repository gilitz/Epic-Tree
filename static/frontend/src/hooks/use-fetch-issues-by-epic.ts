import { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

interface UseFetchIssuesByEpicIdProps {
  epicId: string;
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

interface IssuesResponse {
  issues: Issue[];
  [key: string]: any;
}

interface UseFetchIssuesByEpicIdReturn {
  issuesByEpic: Issue[];
}

export const useFetchIssuesByEpicId = ({ epicId }: UseFetchIssuesByEpicIdProps): UseFetchIssuesByEpicIdReturn => {
  const [issues, setIssues] = useState<Issue[]>([]);
  
  const handleFetchSuccess = (data: IssuesResponse): void => {
    if (data && data.issues && Array.isArray(data.issues)) {
      setIssues(data.issues);
    } else {
      console.warn('No issues found for epic:', epicId);
      setIssues([]);
    }
  };

  const handleFetchError = (error: Error): void => {
    console.error('Failed to get issues for epic:', epicId, error);
    setIssues([]); // Set empty array on error to prevent crashes
  };

  useEffect(() => {
    const fetchIssuesByEpicId = async (): Promise<IssuesResponse> => invoke('fetchIssuesByEpicId', { epicId });
    fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);

    const subscribeForIssueChangedEvent = () =>
      events.on('JIRA_ISSUE_CHANGED', () => {
        fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);
      });
    const subscription = subscribeForIssueChangedEvent();
    
    return () => {
      subscription.then((subscription) => subscription.unsubscribe());
    };
  }, [epicId]);

  return { issuesByEpic: issues };
}; 