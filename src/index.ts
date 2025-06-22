import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface RequestContext {
  extension: {
    issue: {
      key: string;
    };
  };
}

interface StoryBreakdownSuggestion {
  title: string;
  description: string;
  storyPoints: number;
  priority: 'High' | 'Medium' | 'Low';
  acceptanceCriteria: string[];
  labels: string[];
  estimationReasoning: string;
}

interface EpicBreakdownResponse {
  suggestions: StoryBreakdownSuggestion[];
  totalEstimatedPoints: number;
  breakdown: {
    frontend: number;
    backend: number;
    testing: number;
    design: number;
  };
  risks: string[];
  recommendations: string[];
}

interface Label {
  id: string;
  name: string;
}

interface IssueResponse {
  fields: {
    labels: Label[];
  };
}

// API Response types
interface ApiResponse {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
      statusCategory: {
        colorName: string;
      };
    };
    priority: {
      id?: string;
      name: string;
      iconUrl: string;
    };
    assignee: {
      accountId?: string;
      displayName: string;
      avatarUrls: Record<string, string>;
    } | null;
    reporter: {
      displayName: string;
      avatarUrls: Record<string, string>;
    } | null;
    labels: Label[];
    issuelinks: unknown[];
    issuetype: {
      name: string;
      iconUrl: string;
    };
    created: string;
    updated: string;
    duedate: string | null;
    resolution: {
      name: string;
    } | null;
    components: Array<{ name: string }>;
    fixVersions: Array<{ name: string }>;
    customfield_10016: number | null; // Story Points
    subtasks?: Array<{ key: string }>;
    parent?: {
      key: string;
    };
  };
}

interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

const resolver = new Resolver();

// Helper function to detect network/proxy errors
const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  const errorString = error.toString().toLowerCase();
  return errorString.includes('squid') || 
         errorString.includes('proxy') || 
         errorString.includes('network') ||
         errorString.includes('cannot forward') ||
         errorString.includes('tunnel.atlassian-dev.net') ||
         errorString.includes('unable to forward');
};

// Helper function to safely make API requests with enhanced error handling
const safeApiRequest = async <T>(requestFn: () => Promise<ApiResponse>, fallbackData: T, context: string): Promise<T> => {
  try {
    const response = await requestFn();
    
    if (!response.ok) {
      console.error(`API request failed for ${context}: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error('Error response:', errorText);
      return fallbackData;
    }
    
    const data = await response.json() as T;
    return data;
  } catch (error) {
    console.error(`Error in API request for ${context}:`, error);
    
    if (isNetworkError(error)) {
      console.error('Network/proxy error detected, returning fallback data');
    }
    
    return fallbackData;
  }
};

resolver.define('fetchLabels', async (req: unknown): Promise<Label[]> => {
  const key = (req as { context: RequestContext }).context.extension.issue.key;
  
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=labels`);
  
  const data: IssueResponse = await safeApiRequest(requestFn, { fields: { labels: [] } }, `labels for ${key}`);
  
  const labels = data.fields?.labels || [];
  
  if (labels.length === 0) {
    console.warn(`${key}: No labels found`);
  }
  
  return labels;
});

resolver.define('fetchIssueById', async (data: unknown): Promise<JiraIssue> => {
  const issueId = (data as { payload: { issueId: string } }).payload.issueId;
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016' // Story Points
  ].join(',');
  
  const fallbackData: JiraIssue = {
    key: issueId || 'UNKNOWN',
    fields: {
      summary: `Issue ${issueId} (Network Error)`,
      status: { name: 'Unknown', statusCategory: { colorName: 'medium-gray' } },
      priority: { name: 'Unknown', iconUrl: '' },
      assignee: null,
      reporter: null,
      labels: [],
      issuelinks: [],
      issuetype: { name: 'Unknown', iconUrl: '' },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      duedate: null,
      resolution: null,
      components: [],
      fixVersions: [],
      customfield_10016: null
    }
  };
  
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/issue/${issueId}?fields=${fields}`);
  
  const result = await safeApiRequest(requestFn, fallbackData, `issue ${issueId}`);
  
  return result;
});

resolver.define('fetchIssuesByEpicId', async (data: unknown): Promise<JiraSearchResponse> => {
  const epicId = (data as { payload: { epicId: string } }).payload.epicId;
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016', 'subtasks' // Story Points and subtasks
  ].join(',');
  
  const fallbackData: JiraSearchResponse = {
    issues: [],
    total: 0,
    maxResults: 0,
    startAt: 0
  };
  
  const jql = `parent=${epicId}`;
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}&fields=${fields}&maxResults=100`);
  
  const result = await safeApiRequest(requestFn, fallbackData, `issues for epic ${epicId}`);
  
  return result;
});

resolver.define('fetchSubtasksByParentKeys', async (data: unknown): Promise<JiraSearchResponse> => {
  const parentKeys: string[] = (data as { payload: { parentKeys: string[] } }).payload.parentKeys;
  
  if (!parentKeys || parentKeys.length === 0) {
    return { issues: [], total: 0, maxResults: 0, startAt: 0 };
  }
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016', 'parent' // Story Points and parent
  ].join(',');
  
  const fallbackData: JiraSearchResponse = {
    issues: [],
    total: 0,
    maxResults: 0,
    startAt: 0
  };
  
  // Try simpler JQL query - just use parent without issuetype filter
  const parentKeysJql = parentKeys.map((key: string) => `parent=${key}`).join(' OR ');
  const jql = `(${parentKeysJql})`;
  
  
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${fields}&maxResults=200`);
  
  const result = await safeApiRequest(requestFn, fallbackData, `subtasks for parents ${parentKeys.join(', ')}`);
  
  return result;
});

resolver.define('fetchSubtasksByKeys', async (data: unknown): Promise<JiraSearchResponse> => {
  const subtaskKeys: string[] = (data as { payload: { subtaskKeys: string[] } }).payload.subtaskKeys;
  
  if (!subtaskKeys || subtaskKeys.length === 0) {
    return { issues: [], total: 0, maxResults: 0, startAt: 0 };
  }
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016', 'parent' // Story Points and parent
  ].join(',');
  
  const fallbackData: JiraSearchResponse = {
    issues: [],
    total: 0,
    maxResults: 0,
    startAt: 0
  };
  
  // Create JQL to find issues by their keys directly
  const keysJql = subtaskKeys.map((key: string) => `key="${key}"`).join(' OR ');
  const jql = `${keysJql}`;
  
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}&fields=${fields}&maxResults=200`);
  
  const result = await safeApiRequest(requestFn, fallbackData, `subtasks by keys ${subtaskKeys.join(', ')}`);
  
  return result;
});

// New resolver for fetching available priorities
resolver.define('fetchPriorities', async (): Promise<Array<{ id: string; name: string; iconUrl: string }>> => {
  const fallbackData: Array<{ id: string; name: string; iconUrl: string }> = [];
  
  try {
    const response = await api.asUser().requestJira(route`/rest/api/3/priority`);
    
    if (!response.ok) {
      console.error('❌ BACKEND: Failed to fetch priorities:', response.status);
      return fallbackData;
    }
    
    const priorities = await response.json() as Array<{ id: string; name: string; iconUrl: string }>;
    return priorities;
    
  } catch (error) {
    console.error('❌ BACKEND: Error fetching priorities:', error);
    return fallbackData;
  }
});

// New resolver for fetching assignable users for a project
resolver.define('fetchAssignableUsers', async (data: unknown): Promise<Array<{ accountId: string; displayName: string; avatarUrls: Record<string, string> }>> => {
  const { issueKey } = (data as { payload: { issueKey: string } }).payload;
  
  const fallbackData: Array<{ accountId: string; displayName: string; avatarUrls: Record<string, string> }> = [];
  
  if (!issueKey) {
    return fallbackData;
  }
  
  try {
    // Try the issue-specific assignable users endpoint first
    let response = await api.asUser().requestJira(route`/rest/api/3/user/assignable/search?issueKey=${issueKey}&maxResults=50`);
    
    if (!response.ok) {
      
      // Fallback: Get the project key from the issue and search by project
      try {
        const issueResponse = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}?fields=project`);
        if (issueResponse.ok) {
          const issueData = await issueResponse.json() as { fields: { project: { key: string } } };
          const projectKey = issueData.fields.project.key;
          
          response = await api.asUser().requestJira(route`/rest/api/3/user/assignable/search?project=${projectKey}&maxResults=50`);
        }
      } catch (projectError) {
        console.error('👥 BACKEND: Failed to get project info:', projectError);
      }
    }
    
    if (!response.ok) {
      console.error('❌ BACKEND: Failed to fetch assignable users:', response.status);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error('❌ BACKEND: Error details:', errorText);
      return fallbackData;
    }
    
    const users = await response.json() as Array<{ accountId: string; displayName: string; avatarUrls: Record<string, string> }>;
    
    return users;
    
  } catch (error) {
    console.error('❌ BACKEND: Error fetching assignable users:', error);
    return fallbackData;
  }
});

// New resolver for fetching editable fields for an issue
resolver.define('fetchEditableFields', async (data: unknown): Promise<{ editableFields: string[] }> => {
  const { issueKey } = (data as { payload: { issueKey: string } }).payload;
  
  const fallbackData = { editableFields: ['summary'] }; // Always allow summary as fallback
  
  if (!issueKey) {
    return fallbackData;
  }
  
  try {
    // Get issue metadata to check which fields are editable
    const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/editmeta`);
    
    if (!response.ok) {
      console.error(`❌ BACKEND: Failed to fetch editable fields for ${issueKey}:`, response.status);
      return fallbackData;
    }
    
    const editMeta = await response.json() as {
      fields: Record<string, {
        required: boolean;
        schema: { type: string };
        name: string;
        hasDefaultValue: boolean;
        operations: string[];
      }>;
    };
    
    // Map JIRA field names back to our frontend field names
    const fieldMapping: Record<string, string> = {
      'customfield_10016': 'storyPoints',
      'summary': 'summary',
      'assignee': 'assignee',
      'priority': 'priority',
      'labels': 'labels'
    };
    
    const editableFields: string[] = [];
    
    // Check each field we care about
    Object.keys(fieldMapping).forEach(jiraFieldName => {
      if (editMeta.fields && editMeta.fields[jiraFieldName]) {
        const frontendFieldName = fieldMapping[jiraFieldName];
        editableFields.push(frontendFieldName);
      }
    });
    
    // Always include summary if not already included (most issues allow summary editing)
    if (!editableFields.includes('summary')) {
      editableFields.push('summary');
    }
    
    return { editableFields };
    
  } catch (error) {
    console.error(`❌ BACKEND: Error fetching editable fields for ${issueKey}:`, error);
    return fallbackData;
  }
});

// New resolver for updating issue fields
resolver.define('updateIssueField', async (data: unknown): Promise<{ success: boolean; error?: string }> => {
  const { issueKey, fieldName, fieldValue } = (data as { 
    payload: { 
      issueKey: string; 
      fieldName: string; 
      fieldValue: unknown; 
    } 
  }).payload;
  

  
  try {
    // Map frontend field names to Jira field names
    const fieldMapping: Record<string, string> = {
      'storyPoints': 'customfield_10016',
      'summary': 'summary',
      'assignee': 'assignee',
      'priority': 'priority',
      'labels': 'labels'
    };
    
    const jiraFieldName = fieldMapping[fieldName] || fieldName;
    
    // Prepare the update payload based on field type
    let updatePayload: Record<string, unknown> = {};
    
    switch (fieldName) {
      case 'storyPoints':
        updatePayload = {
          fields: {
            [jiraFieldName]: fieldValue
          }
        };
        break;
      case 'summary':
        updatePayload = {
          fields: {
            [jiraFieldName]: fieldValue
          }
        };
        break;
      case 'assignee':
        updatePayload = {
          fields: {
            [jiraFieldName]: fieldValue ? { accountId: fieldValue } : null
          }
        };
        break;
      case 'priority':
        updatePayload = {
          fields: {
            [jiraFieldName]: fieldValue ? { id: fieldValue } : null
          }
        };

        break;
      case 'labels':
        updatePayload = {
          fields: {
            [jiraFieldName]: Array.isArray(fieldValue) ? fieldValue : []
          }
        };
        break;
      default:
        updatePayload = {
          fields: {
            [jiraFieldName]: fieldValue
          }
        };
    }
    
    const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`❌ BACKEND: Failed to update ${fieldName} for ${issueKey}:`, response.status, errorText);
      
      // Parse JIRA error for better user messages
      let userFriendlyError = `Failed to update ${fieldName}: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors[fieldName]) {
          const jiraError = errorData.errors[fieldName];
          if (jiraError.includes('not on the appropriate screen')) {
            userFriendlyError = `Cannot update ${fieldName}: This field is not configured for this issue type. Please contact your JIRA administrator.`;
          } else if (jiraError.includes('unknown')) {
            userFriendlyError = `Cannot update ${fieldName}: Field not available for this issue type.`;
          } else {
            userFriendlyError = `Cannot update ${fieldName}: ${jiraError}`;
          }
        }
      } catch {
        // Keep the default error message if parsing fails
      }
      
      return { 
        success: false, 
        error: userFriendlyError
      };
    }
    

    
    return { success: true };
    
  } catch (error) {
    console.error(`❌ BACKEND: Error updating ${fieldName} for ${issueKey}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
});

resolver.define('getCurrentContext', async (req: unknown): Promise<{ issueKey: string }> => {
  const context = (req as { context: RequestContext }).context;
  const issueKey = context.extension.issue.key;
  
  return { issueKey };
});

// AI-Powered Smart Epic Breakdown
resolver.define('generateEpicBreakdown', async (data: unknown): Promise<EpicBreakdownResponse> => {
  const { epicSummary, epicDescription, existingIssues } = (data as { 
    payload: { 
      epicSummary: string; 
      epicDescription: string; 
      existingIssues?: JiraIssue[];
    } 
  }).payload;

  // Fallback response in case of AI failure
  const fallbackResponse: EpicBreakdownResponse = {
    suggestions: [],
    totalEstimatedPoints: 0,
    breakdown: { frontend: 0, backend: 0, testing: 0, design: 0 },
    risks: ['AI analysis unavailable - please review manually'],
    recommendations: ['Consider breaking down the epic manually based on functional requirements']
  };

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured');
      return fallbackResponse;
    }

    const existingIssuesContext = existingIssues && existingIssues.length > 0 
      ? `\n\nExisting issues in this epic:\n${existingIssues.map(issue => `- ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`).join('\n')}`
      : '';

    const prompt = `You are a senior product manager and technical lead analyzing a Jira Epic for optimal story breakdown. 

Epic Summary: ${epicSummary}
Epic Description: ${epicDescription}${existingIssuesContext}

Please analyze this epic and provide a comprehensive breakdown with the following JSON structure:

{
  "suggestions": [
    {
      "title": "Story title (actionable, user-focused)",
      "description": "Detailed description with technical considerations",
      "storyPoints": number (1, 2, 3, 5, 8, 13, 21),
      "priority": "High" | "Medium" | "Low",
      "acceptanceCriteria": ["criteria 1", "criteria 2", "criteria 3"],
      "labels": ["frontend", "backend", "api", "ui", "testing", etc.],
      "estimationReasoning": "Why this story point estimate"
    }
  ],
  "totalEstimatedPoints": number,
  "breakdown": {
    "frontend": number,
    "backend": number, 
    "testing": number,
    "design": number
  },
  "risks": ["potential risk 1", "potential risk 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Guidelines:
- Break down into 3-8 manageable stories
- Each story should be completable in 1-2 sprints
- Use Fibonacci sequence for story points (1,2,3,5,8,13,21)
- Consider technical dependencies and complexity
- Include both functional and non-functional requirements
- Identify potential risks and blockers
- Provide actionable recommendations

Respond with valid JSON only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert product manager and technical lead. Respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      console.warn('No response from OpenAI');
      return fallbackResponse;
    }

    try {
      const parsedResponse = JSON.parse(aiResponse) as EpicBreakdownResponse;
      
      // Validate the response structure
      if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
        console.warn('Invalid AI response structure');
        return fallbackResponse;
      }

      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return fallbackResponse;
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return fallbackResponse;
  }
});

export const handler = resolver.getDefinitions() as unknown; 