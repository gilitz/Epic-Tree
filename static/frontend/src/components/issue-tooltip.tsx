import React from 'react';
import styled from 'styled-components';
import { useTheme, CSSThemeColors } from '../theme/theme-context';
import { router } from '@forge/bridge';
import { SecondaryTooltip } from './tooltip';
import { Tag } from './tag';
import { EditableField } from './editable-field';
import { EditableDropdown } from './editable-dropdown';
import { useFetchPriorities } from '../hooks/use-fetch-priorities';
import { useFetchAssignableUsers } from '../hooks/use-fetch-assignable-users';
import { useFetchEditableFields } from '../hooks/use-fetch-editable-fields';

interface BlockingIssue {
  key: string;
  summary: string;
  status?: {
    name: string;
  };
}

interface BlockedIssue {
  key: string;
  summary: string;
  status?: {
    name: string;
  };
}

interface IssueTooltipProps {
  issueKey?: string;
  summary?: string;
  priority?: {
    id?: string;
    name: string;
    iconUrl?: string;
  };
  assignee?: {
    accountId?: string;
    displayName: string;
    avatarUrls?: {
      '16x16': string;
    };
  };
  status?: {
    name: string;
    statusCategory?: {
      colorName: string;
    };
  };
  labels?: string[];
  storyPoints?: number;
  issueType?: {
    name: string;
    iconUrl?: string;
  };
  reporter?: {
    displayName: string;
    avatarUrls?: {
      '16x16': string;
    };
  };
  created?: string;
  updated?: string;
  dueDate?: string;
  resolution?: {
    name: string;
  };
  components?: Array<{ name: string }>;
  fixVersions?: Array<{ name: string }>;
  blockingIssues?: BlockingIssue[];
  blockedIssues?: BlockedIssue[];
  isEpic?: boolean;
  baseUrl?: string;
}

export const IssueTooltipContent: React.FC<IssueTooltipProps> = ({
  issueKey,
  summary,
  priority,
  assignee,
  status,
  labels = [],
  storyPoints,
  issueType,
  reporter: _reporter,
  created,
  updated,
  dueDate,
  resolution: _resolution,
  components = [],
  fixVersions = [],
  blockingIssues = [],
  blockedIssues = [],
  isEpic: _isEpic = false,
  baseUrl = 'https://gilitz.atlassian.net'
}) => {
  // Get theme colors for proper text visibility
  const { colors } = useTheme();
  
  // Fetch priorities and assignable users
  const { priorities, loading: prioritiesLoading } = useFetchPriorities();
  const { users: assignableUsers, loading: usersLoading } = useFetchAssignableUsers({ 
    issueKey: issueKey || '' 
  });
  
  // Fetch editable fields for this issue
  const { isFieldEditable, loading: fieldsLoading } = useFetchEditableFields({ 
    issueKey: issueKey || '' 
  });
  

  // Generate consistent colors for labels based on label text
  const getLabelColor = (label: string) => {
    const colors = [
      { bg: '#e3f2fd', border: '#1976d2', text: '#0d47a1' }, // Blue
      { bg: '#f3e5f5', border: '#7b1fa2', text: '#4a148c' }, // Purple
      { bg: '#e8f5e8', border: '#388e3c', text: '#1b5e20' }, // Green
      { bg: '#fff3e0', border: '#f57c00', text: '#e65100' }, // Orange
      { bg: '#fce4ec', border: '#c2185b', text: '#880e4f' }, // Pink
      { bg: '#e0f2f1', border: '#00695c', text: '#004d40' }, // Teal
      { bg: '#f1f8e9', border: '#689f38', text: '#33691e' }, // Light Green
      { bg: '#fff8e1', border: '#fbc02d', text: '#f57f17' }, // Yellow
    ];
    
    // Simple hash function to get consistent color for same label
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Check if date is overdue
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch {
      return false;
    }
  };
  const handleIssueKeyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (issueKey) {
      try {
        await router.open(`/browse/${issueKey}`);
      } catch (error) {
        // Fallback: try using window.open with Forge's allowed method
        try {
          window.open(`${baseUrl}/browse/${issueKey}`, '_blank');
        } catch (fallbackError) {
          // Last resort: navigate in same tab
          window.location.href = `${baseUrl}/browse/${issueKey}`;
        }
      }
    }
  };

  const handleBlockingIssueClick = async (e: React.MouseEvent, blockingIssueKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await router.open(`/browse/${blockingIssueKey}`);
    } catch (error) {
      // Fallback: try using window.open with Forge's allowed method
      try {
        window.open(`${baseUrl}/browse/${blockingIssueKey}`, '_blank');
      } catch (fallbackError) {
        // Last resort: navigate in same tab
        window.location.href = `${baseUrl}/browse/${blockingIssueKey}`;
      }
    }
  };

  const handleBlockedIssueClick = async (e: React.MouseEvent, blockedIssueKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await router.open(`/browse/${blockedIssueKey}`);
    } catch (error) {
      // Fallback: try using window.open with Forge's allowed method
      try {
        window.open(`${baseUrl}/browse/${blockedIssueKey}`, '_blank');
      } catch (fallbackError) {
        // Last resort: navigate in same tab
        window.location.href = `${baseUrl}/browse/${blockedIssueKey}`;
      }
    }
  };

  return (
    <TooltipContent>
      <TooltipHeader>
        <IssueKeyLink 
          href="#"
          onClick={handleIssueKeyClick}
        >
          {issueKey}
        </IssueKeyLink>
        <HeaderRight>
          {status && (
            <StatusContainer>
              <StatusValue $statusColor={status.statusCategory?.colorName}>
                {status.name}
              </StatusValue>
            </StatusContainer>
          )}
          {issueType && (
            <IssueType>
              {issueType.iconUrl && <TypeIcon src={issueType.iconUrl} alt={issueType.name} />}
              {issueType.name}
            </IssueType>
          )}
        </HeaderRight>
      </TooltipHeader>

      <SummaryContainer>
        <EditableField
          issueKey={issueKey || ''}
          fieldName="summary"
          fieldType="textarea"
          value={summary}
          placeholder="No summary"
          multiline={true}
          maxLength={255}
          disabled={!issueKey}
        />
      </SummaryContainer>

      <DetailsGrid>
        {isFieldEditable('priority') && (
          <DetailRow>
            <Label colors={colors}>Priority:</Label>
            <Value colors={colors}>
              <EditableDropdown
                issueKey={issueKey || ''}
                fieldName="priority"
                currentValue={priority?.id}
                currentDisplayName={priority?.name}
                currentIconUrl={priority?.iconUrl}
                options={priorities.map(p => ({
                  id: p.id,
                  name: p.name,
                  iconUrl: p.iconUrl
                }))}
                placeholder="Not set"
                loading={prioritiesLoading || fieldsLoading}
                disabled={!issueKey}
              />
            </Value>
          </DetailRow>
        )}

        {isFieldEditable('assignee') && (
          <DetailRow>
            <Label colors={colors}>Assignee:</Label>
            <Value colors={colors}>
              <EditableDropdown
                issueKey={issueKey || ''}
                fieldName="assignee"
                currentValue={assignee?.accountId}
                currentDisplayName={assignee?.displayName}
                currentIconUrl={assignee?.avatarUrls?.['16x16']}
                options={assignableUsers.map(user => ({
                  id: user.accountId,
                  name: user.displayName,
                  avatarUrl: user.avatarUrls?.['16x16']
                }))}
                placeholder="Unassigned"
                loading={usersLoading || fieldsLoading}
                disabled={!issueKey}
                allowUnassign={true}
              />
            </Value>
          </DetailRow>
        )}



        {labels && labels.length > 0 && (
          <DetailRow>
            <Label colors={colors}>Labels:</Label>
            <LabelsContainer>
              {labels.slice(0, 3).map((label, index) => {
                const labelColor = getLabelColor(label);
                return (
                  <Tag
                    key={index}
                    bgColor={labelColor.bg}
                    borderColor={labelColor.border}
                    textColor={labelColor.text}
                  >
                    {label}
                  </Tag>
                );
              })}
              {labels.length > 3 && (
                <SecondaryTooltip
                  content={
                    <TooltipLabelsContainer>
                      {labels.slice(3).map((label, index) => {
                        const labelColor = getLabelColor(label);
                        return (
                          <Tag
                            key={index}
                            bgColor={labelColor.bg}
                            borderColor={labelColor.border}
                            textColor={labelColor.text}
                          >
                            {label}
                          </Tag>
                        );
                      })}
                    </TooltipLabelsContainer>
                  }
                  interactive={false}
                >
                  <MoreLabelsCircle>+{labels.length - 3}</MoreLabelsCircle>
                </SecondaryTooltip>
              )}
            </LabelsContainer>
          </DetailRow>
        )}

        {isFieldEditable('storyPoints') && (
          <DetailRow>
            <Label colors={colors}>Story Points:</Label>
            <Value colors={colors}>
              <EditableField
                issueKey={issueKey || ''}
                fieldName="storyPoints"
                fieldType="number"
                value={storyPoints}
                placeholder="Not estimated"
                min={0}
                max={100}
                step={0.5}
                disabled={!issueKey || fieldsLoading}
              />
            </Value>
          </DetailRow>
        )}



        {created && (
          <DetailRow>
            <Label colors={colors}>Created:</Label>
            <Value colors={colors}>{formatDate(created)}</Value>
          </DetailRow>
        )}

        {updated && (
          <DetailRow>
            <Label colors={colors}>Updated:</Label>
            <Value colors={colors}>{formatDate(updated)}</Value>
          </DetailRow>
        )}

        {dueDate && (
          <DetailRow>
            <Label colors={colors}>Due Date:</Label>
            <DueDateValue $isOverdue={isOverdue(dueDate)} colors={colors}>
              {formatDate(dueDate)}
              {isOverdue(dueDate) && ' ⚠️'}
            </DueDateValue>
          </DetailRow>
        )}



        {components && components.length > 0 && (
          <DetailRow>
            <Label colors={colors}>Components:</Label>
            <ComponentsContainer>
              {components.map((component, index) => (
                <Tag 
                  key={index}
                  bgColor="#e8f5e8"
                  borderColor="#a5d6a7"
                  textColor="#2e7d32"
                  size="small"
                >
                  {component.name}
                </Tag>
              ))}
            </ComponentsContainer>
          </DetailRow>
        )}

        {fixVersions && fixVersions.length > 0 && (
          <DetailRow>
            <Label colors={colors}>Fix Versions:</Label>
            <VersionsContainer>
              {fixVersions.map((version, index) => (
                <Tag 
                  key={index}
                  bgColor="#fff3e0"
                  borderColor="#ffcc02"
                  textColor="#f57c00"
                  size="small"
                >
                  {version.name}
                </Tag>
              ))}
            </VersionsContainer>
          </DetailRow>
        )}

        {blockingIssues && blockingIssues.length > 0 && (
          <DetailRow>
            <Label colors={colors}>🚫 Blocked by:</Label>
            <BlockingIssuesContainer>
              {blockingIssues.map((issue, index) => (
                <IssueSpan key={issue.key}>
                  <SecondaryTooltip content={issue.summary || issue.key}>
                    <BlockingIssueLink
                      href="#"
                      onClick={(e) => handleBlockingIssueClick(e, issue.key)}
                    >
                      {issue.key}
                    </BlockingIssueLink>
                  </SecondaryTooltip>
                  {index < blockingIssues.length - 1 && ', '}
                </IssueSpan>
              ))}
            </BlockingIssuesContainer>
          </DetailRow>
        )}

        {blockedIssues && blockedIssues.length > 0 && (
          <DetailRow>
            <Label colors={colors}>🔒 Blocking:</Label>
            <BlockingIssuesContainer>
              {blockedIssues.map((issue, index) => (
                <IssueSpan key={issue.key}>
                  <SecondaryTooltip content={issue.summary || issue.key}>
                    <BlockingIssueLink
                      href="#"
                      onClick={(e) => handleBlockedIssueClick(e, issue.key)}
                    >
                      {issue.key}
                    </BlockingIssueLink>
                  </SecondaryTooltip>
                  {index < blockedIssues.length - 1 && ', '}
                </IssueSpan>
              ))}
            </BlockingIssuesContainer>
          </DetailRow>
        )}
      </DetailsGrid>
    </TooltipContent>
  );
};

// Simple content wrapper without any styling - the unified tooltip container handles all styling
const TooltipContent = styled.div`
  display: block;
`;

const TooltipHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const IssueKeyLink = styled.a`
  font-weight: 600;
  color: #0052cc;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    color: #0065ff;
    text-decoration: underline;
  }
  
  &:visited {
    color: #0052cc;
  }
`;

const IssueType = styled.span`
  background-color: #f4f5f7;
  color: #5e6c84;
  padding: 2px 6px;
  border: 1px solid #7e8ba3;
  border-radius: 4px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TypeIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const SummaryContainer = styled.div`
  margin-bottom: 12px;
`;



const DetailsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors?: CSSThemeColors }>`
  font-size: 12px;
  color: ${props => props.colors?.text.tertiary || '#5e6c84'};
  font-weight: 500;
  min-width: 60px;
`;

const Value = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors?: CSSThemeColors }>`
  font-size: 12px;
  color: ${props => props.colors?.text.primary || '#172b4d'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusValue = styled.span<{ $statusColor?: string }>`
  font-size: 12px;
  color: #172b4d;
  padding: 2px 6px;
  border-radius: 3px;
  background-color: ${props => {
    switch (props.$statusColor) {
      case 'blue-gray': return '#ddd';
      case 'yellow': return '#fff2b8';
      case 'green': return '#d3f5d3';
      case 'brown': return '#f4e4bc';
      default: return '#f4f5f7';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$statusColor) {
      case 'blue-gray': return '#ccc';
      case 'yellow': return '#ffc400';
      case 'green': return '#36b37e';
      case 'brown': return '#bf8f00';
      default: return '#ddd';
    }
  }};
`;



const LabelsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 2px 0;
`;

const MoreLabelsCircle = styled.div`
  background-color: #6b7280;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #4b5563;
  }
`;

const BlockingIssuesContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const BlockingIssueLink = styled.a`
  font-weight: 600;
  color: #0052cc;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    color: #0065ff;
    text-decoration: underline;
  }
  
  &:visited {
    color: #0052cc;
  }
`;

const TooltipLabelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;



const DueDateValue = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$isOverdue',
})<{ $isOverdue?: boolean; colors?: CSSThemeColors }>`
  font-size: 12px;
  color: ${props => props.$isOverdue ? (props.colors?.status.error || '#d32f2f') : (props.colors?.text.primary || '#172b4d')};
  font-weight: ${props => props.$isOverdue ? '600' : '400'};
`;

const ComponentsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const VersionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;



const IssueSpan = styled.span`
  display: inline;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;



 