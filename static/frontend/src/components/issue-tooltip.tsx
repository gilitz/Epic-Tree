import React, { Fragment } from 'react';
import styled from 'styled-components';
import { router } from '@forge/bridge';
import { Tooltip } from './tooltip';

interface BlockingIssue {
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
  blockingIssues?: BlockingIssue[];
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
  blockingIssues = [],
  isEpic = false,
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
  const handleIssueKeyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (issueKey) {
      try {
        await router.open(`/browse/${issueKey}`);
      } catch (error) {
        console.error('Failed to open issue in new tab:', error);
        // Fallback: try using window.open with Forge's allowed method
        try {
          window.open(`${baseUrl}/browse/${issueKey}`, '_blank');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
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
      console.error('Failed to open blocking issue in new tab:', error);
      // Fallback: try using window.open with Forge's allowed method
      try {
        window.open(`${baseUrl}/browse/${blockingIssueKey}`, '_blank');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Last resort: navigate in same tab
        window.location.href = `${baseUrl}/browse/${blockingIssueKey}`;
      }
    }
  };

  return (
    <TooltipContainer>
      <TooltipHeader>
        <IssueKeyLink 
          href="#"
          onClick={handleIssueKeyClick}
        >
          {issueKey || 'Unknown'}
        </IssueKeyLink>
        <IssueType>{isEpic ? 'Epic' : 'Issue'}</IssueType>
      </TooltipHeader>
      
      <Summary>{summary || 'No summary available'}</Summary>
      
      <DetailsGrid>
        <DetailRow>
          <Label>Priority:</Label>
          <Value>
            {priority?.iconUrl && <PriorityIcon src={priority.iconUrl} alt={priority.name} />}
            {priority?.name || 'None'}
          </Value>
        </DetailRow>
        
        <DetailRow>
          <Label>Assignee:</Label>
          <Value>
            {assignee?.avatarUrls?.['16x16'] && (
              <Avatar src={assignee.avatarUrls['16x16']} alt={assignee.displayName} />
            )}
            {assignee?.displayName || 'Unassigned'}
          </Value>
        </DetailRow>
        
        <DetailRow>
          <Label>Status:</Label>
          <StatusValue $statusColor={status?.statusCategory?.colorName}>
            {status?.name || 'Unknown'}
          </StatusValue>
        </DetailRow>
        
        {labels && labels.length > 0 && (
          <DetailRow>
            <Label>Labels:</Label>
            <LabelsContainer>
              {labels.slice(0, 3).map((label, index) => {
                const colors = getLabelColor(label);
                return (
                  <LabelTag 
                    key={index}
                    $bgColor={colors.bg}
                    $borderColor={colors.border}
                    $textColor={colors.text}
                  >
                    {label}
                  </LabelTag>
                );
              })}
              {labels.length > 3 && (
                <Tooltip content={
                  <TooltipLabelsContainer>
                    {labels.slice(3).map((label, index) => {
                      const colors = getLabelColor(label);
                      return (
                        <TooltipLabelTag 
                          key={index}
                          $bgColor={colors.bg}
                          $borderColor={colors.border}
                          $textColor={colors.text}
                        >
                          {label}
                        </TooltipLabelTag>
                      );
                    })}
                  </TooltipLabelsContainer>
                } interactive>
                  <MoreLabelsCircle>+{labels.length - 3}</MoreLabelsCircle>
                </Tooltip>
              )}
            </LabelsContainer>
          </DetailRow>
        )}
        
        {blockingIssues && blockingIssues.length > 0 && (
          <DetailRow>
            <Label>🚫 Blocked by:</Label>
            <BlockingIssuesContainer>
              {blockingIssues.map((blockingIssue, index) => (
                <span key={index}>
                  <BlockingIssueLink
                    href="#"
                    onClick={(e) => handleBlockingIssueClick(e, blockingIssue.key)}
                  >
                    {blockingIssue.key}
                  </BlockingIssueLink>
                  {index < blockingIssues.length - 1 && ', '}
                </span>
              ))}
            </BlockingIssuesContainer>
          </DetailRow>
        )}
      </DetailsGrid>
    </TooltipContainer>
  );
};

const TooltipContainer = styled.div`
  min-width: 280px;
  max-width: 400px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
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
  border-radius: 4px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 500;
`;

const Summary = styled.div`
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
  color: #172b4d;
  font-weight: 500;
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

const LabelTag = styled.span<{ $bgColor?: string; $borderColor?: string; $textColor?: string }>`
  background-color: ${props => props.$bgColor || '#f0f9ff'};
  color: ${props => props.$textColor || '#0369a1'};
  border: 1px solid ${props => props.$borderColor || '#bae6fd'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    opacity: 0.8;
  }
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
  padding: 4px;
`;

const TooltipLabelTag = styled.span<{ $bgColor?: string; $borderColor?: string; $textColor?: string }>`
  background-color: ${props => props.$bgColor || '#f0f9ff'};
  color: ${props => props.$textColor || '#0369a1'};
  border: 1px solid ${props => props.$borderColor || '#bae6fd'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    opacity: 0.8;
  }
`; 