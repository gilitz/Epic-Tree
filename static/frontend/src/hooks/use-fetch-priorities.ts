import { useState, useEffect, useRef } from 'react';
import { invoke } from '@forge/bridge';

interface Priority {
  id: string;
  name: string;
  iconUrl: string;
}

interface UseFetchPrioritiesReturn {
  priorities: Priority[];
  loading: boolean;
  error: string | null;
}

export const useFetchPriorities = (): UseFetchPrioritiesReturn => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const fetchPriorities = async () => {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result: Priority[] = await invoke('fetchPriorities');
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setPriorities(result);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch priorities';
          console.error('❌ FRONTEND: Error fetching priorities:', err);
          setError(errorMessage);
          setPriorities([]);
        }
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchPriorities();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { priorities, loading, error };
}; 