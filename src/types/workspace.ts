export interface WorkspaceRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface WorkspaceVariable {
  id: string;
  name: string;
  value: string;
  description?: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  requests: WorkspaceRequest[];
  variables: WorkspaceVariable[];
}

export interface RequestHistoryItem {
  id: string;
  method: string;
  url: string;
  timestamp: Date;
  status?: number;
}

export const WORKSPACE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
] as const;

export type WorkspaceColor = typeof WORKSPACE_COLORS[number];