interface IssueMock {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    [key: string]: any;
    summary: string;
    subtasks: any[];
    issuelinks: any[];
    parent?: {
      id: string;
      key: string;
      self: string;
      fields: {
        summary: string;
        status: any;
        priority: any;
        issuetype: any;
      };
    };
  };
}

export const issueMock: IssueMock = {
  'expand': 'operations,versionedRepresentations,editmeta,changelog,customfield_10010.requestTypePractice,renderedFields',
  'id': '10003',
  'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/issue/10003',
  'key': 'SCRUM-4',
  'fields': {
    'statuscategorychangedate': '2024-12-13T22:51:24.182+0200',
    'issuetype': {
      'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/issuetype/10001',
      'id': '10001',
      'description': 'Tasks track small, distinct pieces of work.',
      'iconUrl': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium',
      'name': 'Task',
      'subtask': false,
      'avatarId': 10318,
      'entityId': 'd2b161ed-546f-4262-82e8-4e2c5efa4311',
      'hierarchyLevel': 0
    },
    'parent': {
      'id': '10001',
      'key': 'ET-2',
      'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/issue/10001',
      'fields': {
        'summary': 'epic issue',
        'status': {
          'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/status/10000',
          'description': '',
          'iconUrl': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/',
          'name': 'To Do',
          'id': '10000',
          'statusCategory': {
            'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/statuscategory/2',
            'id': 2,
            'key': 'new',
            'colorName': 'blue-gray',
            'name': 'To Do'
          }
        },
        'priority': {
          'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/priority/3',
          'iconUrl': 'https://gilitzz.atlassian.net/images/icons/priorities/medium_new.svg',
          'name': 'Medium',
          'id': '3'
        },
        'issuetype': {
          'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/issuetype/10004',
          'id': '10004',
          'description': 'Epics track collections of related bugs, stories, and tasks.',
          'iconUrl': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium',
          'name': 'Epic',
          'subtask': false,
          'avatarId': 10307,
          'entityId': '3592ca04-4fdf-44dc-8edd-498e78a99d4c',
          'hierarchyLevel': 1
        }
      }
    },
    'summary': 'second issue',
    'subtasks': [],
    'issuelinks': [],
    'labels': [],
    'timespent': null,
    'customfield_10030': null,
    'customfield_10031': null,
    'project': {
      'self': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/project/10000',
      'id': '10000',
      'key': 'SCRUM',
      'name': 'Epic Tree',
      'projectTypeKey': 'software',
      'simplified': true,
      'avatarUrls': {
        '48x48': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/universal_avatar/view/type/project/avatar/10421',
        '24x24': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/universal_avatar/view/type/project/avatar/10421?size=small',
        '16x16': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/universal_avatar/view/type/project/avatar/10421?size=xsmall',
        '32x32': 'https://api.atlassian.com/ex/jira/6b2adff1-d28c-4594-92f5-876fd123a919/rest/api/3/universal_avatar/view/type/project/avatar/10421?size=medium'
      }
    }
  }
}; 