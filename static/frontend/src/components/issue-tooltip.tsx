import React from 'react';
import styled from 'styled-components';
import { router } from '@forge/bridge';

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
  isEpic?: boolean;
  baseUrl?: string;
}

export const IssueTooltip: React.FC<IssueTooltipProps> = ({
  issueKey,
  summary,
  priority,
  assignee,
  status,
  isEpic = false,
  baseUrl = 'https://gilitz.atlassian.net'
}) => {
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