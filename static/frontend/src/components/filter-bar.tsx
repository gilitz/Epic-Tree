import React, { useMemo } from 'react';
import styled from 'styled-components';
import { MultiSelectFilter, FilterOption } from './multi-select-filter';
import { useFilters } from '../contexts/filter-context';
import { useTheme, type CSSThemeColors } from '../theme/theme-context';
import { useFetchAssignableUsers } from '../hooks/use-fetch-assignable-users';
import { useFetchPriorities } from '../hooks/use-fetch-priorities';
import { Issue } from './charts/types';

interface FilterBarProps {
  issuesByEpic: Issue[];
  epicKey: string;
  orientation: 'vertical' | 'horizontal';
  isDarkTheme: boolean;
  toggleOrientation: () => void;
  toggleTheme: () => void;
  toggleFullScreen: () => void;
  showBreakdown?: boolean;
  toggleBreakdown?: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  issuesByEpic, 
  epicKey, 
  orientation, 
  isDarkTheme, 
  toggleOrientation, 
  toggleTheme, 
  toggleFullScreen,
  showBreakdown,
  toggleBreakdown,
  zoomIn,
  zoomOut
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
        const assignee = issue.fields.assignee as { 
          displayName?: string; 
          accountId?: string; 
          key?: string; 
          name?: string; 
          avatarUrls?: { '16x16'?: string; '24x24'?: string } 
        };
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
        const status = issue.fields.status as { name?: string };
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
        const priority = issue.fields.priority as { id?: string; name?: string; iconUrl?: string };
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
    <FilterBarContainer colors={colors} $orientation={orientation}>
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
          {toggleBreakdown && (
            <ToggleButton 
              colors={colors} 
              onClick={toggleBreakdown}
              style={{ 
                background: showBreakdown ? '#3B82F6' : undefined,
                color: showBreakdown ? 'white' : undefined,
                borderColor: showBreakdown ? '#2563EB' : undefined
              }}
            >
              📊
            </ToggleButton>
          )}
          <ToggleButton colors={colors} onClick={toggleOrientation}>
            {orientation === 'vertical' ? '↕️' : '↔️'}
          </ToggleButton>
          <ToggleButton colors={colors} onClick={toggleTheme}>
            {isDarkTheme ? '☀️' : '🌙'}
          </ToggleButton>
          <ViewControlsGroup>
            <SplitZoomButton>
              <ZoomHalf colors={colors} onClick={zoomOut} $position="left">
                −
              </ZoomHalf>
              <ZoomHalf colors={colors} onClick={zoomIn} $position="right">
                +
              </ZoomHalf>
            </SplitZoomButton>
            <ViewControlButton colors={colors} onClick={toggleFullScreen}>
              ⛶
            </ViewControlButton>
          </ViewControlsGroup>
        </ToggleButtonsGroup>
      </FilterSection>
    </FilterBarContainer>
  );
};

// Styled Components
const FilterBarContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$orientation',
})<{ colors: CSSThemeColors; $orientation: 'vertical' | 'horizontal' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: ${props => props.$orientation === 'horizontal' 
    ? 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px) clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)' 
    : 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)'};
  background: ${props => props.colors.background.primary};
  border-bottom: 1px solid ${props => props.colors.border.primary};
  gap: clamp(8px, 2vw, 16px);
  position: relative;
  min-height: fit-content;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  gap: clamp(6px, 1.5vw, 12px);
`;

const FiltersRow = styled.div`
  display: flex;
  gap: clamp(6px, 1.5vw, 12px);
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
`;

const ClearAllButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  background: none;
  border: 1px solid ${props => props.colors.border.primary};
  color: ${props => props.colors.text.secondary};
  padding: clamp(3px, 0.5vw, 4px) clamp(6px, 1vw, 8px);
  border-radius: 4px;
  font-size: clamp(10px, 2vw, 11px);
  cursor: pointer;
  transition: all 0.2s ease;
  height: clamp(20px, 4vw, 24px);
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => props.colors.surface.hover};
    color: ${props => props.colors.text.primary};
  }
`;

const ToggleButtonsGroup = styled.div`
  display: flex;
  gap: clamp(4px, 1vw, 8px);
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  background-color: ${props => props.colors.background.secondary};
  color: ${props => props.colors.text.primary};
  border: 1px solid ${props => props.colors.border.secondary};
  border-radius: 8px;
  padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px);
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${props => props.colors.shadow.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(32px, 6vw, 40px);
  min-height: clamp(28px, 5vw, 36px);
  flex-shrink: 0;
  
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

const ViewControlsGroup = styled.div`
  display: flex;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--color-shadow-sm);
  flex-shrink: 0;
`;

const SplitZoomButton = styled.div`
  display: flex;
  position: relative;
  min-width: clamp(48px, 8vw, 64px);
  min-height: clamp(28px, 5vw, 36px);
  
  &::before {
    content: '🔍';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: clamp(8px, 2vw, 12px);
    opacity: 0.3;
    pointer-events: none;
    z-index: 1;
  }
`;

const ZoomHalf = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$position',
})<{ colors: CSSThemeColors; $position: 'left' | 'right' }>`
  background-color: ${props => props.colors.background.secondary};
  color: ${props => props.colors.text.primary};
  border: none;
  border-right: ${props => props.$position === 'left' ? `1px solid ${props.colors.border.secondary}` : 'none'};
  padding: clamp(4px, 1vw, 8px) clamp(2px, 0.5vw, 4px);
  font-size: clamp(10px, 2vw, 12px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: clamp(28px, 5vw, 36px);
  position: relative;
  z-index: 2;
  
  &:hover {
    background-color: ${props => props.colors.surface.hover};
  }
  
  &:active {
    background-color: ${props => props.colors.surface.active};
  }
`;

const ViewControlButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  background-color: ${props => props.colors.background.secondary};
  color: ${props => props.colors.text.primary};
  border: none;
  border-left: 1px solid ${props => props.colors.border.secondary};
  padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px);
  font-size: clamp(16px, 3.5vw, 18px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(32px, 6vw, 40px);
  min-height: clamp(28px, 5vw, 36px);
  flex-shrink: 0;
  
  &:hover {
    background-color: ${props => props.colors.surface.hover};
  }
  
  &:active {
    background-color: ${props => props.colors.surface.active};
  }
`; 