import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!issueKey) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`👥 FRONTEND: Fetching assignable users for ${issueKey}`);
        const result: AssignableUser[] = await invoke('fetchAssignableUsers', { issueKey });
        setUsers(result);
        console.log(`✅ FRONTEND: Fetched ${result.length} assignable users for ${issueKey}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assignable users';
        console.error('❌ FRONTEND: Error fetching assignable users:', err);
        setError(errorMessage);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [issueKey]);

  return { users, loading, error };
}; 