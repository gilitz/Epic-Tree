import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterState {
  assignees: string[]; // Array of assignee IDs (empty array means show all, ['unassigned'] means show unassigned only)
  statuses: string[]; // Array of status names (empty array means show all)
}

interface FilterContextType {
  filters: FilterState;
  updateAssigneeFilter: (assignees: string[]) => void;
  updateStatusFilter: (statuses: string[]) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const initialFilters: FilterState = {
  assignees: [],
  statuses: [],
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateAssigneeFilter = (assignees: string[]) => {
    setFilters(prev => ({ ...prev, assignees }));
  };

  const updateStatusFilter = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, statuses }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = filters.assignees.length > 0 || filters.statuses.length > 0;

  const value: FilterContextType = {
    filters,
    updateAssigneeFilter,
    updateStatusFilter,
    clearAllFilters,
    hasActiveFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}; 