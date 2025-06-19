/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BlockingIssue {
  key: string;
  summary: string;
  status?: {
    name: string;
  };
}

export interface BlockedIssue {
  key: string;
  summary: string;
  status?: {
    name: string;
  };
}

export interface TreeData {
  name: string;
  key?: string;
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
  issuelinks?: any[];
  blockingIssues?: BlockingIssue[];
  blockedIssues?: BlockedIssue[];
  children?: TreeData[];
  isEpic?: boolean;
}

export interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuelinks: unknown[];
    subtasks: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Epic {
  fields: {
    summary: string;
    issuelinks: unknown[];
    [key: string]: unknown;
  };
  errorMessages?: string[];
  [key: string]: unknown;
}

export interface VerticalTreeChartProps {
  width: number;
  height: number;
  margin?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
} 