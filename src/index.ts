import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

interface RequestContext {
  extension: {
    issue: {
      key: string;
    };
  };
}

interface _FetchLabelsRequest {
  context: RequestContext;
}

interface _FetchIssueRequest {
  payload: {
    issueId: string;
  };
}

interface _FetchIssuesByEpicRequest {
  payload: {
    epicId: string;
  };
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
      name: string;
      iconUrl: string;
    };
    assignee: {
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
    console.log(`API request successful for: ${context}`);
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

  const _fallbackData: Label[] = [];
  
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
  console.log(`Fetching issues for epic: ${epicId}`);
  
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
  
  const issueCount = result.issues?.length || 0;
  console.log(`Fetched ${issueCount} issues for epic: ${epicId}`);
  
  return result;
});

resolver.define('fetchSubtasksByParentKeys', async (data: unknown): Promise<JiraSearchResponse> => {
  const parentKeys: string[] = (data as { payload: { parentKeys: string[] } }).payload.parentKeys;
  console.log(`🔍 BACKEND: Fetching subtasks for parent keys: ${parentKeys.join(', ')}`);
  
  if (!parentKeys || parentKeys.length === 0) {
    console.log('🔍 BACKEND: No parent keys provided, returning empty result');
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
  
  const subtaskCount = result.issues?.length || 0;
  
  if (subtaskCount > 0) {
    console.log('🔍 BACKEND: Found subtasks:', result.issues.map((issue: JiraIssue) => ({
      key: issue.key,
      summary: issue.fields?.summary,
      parent: issue.fields?.parent?.key,
      issueType: issue.fields?.issuetype?.name
    })));
  }
  
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
  
  console.log(`🔍 BACKEND: Direct keys JQL Query: ${jql}`);
  
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}&fields=${fields}&maxResults=200`);
  
  const result = await safeApiRequest(requestFn, fallbackData, `subtasks by keys ${subtaskKeys.join(', ')}`);
  
  return result;
});

export const handler = resolver.getDefinitions() as unknown; 