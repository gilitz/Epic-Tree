import { useEffect, useState, useRef } from 'react';
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    const fetchCurrentContext = async (): Promise<void> => {
      if (!isMountedRef.current) return;
      
      try {
        setLoading(true);
        setError(null);
        const result = await invoke('getCurrentContext') as CurrentContext;
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setCurrentIssueKey(result.issueKey);
        }
      } catch (err) {
        console.error('Error fetching current context:', err);
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setError(err as Error);
          setCurrentIssueKey(null);
        }
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchCurrentContext();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { currentIssueKey, loading, error };
}; 