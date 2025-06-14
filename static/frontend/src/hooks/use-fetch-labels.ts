import { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

interface Label {
  id: string;
  name: string;
}

interface UseFetchLabelsReturn {
  labels: Label[];
}

export const useFetchLabels = (): UseFetchLabelsReturn => {
  const [labels, setLabels] = useState<Label[]>([]);

  const handleFetchSuccess = (data: Label[]): void => {
    setLabels(data);
    if (data.length === 0) {
      throw new Error('No labels returned');
    }
  };

  const handleFetchError = (error: Error): void => {
    console.error('Failed to get label11', error);
  };

  useEffect(() => {
    const fetchLabels = async (): Promise<Label[]> => invoke('fetchLabels');
    fetchLabels().then(handleFetchSuccess).catch(handleFetchError);

    const subscribeForIssueChangedEvent = () =>
      events.on('JIRA_ISSUE_CHANGED', () => {
        fetchLabels().then(handleFetchSuccess).catch(handleFetchError);
      });
    const subscription = subscribeForIssueChangedEvent();

    return () => {
      subscription.then((subscription) => subscription.unsubscribe());
    };
  }, []);

  return { labels };
}; 