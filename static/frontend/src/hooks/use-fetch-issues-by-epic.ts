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
  
  const handleFetchSuccess = (data: IssuesResponse): void => {
    if (data && data.issues && Array.isArray(data.issues)) {
      setIssues(data.issues);
    } else {
      setIssues([]);
    }
  };

  const handleFetchError = (_error: Error): void => {
    // Set empty array on error to prevent crashes
    setIssues([]);
  };

  useEffect(() => {
    // Don't fetch if epicId is empty
    if (!epicId) {
      setIssues([]);
      return;
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
        fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);
      });
    const subscription = subscribeForIssueChangedEvent();
    
    return () => {
      subscription.then((subscription) => subscription.unsubscribe());
    };
  }, [epicId]);

  return { issuesByEpic: issues };
}; 