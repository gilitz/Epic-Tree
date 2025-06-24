// Jira Configuration
// This file contains configurable values that may vary between Jira instances

export interface JiraFieldConfig {
  storyPointsField: string;
  epicLinkField?: string;
  sprintField?: string;
  // Add more custom fields as needed
}

export interface JiraApiConfig {
  maxResultsEpicIssues: number;
  maxResultsSubtasks: number;
  maxResultsAssignableUsers: number;
}

// Default configuration - can be overridden by environment variables
const DEFAULT_JIRA_FIELDS: JiraFieldConfig = {
  storyPointsField: process.env.JIRA_STORY_POINTS_FIELD || 'customfield_10016',
  epicLinkField: process.env.JIRA_EPIC_LINK_FIELD || 'customfield_10014',
  sprintField: process.env.JIRA_SPRINT_FIELD || 'customfield_10020',
};

const DEFAULT_API_CONFIG: JiraApiConfig = {
  maxResultsEpicIssues: parseInt(process.env.JIRA_MAX_RESULTS_EPIC_ISSUES || '100'),
  maxResultsSubtasks: parseInt(process.env.JIRA_MAX_RESULTS_SUBTASKS || '200'),
  maxResultsAssignableUsers: parseInt(process.env.JIRA_MAX_RESULTS_ASSIGNABLE_USERS || '50'),
};

// Export configuration
export const JIRA_FIELDS = DEFAULT_JIRA_FIELDS;
export const JIRA_API_CONFIG = DEFAULT_API_CONFIG;

// Field mapping for frontend to backend
export const FIELD_MAPPING: Record<string, string> = {
  'storyPoints': JIRA_FIELDS.storyPointsField,
  'summary': 'summary',
  'assignee': 'assignee',
  'priority': 'priority',
  'labels': 'labels'
};

// Reverse mapping for backend to frontend
export const REVERSE_FIELD_MAPPING: Record<string, string> = {
  [JIRA_FIELDS.storyPointsField]: 'storyPoints',
  'summary': 'summary',
  'assignee': 'assignee',
  'priority': 'priority',
  'labels': 'labels'
};

// Standard Jira fields that are requested from the API
export const STANDARD_JIRA_FIELDS = [
  'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
  'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
  'components', 'fixVersions'
];

// Get all fields including custom fields
export const getAllJiraFields = (includeSubtasks = false, includeParent = false): string => {
  const fields = [
    ...STANDARD_JIRA_FIELDS,
    JIRA_FIELDS.storyPointsField
  ];
  
  if (includeSubtasks) {
    fields.push('subtasks');
  }
  
  if (includeParent) {
    fields.push('parent');
  }
  
  return fields.join(',');
}; 