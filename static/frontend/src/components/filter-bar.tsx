import React, { useMemo } from 'react';
import styled from 'styled-components';
import { MultiSelectFilter, FilterOption } from './multi-select-filter';
import { useFilters } from '../contexts/filter-context';
import { useTheme } from '../theme/theme-context';
import { useFetchAssignableUsers } from '../hooks/use-fetch-assignable-users';

interface FilterBarProps {
  issuesByEpic: any[];
  epicKey: string;
  orientation: 'vertical' | 'horizontal';
  isDarkTheme: boolean;
  toggleOrientation: () => void;
  toggleTheme: () => void;
  toggleFullScreen: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  issuesByEpic, 
  epicKey, 
  orientation, 
  isDarkTheme, 
  toggleOrientation, 
  toggleTheme, 
  toggleFullScreen 
}) => {
  const { colors } = useTheme();
  const { filters, updateAssigneeFilter, updateStatusFilter, clearAllFilters, hasActiveFilters } = useFilters();
  
  // Fetch assignable users for the epic
  const { users: assignableUsers } = useFetchAssignableUsers({ issueKey: epicKey });

  // Extract unique assignees from issues and combine with assignable users
  const assigneeOptions: FilterOption[] = useMemo(() => {
    const assigneeMap = new Map<string, FilterOption>();
    
    // Add "Unassigned" option
    assigneeMap.set('unassigned', {
      id: 'unassigned',
      label: 'Unassigned',
      value: 'unassigned',
    });

    // Add assignees from current issues
    issuesByEpic.forEach(issue => {
      if (issue.fields?.assignee) {
        const assignee = issue.fields.assignee;
        const accountId = assignee.accountId || assignee.key || assignee.name;
        if (accountId && !assigneeMap.has(accountId)) {
          assigneeMap.set(accountId, {
            id: accountId,
            label: assignee.displayName || assignee.name || 'Unknown User',
            value: accountId,
            avatarUrl: assignee.avatarUrls?.['16x16'] || assignee.avatarUrls?.['24x24'],
          });
        }
      }
    });

    // Add all assignable users
    assignableUsers.forEach(user => {
      if (!assigneeMap.has(user.accountId)) {
        assigneeMap.set(user.accountId, {
          id: user.accountId,
          label: user.displayName,
          value: user.accountId,
          avatarUrl: user.avatarUrls?.['16x16'] || user.avatarUrls?.['24x24'],
        });
      }
    });

    return Array.from(assigneeMap.values()).sort((a, b) => {
      // Sort "Unassigned" first, then alphabetically
      if (a.value === 'unassigned') return -1;
      if (b.value === 'unassigned') return 1;
      return a.label.localeCompare(b.label);
    });
  }, [issuesByEpic, assignableUsers]);

  // Extract unique statuses from issues
  const statusOptions: FilterOption[] = useMemo(() => {
    const statusMap = new Map<string, FilterOption>();
    
    issuesByEpic.forEach(issue => {
      if (issue.fields?.status) {
        const status = issue.fields.status;
        const statusName = status.name;
        if (statusName && !statusMap.has(statusName)) {
          statusMap.set(statusName, {
            id: statusName,
            label: statusName,
            value: statusName,
          });
        }
      }
    });

    return Array.from(statusMap.values()).sort((a, b) => {
      // Custom sort order for common statuses
      const statusOrder = ['To Do', 'In Progress', 'Done', 'Completed'];
      const aIndex = statusOrder.indexOf(a.value);
      const bIndex = statusOrder.indexOf(b.value);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return a.label.localeCompare(b.label);
    });
  }, [issuesByEpic]);

  if (assigneeOptions.length <= 1 && statusOptions.length === 0) {
    return null; // Don't show filter bar if there's nothing to filter
  }

  return (
    <FilterBarContainer colors={colors}>
      <FilterSection>
        <FiltersRow>
          {assigneeOptions.length > 1 && (
            <MultiSelectFilter
              label="Assignee"
              options={assigneeOptions}
              selectedValues={filters.assignees}
              onChange={updateAssigneeFilter}
              showAvatars={true}
            />
          )}
          
          {statusOptions.length > 0 && (
            <MultiSelectFilter
              label="Status"
              options={statusOptions}
              selectedValues={filters.statuses}
              onChange={updateStatusFilter}
            />
          )}
          
          {hasActiveFilters && (
            <ClearAllButton onClick={clearAllFilters} colors={colors}>
              Clear all
            </ClearAllButton>
          )}
        </FiltersRow>
        
        <ToggleButtonsGroup>
          <ToggleButton colors={colors} onClick={toggleOrientation}>
            {orientation === 'vertical' ? '↕️' : '↔️'}
          </ToggleButton>
          <ToggleButton colors={colors} onClick={toggleTheme}>
            {isDarkTheme ? '☀️' : '🌙'}
          </ToggleButton>
          <ToggleButton colors={colors} onClick={toggleFullScreen}>
            ⛶
          </ToggleButton>
        </ToggleButtonsGroup>
      </FilterSection>
    </FilterBarContainer>
  );
};

// Styled Components
const FilterBarContainer = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: ${props => props.colors.background.primary};
  border-bottom: 1px solid ${props => props.colors.border.primary};
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ClearAllButton = styled.button<{ colors: any }>`
  background: none;
  border: 1px solid ${props => props.colors.border.primary};
  color: ${props => props.colors.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 24px;
  margin-left: 8px;
  
  &:hover {
    background: ${props => props.colors.surface.hover};
    color: ${props => props.colors.text.primary};
  }
`;

const ToggleButtonsGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ToggleButton = styled.button<{ colors: any }>`
  background-color: ${props => props.colors.background.secondary};
  color: ${props => props.colors.text.primary};
  border: 1px solid ${props => props.colors.border.secondary};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${props => props.colors.shadow.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 36px;
  
  &:hover {
    background-color: ${props => props.colors.surface.hover};
    border-color: ${props => props.colors.interactive.primary};
    box-shadow: ${props => props.colors.shadow.md};
  }
  
  &:active {
    background-color: ${props => props.colors.surface.active};
    box-shadow: ${props => props.colors.shadow.sm};
  }
`; 