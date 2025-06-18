import React from 'react';
import styled from 'styled-components';
import { router } from '@forge/bridge';
import { Tooltip } from './tooltip';
import { Tag } from './tag';

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
    name: string;
    iconUrl?: string;
  };
  assignee?: {
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

export const IssueTooltip: React.FC<IssueTooltipProps> = ({
  issueKey,
  summary,
  priority,
  assignee,
  status,
  labels = [],
  storyPoints,
  issueType,
  reporter,
  created,
  updated,
  dueDate,
  resolution,
  components = [],
  fixVersions = [],
  blockingIssues = [],
  blockedIssues = [],
  isEpic: _isEpic = false,
  baseUrl = 'https://gilitz.atlassian.net'
}) => {
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
        {issueType && (
          <IssueType>
            {issueType.iconUrl && <TypeIcon src={issueType.iconUrl} alt={issueType.name} />}
            {issueType.name}
          </IssueType>
        )}
      </TooltipHeader>

      {summary && (
        <SummaryContainer>
          {summary.length > 100 ? (
            <Tooltip content={<SummaryTooltipContent>{summary}</SummaryTooltipContent>} interactive={false}>
              <Summary>{summary}</Summary>
            </Tooltip>
          ) : (
            <Summary>{summary}</Summary>
          )}
        </SummaryContainer>
      )}

      <DetailsGrid>
        {priority && (
          <DetailRow>
            <Label>Priority:</Label>
            <Value>
              {priority.iconUrl && <PriorityIcon src={priority.iconUrl} alt={priority.name} />}
              {priority.name}
            </Value>
          </DetailRow>
        )}

        {assignee && (
          <DetailRow>
            <Label>Assignee:</Label>
            <Value>
              {assignee.avatarUrls?.['16x16'] && (
                <Avatar src={assignee.avatarUrls['16x16']} alt={assignee.displayName} />
              )}
              {assignee.displayName}
            </Value>
          </DetailRow>
        )}

        {status && (
          <DetailRow>
            <Label>Status:</Label>
            <StatusValue $statusColor={status.statusCategory?.colorName}>
              {status.name}
            </StatusValue>
          </DetailRow>
        )}

        {labels && labels.length > 0 && (
          <DetailRow>
            <Label>Labels:</Label>
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
                <Tooltip
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
                </Tooltip>
              )}
            </LabelsContainer>
          </DetailRow>
        )}

        {storyPoints && (
          <DetailRow>
            <Label>Story Points:</Label>
            <StoryPointsBadge>{storyPoints}</StoryPointsBadge>
          </DetailRow>
        )}

        {reporter && (
          <DetailRow>
            <Label>Reporter:</Label>
            <Value>
              {reporter.avatarUrls?.['16x16'] && (
                <Avatar src={reporter.avatarUrls['16x16']} alt={reporter.displayName} />
              )}
              {reporter.displayName}
            </Value>
          </DetailRow>
        )}

        {created && (
          <DetailRow>
            <Label>Created:</Label>
            <Value>{formatDate(created)}</Value>
          </DetailRow>
        )}

        {updated && (
          <DetailRow>
            <Label>Updated:</Label>
            <Value>{formatDate(updated)}</Value>
          </DetailRow>
        )}

        {dueDate && (
          <DetailRow>
            <Label>Due Date:</Label>
            <DueDateValue $isOverdue={isOverdue(dueDate)}>
              {formatDate(dueDate)}
              {isOverdue(dueDate) && ' ⚠️'}
            </DueDateValue>
          </DetailRow>
        )}

        {resolution && (
          <DetailRow>
            <Label>Resolution:</Label>
            <Value>{resolution.name}</Value>
          </DetailRow>
        )}

        {components && components.length > 0 && (
          <DetailRow>
            <Label>Components:</Label>
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
            <Label>Fix Versions:</Label>
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
            <Label>🚫 Blocked by:</Label>
            <BlockingIssuesContainer>
              {blockingIssues.map((issue, index) => (
                <IssueSpan key={issue.key}>
                  <BlockingIssueLink
                    href="#"
                    onClick={(e) => handleBlockingIssueClick(e, issue.key)}
                  >
                    {issue.key}
                  </BlockingIssueLink>
                  {index < blockingIssues.length - 1 && ', '}
                </IssueSpan>
              ))}
            </BlockingIssuesContainer>
          </DetailRow>
        )}

        {blockedIssues && blockedIssues.length > 0 && (
          <DetailRow>
            <Label>🔒 Blocking:</Label>
            <BlockingIssuesContainer>
              {blockedIssues.map((issue, index) => (
                <IssueSpan key={issue.key}>
                  <BlockingIssueLink
                    href="#"
                    onClick={(e) => handleBlockedIssueClick(e, issue.key)}
                  >
                    {issue.key}
                  </BlockingIssueLink>
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

const Summary = styled.div`
  font-size: 13px;
  line-height: 1.4;
  color: #172b4d;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 2.8em; /* Approximately 2 lines */
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
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

const Label = styled.span`
  font-size: 12px;
  color: #5e6c84;
  font-weight: 500;
  min-width: 60px;
`;

const Value = styled.span`
  font-size: 12px;
  color: #172b4d;
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

const PriorityIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const Avatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
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



const StoryPointsBadge = styled.span`
  background-color: #1976d2;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
  height: fit-content;
  min-width: 18px;
  min-height: 18px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DueDateValue = styled.span<{ $isOverdue?: boolean }>`
  font-size: 12px;
  color: ${props => props.$isOverdue ? '#d32f2f' : '#172b4d'};
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

const SummaryTooltipContent = styled.div`
  max-width: 300px;
  white-space: pre-wrap;
`;

const IssueSpan = styled.span`
  display: inline;
`;

 