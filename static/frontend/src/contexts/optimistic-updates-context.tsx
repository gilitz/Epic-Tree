import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OptimisticUpdate {
  issueKey: string;
  fieldName: string;
  value: unknown;
  timestamp: number;
}

interface OptimisticUpdatesContextType {
  getOptimisticValue: (issueKey: string, fieldName: string) => unknown | undefined;
  setOptimisticValue: (issueKey: string, fieldName: string, value: unknown) => void;
  clearOptimisticValue: (issueKey: string, fieldName: string) => void;
  clearAllOptimisticValues: (issueKey: string) => void;
  hasOptimisticValue: (issueKey: string, fieldName: string) => boolean;
}

const OptimisticUpdatesContext = createContext<OptimisticUpdatesContextType | undefined>(undefined);

interface OptimisticUpdatesProviderProps {
  children: ReactNode;
}

export const OptimisticUpdatesProvider: React.FC<OptimisticUpdatesProviderProps> = ({ children }) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(new Map());

  const getKey = (issueKey: string, fieldName: string) => `${issueKey}:${fieldName}`;

  const getOptimisticValue = (issueKey: string, fieldName: string): unknown | undefined => {
    const key = getKey(issueKey, fieldName);
    const update = optimisticUpdates.get(key);
    
    // Clean up old optimistic updates (older than 30 seconds)
    // This gives plenty of time for Jira to process and for any automatic refreshes to settle
    if (update && Date.now() - update.timestamp > 30000) {
      clearOptimisticValue(issueKey, fieldName);
      return undefined;
    }
    
    return update?.value;
  };

  const setOptimisticValue = (issueKey: string, fieldName: string, value: unknown) => {
    const key = getKey(issueKey, fieldName);
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        issueKey,
        fieldName,
        value,
        timestamp: Date.now()
      });
      return newMap;
    });
  };

  const clearOptimisticValue = (issueKey: string, fieldName: string) => {
    const key = getKey(issueKey, fieldName);
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  const clearAllOptimisticValues = (issueKey: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      const keysToDelete: string[] = [];
      
      newMap.forEach((update, key) => {
        if (update.issueKey === issueKey) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => newMap.delete(key));
      return newMap;
    });
  };

  const hasOptimisticValue = (issueKey: string, fieldName: string): boolean => {
    const key = getKey(issueKey, fieldName);
    const update = optimisticUpdates.get(key);
    
    // Clean up old optimistic updates (older than 30 seconds)
    if (update && Date.now() - update.timestamp > 30000) {
      clearOptimisticValue(issueKey, fieldName);
      return false;
    }
    
    return !!update;
  };

  const value: OptimisticUpdatesContextType = {
    getOptimisticValue,
    setOptimisticValue,
    clearOptimisticValue,
    clearAllOptimisticValues,
    hasOptimisticValue
  };

  return (
    <OptimisticUpdatesContext.Provider value={value}>
      {children}
    </OptimisticUpdatesContext.Provider>
  );
};

export const useOptimisticUpdates = (): OptimisticUpdatesContextType => {
  const context = useContext(OptimisticUpdatesContext);
  if (!context) {
    throw new Error('useOptimisticUpdates must be used within an OptimisticUpdatesProvider');
  }
  return context;
}; 