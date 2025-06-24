import { useState, useEffect, useRef } from 'react';
import { invoke } from '@forge/bridge';

interface AssignableUser {
  accountId: string;
  displayName: string;
  avatarUrls: Record<string, string>;
}

interface UseFetchAssignableUsersProps {
  issueKey: string;
}

interface UseFetchAssignableUsersReturn {
  users: AssignableUser[];
  loading: boolean;
  error: string | null;
}

export const useFetchAssignableUsers = ({ issueKey }: UseFetchAssignableUsersProps): UseFetchAssignableUsersReturn => {
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!issueKey || issueKey.trim() === '') {
      if (isMountedRef.current) {
        setUsers([]);
      }
      return;
    }

    const fetchUsers = async () => {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result: AssignableUser[] = await invoke('fetchAssignableUsers', { issueKey });
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setUsers(result);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assignable users';
          console.error('❌ FRONTEND: Error fetching assignable users:', err);
          setError(errorMessage);
          setUsers([]);
        }
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
    };
  }, [issueKey]);

  // Reset the mounted ref when the hook is reused
  useEffect(() => {
    isMountedRef.current = true;
  });

  return { users, loading, error };
}; 