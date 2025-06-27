import { useState, useCallback } from 'react';
import { invoke } from '@forge/bridge';

interface StoryBreakdownSuggestion {
  title: string;
  description: string;
  storyPoints: number;
  priority: 'High' | 'Medium' | 'Low';
  acceptanceCriteria: string[];
  labels: string[];
  estimationReasoning: string;
}

interface EpicBreakdownResponse {
  suggestions: StoryBreakdownSuggestion[];
  totalEstimatedPoints: number;
  breakdown: {
    frontend: number;
    backend: number;
    testing: number;
    design: number;
  };
  risks: string[];
  recommendations: string[];
}

interface UseAIEpicBreakdownProps {
  epicSummary: string;
  epicDescription: string;
  existingIssues?: unknown[];
}

interface UseAIEpicBreakdownReturn {
  breakdown: EpicBreakdownResponse | null;
  loading: boolean;
  error: string | null;
  generateBreakdown: (props: UseAIEpicBreakdownProps) => Promise<void>;
  refreshData: () => void;
}

export const useAIEpicBreakdown = (): UseAIEpicBreakdownReturn => {
  const [breakdown, setBreakdown] = useState<EpicBreakdownResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateBreakdown = useCallback(async (props: UseAIEpicBreakdownProps): Promise<void> => {
    const { epicSummary, epicDescription, existingIssues } = props;
    
    setLoading(true);
    setError(null);

    try {
      const result = await invoke('generateEpicBreakdown', {
        epicSummary,
        epicDescription,
        existingIssues
      }) as EpicBreakdownResponse;

      setBreakdown(result);
    } catch (err) {
      console.error('Failed to generate epic breakdown:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate breakdown');
      setBreakdown(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    setBreakdown(null);
    setError(null);
  }, []);

  return {
    breakdown,
    loading,
    error,
    generateBreakdown,
    refreshData
  };
}; 