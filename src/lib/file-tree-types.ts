import type { ReactNode } from "react";

// Generic file tree node interface
export interface FileTreeNode {
  id: string;
  name: string;
  type: "file" | "directory";
  size?: number;
  mimeType?: string;
  status?: "processed" | "processing" | "error" | "pending";
  metadata?: Record<string, unknown>;
  children?: FileTreeNode[];
}

// Hook result interface for data fetching
export interface FileTreeDataResult<T = unknown> {
  data?: T[];
  isLoading: boolean;
  error?: string | Error;
}

// Data adapter interface - converts source data to FileTreeNode
export interface FileTreeAdapter<T> {
  toNode: (item: T) => FileTreeNode;
  getChildren?: (item: T, parentId?: string) => FileTreeNode[] | undefined;
}

// Action handlers interface
export interface FileTreeActions {
  onDelete?: (node: FileTreeNode) => void;
  onDownload?: (node: FileTreeNode) => void;
  onRetry?: (node: FileTreeNode) => void;
}

// Hook factory type - creates hooks for fetching data
export type FileTreeHookFactory<T> = (params: {
  parentId?: string;
  enabled?: boolean;
  [key: string]: unknown;
}) => FileTreeDataResult<T>;