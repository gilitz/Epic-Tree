import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

interface CurrentContext {
  issueKey: string;
}

interface UseFetchCurrentContextReturn {
  currentIssueKey: string | null;
  loading: boolean;
  error: Error | null;
}

export const useFetchCurrentContext = (): UseFetchCurrentContextReturn => {
  const [currentIssueKey, setCurrentIssueKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrentContext = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const result = await invoke('getCurrentContext') as CurrentContext;
        setCurrentIssueKey(result.issueKey);
      } catch (err) {
        console.error('Error fetching current context:', err);
        setError(err as Error);
        setCurrentIssueKey(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentContext();
  }, []);

  return { currentIssueKey, loading, error };
}; 