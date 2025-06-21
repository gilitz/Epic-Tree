import React, { useMemo } from 'react';
import styled from 'styled-components';
import { MultiSelectFilter, FilterOption } from './multi-select-filter';
import { useFilters } from '../contexts/filter-context';
import { useTheme } from '../theme/theme-context';
import { useFetchAssignableUsers } from '../hooks/use-fetch-assignable-users';
import { useFetchPriorities } from '../hooks/use-fetch-priorities';

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
  const { 
    filters, 
    updateAssigneeFilter, 
    updateStatusFilter, 
    updatePriorityFilter, 
    updateLabelsFilter, 
    updateBlockingStatusFilter, 
    clearAllFilters, 
    hasActiveFilters 
  } = useFilters();
  
  // Fetch assignable users and priorities
  const { users: assignableUsers } = useFetchAssignableUsers({ issueKey: epicKey });
  const { priorities } = useFetchPriorities();

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

  // Extract unique priorities from issues and combine with available priorities
  const priorityOptions: FilterOption[] = useMemo(() => {
    const priorityMap = new Map<string, FilterOption>();

    // Add priorities from current issues
    issuesByEpic.forEach(issue => {
      if (issue.fields?.priority) {
        const priority = issue.fields.priority;
        const priorityId = priority.id || priority.name;
        if (priorityId && !priorityMap.has(priorityId)) {
          priorityMap.set(priorityId, {
            id: priorityId,
            label: priority.name || 'Unknown Priority',
            value: priorityId,
            iconUrl: priority.iconUrl,
          });
        }
      }
    });

    // Add all available priorities from the system
    priorities.forEach(priority => {
      if (!priorityMap.has(priority.id)) {
        priorityMap.set(priority.id, {
          id: priority.id,
          label: priority.name,
          value: priority.id,
          iconUrl: priority.iconUrl,
        });
      }
    });

    return Array.from(priorityMap.values()).sort((a, b) => {
      // Custom sort order for priorities: High, Medium, Low, then others alphabetically
      const priorityOrder = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
      const aIndex = priorityOrder.indexOf(a.label);
      const bIndex = priorityOrder.indexOf(b.label);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return a.label.localeCompare(b.label);
    });
  }, [issuesByEpic, priorities]);

  // Extract unique labels from issues
  const labelOptions: FilterOption[] = useMemo(() => {
    const labelSet = new Set<string>();
    
    issuesByEpic.forEach(issue => {
      if (issue.fields?.labels && Array.isArray(issue.fields.labels)) {
        issue.fields.labels.forEach((label: string) => {
          if (label) {
            labelSet.add(label);
          }
        });
      }
    });

    const options: FilterOption[] = [];

    // Add all unique labels without colors
    Array.from(labelSet).sort().forEach(label => {
      options.push({
        id: label,
        label,
        value: label,
      });
    });

    return options;
  }, [issuesByEpic]);

  // Blocking/Blocked status options with emoji icons
  const blockingStatusOptions: FilterOption[] = useMemo(() => {
    return [
      {
        id: 'blocking',
        label: 'Blocking',
        value: 'blocking',
        iconUrl: `data:image/svg+xml;charset=utf-8,${  encodeURIComponent(`
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <text x="8" y="11" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle">🔒</text>
          </svg>
        `)}`,
      },
      {
        id: 'blocked',
        label: 'Blocked',
        value: 'blocked',
        iconUrl: `data:image/svg+xml;charset=utf-8,${  encodeURIComponent(`
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <text x="8" y="11" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle">🚫</text>
          </svg>
        `)}`,
      },
    ];
  }, []);

  // Check if we have enough options to show filters
  const showAssigneeFilter = assigneeOptions.length > 1;
  const showStatusFilter = statusOptions.length > 0;
  const showPriorityFilter = priorityOptions.length > 0;
  const showLabelsFilter = labelOptions.length > 0;
  const showBlockingFilter = blockingStatusOptions.length > 0;

  if (!showAssigneeFilter && !showStatusFilter && !showPriorityFilter && !showLabelsFilter && !showBlockingFilter) {
    return null; // Don't show filter bar if there's nothing to filter
  }

  return (
    <FilterBarContainer colors={colors}>
      <FilterSection>
        <FiltersRow>
          {showAssigneeFilter && (
            <MultiSelectFilter
              label="Assignee"
              options={assigneeOptions}
              selectedValues={filters.assignees}
              onChange={updateAssigneeFilter}
              showAvatars={true}
            />
          )}
          
          {showStatusFilter && (
            <MultiSelectFilter
              label="Status"
              options={statusOptions}
              selectedValues={filters.statuses}
              onChange={updateStatusFilter}
            />
          )}

          {showPriorityFilter && (
            <MultiSelectFilter
              label="Priority"
              options={priorityOptions}
              selectedValues={filters.priorities}
              onChange={updatePriorityFilter}
              showIcons={true}
            />
          )}

          {showLabelsFilter && (
            <MultiSelectFilter
              label="Labels"
              options={labelOptions}
              selectedValues={filters.labels}
              onChange={updateLabelsFilter}
            />
          )}

          {showBlockingFilter && (
            <MultiSelectFilter
              label="Linked"
              options={blockingStatusOptions}
              selectedValues={filters.blockingStatus}
              onChange={updateBlockingStatusFilter}
              showIcons={true}
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
  padding: 8px 24px;
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