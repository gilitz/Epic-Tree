import React, { useState } from 'react';
import styled from 'styled-components';
import { useAIEpicBreakdown } from '../hooks/use-ai-epic-breakdown';
import { useTheme } from '../theme/theme-context';

interface StoryBreakdownSuggestion {
  title: string;
  description: string;
  storyPoints: number;
  priority: 'High' | 'Medium' | 'Low';
  acceptanceCriteria: string[];
  labels: string[];
  estimationReasoning: string;
}

interface TreeNodeData {
  key?: string;
  id?: string;
  summary?: string;
  description?: string;
  status?: { name: string };
  priority?: { name: string };
  assignee?: {
    displayName: string;
    avatarUrls?: { '16x16'?: string };
  };
  reporter?: {
    displayName: string;
    avatarUrls?: { '16x16'?: string };
  };
  issueType?: { name: string };
  storyPoints?: number;
  labels?: string[];
  children?: TreeNodeData[];
  blockingIssues?: Array<{
    key?: string;
    id?: string;
    summary?: string;
    status?: { name: string };
  }>;
  created?: string;
  updated?: string;
  duedate?: string;
  resolutiondate?: string;
  fixVersions?: Array<{ name: string }>;
  components?: Array<{ name: string }>;
  isEpic?: boolean;
}

interface AIEpicBreakdownProps {
  epicSummary: string;
  epicDescription: string;
  existingIssues?: unknown[];
  treeData?: TreeNodeData;
  onCreateStories?: (suggestions: StoryBreakdownSuggestion[]) => void;
}

export const AIEpicBreakdown: React.FC<AIEpicBreakdownProps> = ({
  epicSummary: _epicSummary,
  epicDescription: _epicDescription,
  existingIssues: _existingIssues,
  treeData,
  onCreateStories: _onCreateStories
}) => {
  const { breakdown: _breakdown, loading: _loading, error, generateBreakdown: _generateBreakdown, refreshData: _refreshData } = useAIEpicBreakdown();
  const { colors, isDarkTheme } = useTheme();
  const [_selectedSuggestions, _setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Calculate real data from the tree
  const realEpicData = React.useMemo(() => {
    if (!treeData) {
      return {
        totalStoryPoints: 0,
        totalIssues: 0,
        totalSubtasks: 0,
        statusBreakdown: {},
        assigneeBreakdown: {},
        priorityBreakdown: {},
        labelDistribution: {},
        uniqueAssignees: [],
        createdDate: null,
        blockedIssuesCount: 0,
        blockedIssues: [],
        totalLabelsCount: 0,
        epicOverview: {
          key: '',
          summary: '',
          description: '',
          status: '',
          priority: '',
          dueDate: null,
          fixVersions: [],
          components: [],
          labels: [],
          reporter: undefined,
          assignee: undefined,
          updated: null,
          resolutionDate: null
        }
      };
    }

    let totalStoryPoints = 0;
    let totalIssues = 0;
    let totalSubtasks = 0;
    const statusBreakdown: Record<string, number> = {};
    const assigneeBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};
    const uniqueAssignees: Array<{displayName: string, avatarUrl?: string}> = [];
    const assigneeSet = new Set<string>();

    // Get epic info
    const createdDate = treeData.created;
    // Check epic assignee (only if assigned)
    if (treeData.assignee?.displayName) {
      if (!assigneeSet.has(treeData.assignee.displayName)) {
        assigneeSet.add(treeData.assignee.displayName);
        uniqueAssignees.push({
          displayName: treeData.assignee.displayName,
          avatarUrl: treeData.assignee.avatarUrls?.['16x16']
        });
      }
    }

    // Count epic story points
    if (treeData.storyPoints) {
      totalStoryPoints += treeData.storyPoints;
    }

    // Recursively count from children
    const countFromNode = (node: TreeNodeData) => {
      if (node.children) {
        node.children.forEach((child: TreeNodeData) => {
          // Count story points
          if (child.storyPoints) {
            totalStoryPoints += child.storyPoints;
          }

          // Count issues vs subtasks
          if (child.children && child.children.length > 0) {
            totalIssues++;
            totalSubtasks += child.children.length;
          } else if (!child.isEpic) {
            if (child.issueType?.name === 'Sub-task') {
              totalSubtasks++;
            } else {
              totalIssues++;
            }
          }

          // Count status breakdown
          if (child.status?.name) {
            statusBreakdown[child.status.name] = (statusBreakdown[child.status.name] || 0) + 1;
          }

          // Count assignee breakdown (only for assigned users)
          if (child.assignee?.displayName) {
            const assigneeName = child.assignee.displayName;
            assigneeBreakdown[assigneeName] = (assigneeBreakdown[assigneeName] || 0) + 1;

            // Track unique assignees
            if (!assigneeSet.has(assigneeName)) {
              assigneeSet.add(assigneeName);
              uniqueAssignees.push({
                displayName: assigneeName,
                avatarUrl: child.assignee.avatarUrls?.['16x16']
              });
            }
          } else {
            // Count unassigned separately
            assigneeBreakdown['Unassigned'] = (assigneeBreakdown['Unassigned'] || 0) + 1;
          }

          // Count priority breakdown
          if (child.priority?.name) {
            priorityBreakdown[child.priority.name] = (priorityBreakdown[child.priority.name] || 0) + 1;
          }

          // Recurse into children
          countFromNode(child);
        });
      }
    };

    countFromNode(treeData);

    // Smart work distribution based on labels and issue types

    const labelDistribution: Record<string, number> = {};
    let totalLabelsCount = 0;

    // Collect all labels and their frequencies
    const collectLabelsFromNode = (node: TreeNodeData) => {
      if (node.labels && Array.isArray(node.labels)) {
        node.labels.forEach((label: string) => {
          labelDistribution[label] = (labelDistribution[label] || 0) + 1;
          totalLabelsCount++;
        });
      }
      if (node.children) {
        node.children.forEach((child: TreeNodeData) => collectLabelsFromNode(child));
      }
    };

    // First collect all labels to understand the label distribution
    collectLabelsFromNode(treeData);

    // Count blocked issues and collect detailed information
    let blockedIssuesCount = 0;
    const blockedIssues: Array<{
      key: string;
      summary: string;
      status: string;
      assignee?: {displayName: string, avatarUrl?: string};
      priority?: string;
      dueDate?: string;
      blockingIssues: Array<{key: string, summary: string, status: string}>;
      labels?: string[];
    }> = [];
    
    const countBlockedFromNode = (node: TreeNodeData) => {
      if (node.blockingIssues && node.blockingIssues.length > 0) {
        blockedIssuesCount++;
        blockedIssues.push({
          key: node.key || node.id || '',
          summary: node.summary || 'No summary',
          status: node.status?.name || 'Unknown',
          assignee: node.assignee ? {
            displayName: node.assignee.displayName,
            avatarUrl: node.assignee.avatarUrls?.['16x16']
          } : undefined,
          priority: node.priority?.name,
          dueDate: node.duedate,
          blockingIssues: node.blockingIssues.map((blocking) => ({
            key: blocking.key || blocking.id || '',
            summary: blocking.summary || 'No summary',
            status: blocking.status?.name || 'Unknown'
          })),
          labels: node.labels || []
        });
      }
      if (node.children) {
        node.children.forEach((child: TreeNodeData) => countBlockedFromNode(child));
      }
    };
    countBlockedFromNode(treeData);

    // Get epic overview data
    const epicOverview = {
      key: treeData.key || treeData.id || '',
      summary: treeData.summary || '',
      description: treeData.description || '',
      status: treeData.status?.name || '',
      priority: treeData.priority?.name || '',
      dueDate: treeData.duedate,
      fixVersions: treeData.fixVersions || [],
      components: treeData.components || [],
      labels: treeData.labels || [],
      reporter: treeData.reporter ? {
        displayName: treeData.reporter.displayName,
        avatarUrl: treeData.reporter.avatarUrls?.['16x16']
      } : undefined,
      assignee: treeData.assignee ? {
        displayName: treeData.assignee.displayName,
        avatarUrl: treeData.assignee.avatarUrls?.['16x16']
      } : undefined,
      updated: treeData.updated,
      resolutionDate: treeData.resolutiondate
    };

    return {
      totalStoryPoints,
      totalIssues,
      totalSubtasks,
      statusBreakdown,
      assigneeBreakdown,
      priorityBreakdown,
      labelDistribution,
      uniqueAssignees,
      createdDate,
      blockedIssuesCount,
      blockedIssues,
      totalLabelsCount,
      epicOverview
    };
  }, [treeData]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderCollapsibleList = <T,>(items: T[], sectionId: string, renderItem: (item: T, index: number) => React.ReactNode) => {
    const isExpanded = expandedSections.has(sectionId);
    const shouldShowToggle = items.length > 5;
    const displayItems = shouldShowToggle && !isExpanded ? items.slice(0, 5) : items;

    return (
      <>
        {displayItems.map(renderItem)}
        {shouldShowToggle && (
          <ToggleButton onClick={() => toggleSection(sectionId)} $isDarkTheme={isDarkTheme}>
            {isExpanded ? '▲ Show Less' : `▼ Show ${items.length - 5} More`}
          </ToggleButton>
        )}
      </>
    );
  };

  return (
    <Container $isDarkTheme={isDarkTheme}>
      <GilContainer>
        <Header>
          <HeaderLeft>
            <Title>
              Epic Breakdown
            </Title>
            {realEpicData.createdDate && (
              <CreatedDate>
                Created: {new Date(realEpicData.createdDate).toLocaleDateString()}
              </CreatedDate>
            )}
          </HeaderLeft>
        </Header>

        {error && (
          <ErrorMessage $isDarkTheme={isDarkTheme}>
            <ErrorIcon>⚠️</ErrorIcon>
            {error}
          </ErrorMessage>
        )}

        <BreakdownContent>
          {/* Epic Statistics */}
          <StatsSection $isDarkTheme={isDarkTheme}>
            <StatsGrid>
              <StatCard $isDarkTheme={isDarkTheme} style={{ borderLeft: '4px solid #6554C0' }}>
                <CardTitle>Story Points</CardTitle>
                <CardValue $color="#6554C0">{realEpicData.totalStoryPoints}</CardValue>
              </StatCard>
              <StatCard $isDarkTheme={isDarkTheme} style={{ borderLeft: '4px solid #36B37E' }}>
                <CardTitle>Issues</CardTitle>
                <CardValue $color="#36B37E">{realEpicData.totalIssues}</CardValue>
              </StatCard>
              <StatCard $isDarkTheme={isDarkTheme} style={{ borderLeft: '4px solid #FF8B00' }}>
                <CardTitle>Subtasks</CardTitle>
                <CardValue $color="#FF8B00">{realEpicData.totalSubtasks}</CardValue>
              </StatCard>
            </StatsGrid>

            {/* Epic Overview */}
            <EpicOverviewSection $isDarkTheme={isDarkTheme} style={{ borderLeft: '4px solid #8B5CF6', marginBottom: '24px' }}>
              <SectionSubtitle>📋 Epic Overview</SectionSubtitle>
              <OverviewGrid>
                <OverviewItem>
                  <OverviewLabel>Status</OverviewLabel>
                  <OverviewValue $color={colors.text.primary}>
                    {realEpicData.epicOverview.status || 'No status'}
                  </OverviewValue>
                </OverviewItem>
                <OverviewItem>
                  <OverviewLabel>Priority</OverviewLabel>
                  <OverviewValue $color={colors.text.primary}>
                    {realEpicData.epicOverview.priority || 'No priority'}
                  </OverviewValue>
                </OverviewItem>
                {realEpicData.epicOverview.dueDate && (
                  <OverviewItem>
                    <OverviewLabel>Due Date</OverviewLabel>
                    <OverviewValue $color={colors.text.primary}>
                      {new Date(realEpicData.epicOverview.dueDate).toLocaleDateString()}
                    </OverviewValue>
                  </OverviewItem>
                )}
                {realEpicData.epicOverview.fixVersions.length > 0 && (
                  <OverviewItem>
                    <OverviewLabel>Fix Versions</OverviewLabel>
                    <OverviewValue $color={colors.text.primary}>
                      {realEpicData.epicOverview.fixVersions.map((v) => v.name).join(', ')}
                    </OverviewValue>
                  </OverviewItem>
                )}
                {realEpicData.epicOverview.components.length > 0 && (
                  <OverviewItem>
                    <OverviewLabel>Components</OverviewLabel>
                    <OverviewValue $color={colors.text.primary}>
                      {realEpicData.epicOverview.components.map((c) => c.name).join(', ')}
                    </OverviewValue>
                  </OverviewItem>
                )}
                {realEpicData.epicOverview.reporter && (
                  <OverviewItem>
                    <OverviewLabel>Reporter</OverviewLabel>
                    <ReporterInfo>
                      {realEpicData.epicOverview.reporter.avatarUrl && (
                        <UserAvatar src={realEpicData.epicOverview.reporter.avatarUrl} alt="Reporter" />
                      )}
                      <OverviewValue $color={colors.text.primary}>
                        {realEpicData.epicOverview.reporter.displayName}
                      </OverviewValue>
                    </ReporterInfo>
                  </OverviewItem>
                )}
                {realEpicData.epicOverview.updated && (
                  <OverviewItem>
                    <OverviewLabel>Last Updated</OverviewLabel>
                    <OverviewValue $color={colors.text.primary}>
                      {new Date(realEpicData.epicOverview.updated).toLocaleDateString()}
                    </OverviewValue>
                  </OverviewItem>
                )}
              </OverviewGrid>
            </EpicOverviewSection>

            {/* Status Distribution */}
            <WorkBreakdown $isDarkTheme={isDarkTheme} style={{ marginBottom: '24px', borderLeft: '4px solid #F59E0B' }}>
              <SectionSubtitle>📈 Status Distribution</SectionSubtitle>
              <BreakdownBars>
                {renderCollapsibleList(
                  Object.entries(realEpicData.statusBreakdown),
                  'statusDistribution',
                  ([status, count]) => (
                    <BreakdownBar key={status}>
                      <BarLabel>{status}</BarLabel>
                      <BarContainer $isDarkTheme={isDarkTheme}>
                        <BarFill 
                          $width={((count as number) / Math.max(realEpicData.totalIssues + realEpicData.totalSubtasks, 1)) * 100}
                          $color="#F59E0B"
                        />
                      </BarContainer>
                      <BarValue>{count} issues</BarValue>
                    </BreakdownBar>
                  )
                )}
              </BreakdownBars>
            </WorkBreakdown>

            {/* Labels Distribution */}
            {Object.keys(realEpicData.labelDistribution).length > 0 && (
              <WorkBreakdown $isDarkTheme={isDarkTheme} style={{ marginBottom: '24px', borderLeft: '4px solid #6366F1' }}>
                <SectionSubtitle>🏷️ Labels Distribution</SectionSubtitle>
                <BreakdownBars>
                  {renderCollapsibleList(
                    Object.entries(realEpicData.labelDistribution),
                    'labelsDistribution',
                    ([label, count]) => (
                      <BreakdownBar key={label}>
                        <BarLabel>{label}</BarLabel>
                        <BarContainer $isDarkTheme={isDarkTheme}>
                          <BarFill 
                            $width={((count as number) / Math.max(realEpicData.totalLabelsCount, 1)) * 100}
                            $color="#6366F1"
                          />
                        </BarContainer>
                        <BarValue>{count} uses</BarValue>
                      </BreakdownBar>
                    )
                  )}
                </BreakdownBars>
              </WorkBreakdown>
            )}

            {/* Assigned Users */}
            <AssignedUsersSection $isDarkTheme={isDarkTheme} style={{ borderLeft: '4px solid #8B5CF6' }}>
              <SectionSubtitle>👥 Assigned Users</SectionSubtitle>
              <UsersList>
                {realEpicData.uniqueAssignees.filter(user => user.displayName !== 'Unassigned').length > 0 ? (
                  renderCollapsibleList(
                    realEpicData.uniqueAssignees.filter(user => user.displayName !== 'Unassigned'),
                    'assignedUsers',
                    (user, index) => (
                      <UserCard key={index} $isDarkTheme={isDarkTheme}>
                        {user.avatarUrl && (
                          <UserAvatar src={user.avatarUrl} alt={user.displayName} />
                        )}
                        <UserName>{user.displayName}</UserName>
                      </UserCard>
                    )
                  )
                ) : (
                  <NoUsersMessage>No users assigned</NoUsersMessage>
                )}
              </UsersList>
            </AssignedUsersSection>

            {/* Blocked Issues */}
            {realEpicData.blockedIssuesCount > 0 && (
              <WorkBreakdown $isDarkTheme={isDarkTheme} style={{ marginBottom: '24px', borderLeft: '4px solid #EF4444' }}>
                <SectionSubtitle>🚫 Blocked Issues ({realEpicData.blockedIssuesCount})</SectionSubtitle>
                <div>
                  {renderCollapsibleList(
                    realEpicData.blockedIssues,
                    'blockedIssues',
                    (issue) => (
                      <BlockedIssueItem key={issue.key} $isDarkTheme={isDarkTheme}>
                        <BlockedIssueLeft>
                          <BlockedIssueKey 
                            href={`/browse/${issue.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(`/browse/${issue.key}`, '_blank');
                            }}
                          >
                            {issue.key}
                          </BlockedIssueKey>
                          <BlockedIssueSummary>{issue.summary}</BlockedIssueSummary>
                        </BlockedIssueLeft>
                        
                        <BlockedIssueRight>
                          <BlockedIssueStatusTag $status={issue.status} $isDarkTheme={isDarkTheme}>
                            {issue.status}
                          </BlockedIssueStatusTag>
                          
                          {issue.assignee && (
                            <BlockedIssueAssignee>
                              {issue.assignee.avatarUrl && (
                                <UserAvatar src={issue.assignee.avatarUrl} alt="Assignee" />
                              )}
                              <span>{issue.assignee.displayName}</span>
                            </BlockedIssueAssignee>
                          )}
                          
                          {issue.priority && (
                            <BlockedIssuePriority $priority={issue.priority}>
                              {issue.priority}
                            </BlockedIssuePriority>
                          )}
                          
                          {issue.blockingIssues.length > 0 && (
                            <BlockedByInfo>
                              Blocked by: {issue.blockingIssues.map((blockingIssue, idx) => (
                                <React.Fragment key={idx}>
                                  {idx > 0 && ', '}
                                  <BlockingIssueLink
                                    href={`/browse/${blockingIssue.key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(`/browse/${blockingIssue.key}`, '_blank');
                                    }}
                                  >
                                    {blockingIssue.key}
                                  </BlockingIssueLink>
                                </React.Fragment>
                              ))}
                            </BlockedByInfo>
                          )}
                          
                          {issue.dueDate && (
                            <BlockedIssueDueDate>
                              Due: {new Date(issue.dueDate).toLocaleDateString()}
                            </BlockedIssueDueDate>
                          )}
                        </BlockedIssueRight>
                      </BlockedIssueItem>
                    )
                  )}
                </div>
              </WorkBreakdown>
            )}
          </StatsSection>


        </BreakdownContent>
      </GilContainer>
    </Container>
  );
};

const GilContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  padding: 40px 160px;
`;

// Styled Components
const Container = styled.div<{ $isDarkTheme?: boolean }>`
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CreatedDate = styled.div`
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 400;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const ErrorMessage = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: ${props => props.$isDarkTheme ? '#2D1B1B' : '#FFF2F2'};
  border: 1px solid #FF5630;
  border-radius: 8px;
  color: #FF5630;
  margin-bottom: 20px;
`;

const ErrorIcon = styled.span`
  font-size: 16px;
`;

const BreakdownContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsSection = styled.div<{ $isDarkTheme: boolean }>`
  background: ${props => props.$isDarkTheme ? 'var(--color-background-card)' : '#FAFBFC'};
  border: 1px solid var(--color-border-container);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const StatCard = styled.div<{ $isDarkTheme: boolean }>`
  background: ${props => props.$isDarkTheme ? '#1E1E1E' : '#FFFFFF'};
  border: 1px solid var(--color-border-container);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const AssignedUsersSection = styled.div<{ $isDarkTheme: boolean }>`
  background: ${props => props.$isDarkTheme ? '#1E1E1E' : '#FFFFFF'};
  border: 1px solid var(--color-border-container);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const UsersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const UserCard = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$isDarkTheme ? '#2A2A2A' : '#F4F5F7'};
  border: 1px solid var(--color-border-container);
  border-radius: 6px;
  padding: 8px 12px;
`;

const UserAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const UserName = styled.span`
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
`;

const NoUsersMessage = styled.div`
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 14px;
`;



const SectionSubtitle = styled.h4`
  color: var(--color-text-secondary);
  margin: 16px 0 12px 0;
  font-size: 14px;
  font-weight: 500;
`;



const CardTitle = styled.div`
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
`;

const CardValue = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 32px;
  font-weight: 700;
`;

const WorkBreakdown = styled.div<{ $isDarkTheme: boolean }>`
  background: ${props => props.$isDarkTheme ? '#1E1E1E' : '#FFFFFF'};
  border: 1px solid var(--color-border-container);
  border-radius: 8px;
  padding: 16px;
`;

const BreakdownBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BreakdownBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BarLabel = styled.div`
  min-width: 80px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
`;

const BarContainer = styled.div<{ $isDarkTheme: boolean }>`
  flex: 1;
  height: 8px;
  background: ${props => props.$isDarkTheme ? '#2A2A2A' : '#F4F5F7'};
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  transition: width 0.5s ease;
`;

const BarValue = styled.div`
  min-width: 50px;
  color: var(--color-text-secondary);
  font-size: 14px;
  text-align: right;
`;



const ToggleButton = styled.button<{ $isDarkTheme: boolean }>`
  width: 100%;
  padding: 8px 12px;
  background: ${props => props.$isDarkTheme ? '#2A2A2A' : '#F4F5F7'};
  border: 1px solid var(--color-border-container);
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: 8px;
  
  &:hover {
    background: ${props => props.$isDarkTheme ? '#3A3A3A' : '#E4E6EA'};
    border-color: var(--color-border-hover);
  }
`;

const BlockedIssueItem = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${props => props.$isDarkTheme ? '#2A1F1F' : '#FFF8F8'};
  border: 1px solid #FF5630;
  border-radius: 6px;
  margin-bottom: 8px;
  gap: 16px;
`;

const BlockedIssueLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const BlockedIssueRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const BlockedIssueStatusTag = styled.span<{ $status: string; $isDarkTheme: boolean }>`
  background: ${props => {
    const status = props.$status.toLowerCase();
    if (status.includes('done') || status.includes('closed') || status.includes('resolved')) {
      return props.$isDarkTheme ? '#0f5132' : '#d1e7dd';
    } else if (status.includes('progress') || status.includes('development') || status.includes('review')) {
      return props.$isDarkTheme ? '#055160' : '#cff4fc';
    } else {
      return props.$isDarkTheme ? '#664d03' : '#fff3cd';
    }
  }};
  color: ${props => {
    const status = props.$status.toLowerCase();
    if (status.includes('done') || status.includes('closed') || status.includes('resolved')) {
      return props.$isDarkTheme ? '#75b798' : '#0f5132';
    } else if (status.includes('progress') || status.includes('development') || status.includes('review')) {
      return props.$isDarkTheme ? '#6edff6' : '#055160';
    } else {
      return props.$isDarkTheme ? '#ffda6a' : '#664d03';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${props => {
    const status = props.$status.toLowerCase();
    if (status.includes('done') || status.includes('closed') || status.includes('resolved')) {
      return props.$isDarkTheme ? '#0f5132' : '#b8d4c2';
    } else if (status.includes('progress') || status.includes('development') || status.includes('review')) {
      return props.$isDarkTheme ? '#055160' : '#9eeaf9';
    } else {
      return props.$isDarkTheme ? '#664d03' : '#f5e6a3';
    }
  }};
`;

const BlockedIssueKey = styled.a`
  background: #FF5630;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-block;
  width: fit-content;
  white-space: nowrap;
  
  &:hover {
    background: #DE350B;
    color: white;
  }
  
  &:visited {
    color: white;
  }
`;

const BlockedIssueSummary = styled.div`
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;



const EpicOverviewSection = styled.div<{ $isDarkTheme: boolean }>`
  background: ${props => props.$isDarkTheme ? '#1E1E1E' : '#FFFFFF'};
  border: 1px solid var(--color-border-container);
  border-radius: 8px;
  padding: 16px;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const OverviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OverviewLabel = styled.div`
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OverviewValue = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 14px;
  font-weight: 500;
`;

const ReporterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;



const BlockedIssueAssignee = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
`;

const BlockedIssuePriority = styled.span<{ $priority: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch (props.$priority.toLowerCase()) {
      case 'highest': return '#FF5630';
      case 'high': return '#FF8B00';
      case 'medium': return '#FFAB00';
      case 'low': return '#36B37E';
      case 'lowest': return '#00B8D9';
      default: return '#6B778C';
    }
  }}20;
  color: ${props => {
    switch (props.$priority.toLowerCase()) {
      case 'highest': return '#FF5630';
      case 'high': return '#FF8B00';
      case 'medium': return '#FFAB00';
      case 'low': return '#36B37E';
      case 'lowest': return '#00B8D9';
      default: return '#6B778C';
    }
  }};
`;



const BlockedIssueDueDate = styled.div`
  color: var(--color-text-secondary);
  font-size: 12px;
`;

const BlockedByInfo = styled.div`
  color: var(--color-text-secondary);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;



const BlockingIssueLink = styled.a`
  color: #3B82F6;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    color: #2563EB;
    text-decoration: underline;
  }
`;



 