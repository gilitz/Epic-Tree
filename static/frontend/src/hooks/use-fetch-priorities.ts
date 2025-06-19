import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchPriorities = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result: Priority[] = await invoke('fetchPriorities');
        setPriorities(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch priorities';
        console.error('❌ FRONTEND: Error fetching priorities:', err);
        setError(errorMessage);
        setPriorities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorities();
  }, []);

  return { priorities, loading, error };
}; 