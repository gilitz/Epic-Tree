import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

interface RequestContext {
  extension: {
    issue: {
      key: string;
    };
  };
}

interface FetchLabelsRequest {
  context: RequestContext;
}

interface FetchIssueRequest {
  payload: {
    issueId: string;
  };
}

interface FetchIssuesByEpicRequest {
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

const resolver = new Resolver();

// Helper function to detect network/proxy errors
const isNetworkError = (error: any): boolean => {
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
const safeApiRequest = async (requestFn: () => Promise<any>, fallbackData: any, context: string) => {
  try {
    const response = await requestFn();
    
    if (!response.ok) {
      console.error(`API request failed for ${context}: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error('Error response:', errorText);
      return fallbackData;
    }
    
    const data = await response.json();
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

resolver.define('fetchLabels', async (req: any): Promise<Label[]> => {
  const key = req.context.extension.issue.key;

  const fallbackData: Label[] = [];
  
  const requestFn = () => api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=labels`);
  
  const data: IssueResponse = await safeApiRequest(requestFn, { fields: { labels: [] } }, `labels for ${key}`);
  
  const labels = data.fields?.labels || [];
  
  if (labels.length === 0) {
    console.warn(`${key}: No labels found`);
  }
  
  return labels;
});

resolver.define('fetchIssueById', async (data: any): Promise<any> => {
  const issueId = data.payload.issueId;
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016' // Story Points
  ].join(',');
  
  const fallbackData = {
    key: issueId,
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

resolver.define('fetchIssuesByEpicId', async (data: any): Promise<any> => {
  const epicId = data.payload.epicId;
  (`Fetching issues for epic: ${epicId}`);
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016', 'subtasks' // Story Points and subtasks
  ].join(',');
  
  const fallbackData = {
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

resolver.define('fetchSubtasksByParentKeys', async (data: any): Promise<any> => {
  const parentKeys = data.payload.parentKeys;
  console.log(`🔍 BACKEND: Fetching subtasks for parent keys: ${parentKeys.join(', ')}`);
  
  if (!parentKeys || parentKeys.length === 0) {
    console.log('🔍 BACKEND: No parent keys provided, returning empty result');
    return { issues: [] };
  }
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016', 'parent' // Story Points and parent
  ].join(',');
  
  const fallbackData = {
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
    console.log('🔍 BACKEND: Found subtasks:', result.issues.map((issue: any) => ({
      key: issue.key,
      summary: issue.fields?.summary,
      parent: issue.fields?.parent?.key,
      issueType: issue.fields?.issuetype?.name
    })));
  }
  
  return result;
});

resolver.define('fetchSubtasksByKeys', async (data: any): Promise<any> => {
  const subtaskKeys = data.payload.subtaskKeys;
  
  if (!subtaskKeys || subtaskKeys.length === 0) {
    return { issues: [] };
  }
  
  // Request all fields that might be needed for the tooltip
  const fields = [
    'summary', 'status', 'priority', 'assignee', 'reporter', 'labels',
    'issuelinks', 'issuetype', 'created', 'updated', 'duedate', 'resolution',
    'components', 'fixVersions', 'customfield_10016', 'parent' // Story Points and parent
  ].join(',');
  
  const fallbackData = {
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

export const handler = resolver.getDefinitions() as any; 