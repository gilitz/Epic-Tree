// Frontend Jira Configuration
// This file contains configurable values for Jira field mappings

export interface JiraFieldConfig {
  storyPointsField: string;
  epicLinkField?: string;
  sprintField?: string;
}

// Default configuration - these should match the backend configuration
// In a real deployment, these could be fetched from the backend or environment
const DEFAULT_JIRA_FIELDS: JiraFieldConfig = {
  storyPointsField: 'customfield_10016', // Default story points field
  epicLinkField: 'customfield_10014',    // Default epic link field
  sprintField: 'customfield_10020',      // Default sprint field
};

// Export configuration
export const JIRA_FIELDS = DEFAULT_JIRA_FIELDS;

// Helper function to get story points from issue data
export const getStoryPoints = (issueFields: Record<string, unknown>): number => {
  return (issueFields?.[JIRA_FIELDS.storyPointsField] as number) || 
         (issueFields?.storyPoints as number) || 
         0;
};

// Helper function to get epic link from issue data
export const getEpicLink = (issueFields: Record<string, unknown>): string | undefined => {
  return issueFields?.[JIRA_FIELDS.epicLinkField] as string;
};

// Helper function to get sprint from issue data
export const getSprint = (issueFields: Record<string, unknown>): unknown => {
  return issueFields?.[JIRA_FIELDS.sprintField];
}; 