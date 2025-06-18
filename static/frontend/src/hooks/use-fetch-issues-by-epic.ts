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
  issues?: Issue[];
  [key: string]: any;
}

interface UseFetchIssuesByEpicIdReturn {
  issuesByEpic: Issue[];
}

// Helper function to detect network/proxy errors
const isNetworkError = (error: any): boolean => {
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

  const handleFetchError = (error: Error): void => {
    console.error('Failed to get issues for epic:', epicId, error);
    
    if (isNetworkError(error)) {
      console.error('Network/proxy error detected. This may be a temporary connectivity issue.');
      console.error('If this persists, there may be infrastructure issues with the Forge platform.');
    }
    
    // Set empty array on error to prevent crashes
    setIssues([]);
  };

  useEffect(() => {
    const fetchIssuesByEpicId = async (): Promise<IssuesResponse> => {
      try {
        const result = await invoke('fetchIssuesByEpicId', { epicId });
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