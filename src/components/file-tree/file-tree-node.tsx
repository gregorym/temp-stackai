"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { useAllResources } from "~/hooks";
import {
  formatFileSize,
  getExpandIcon,
  getFileIcon,
  getStatusIcon,
} from "~/lib/file-tree-utils";
import { cn } from "~/lib/utils";
import type { Resource } from "~/server/api/routers/connections";
import { FileTreeSkeleton } from "./file-tree-skeleton";

export interface FileTreeNodeProps {
  resource: Resource;
  level: number;
  connectionId: string;
  onToggleSelect: (resourceId: string) => void;
  onToggleExpand: (resourceId: string) => void;
  selectedResources: Set<string>;
  expandedDirectories: Set<string>;
  filter?: string;
}

export function FileTreeNode({
  resource,
  level,
  connectionId,
  onToggleSelect,
  onToggleExpand,
  selectedResources,
  expandedDirectories,
  filter,
}: FileTreeNodeProps) {
  const isExpanded = useMemo(() => {
    return (
      resource.inode_type === "directory" &&
      expandedDirectories.has(resource.resource_id)
    );
  }, [expandedDirectories, resource]);

  const isSelected = useMemo(() => {
    return selectedResources.has(resource.resource_id);
  }, [selectedResources, resource]);

  const { data: children, isLoading: isLoadingChildren } = useAllResources({
    connectionId,
    resourceId: resource.resource_id,
    enabled: resource.inode_type === "directory" && isExpanded,
  });

  const getResourceExpandIcon = () => {
    if (resource.inode_type !== "directory") return null;

    if (isLoadingChildren) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }

    return getExpandIcon(isExpanded);
  };

  if (
    filter &&
    resource.inode_type !== "directory" &&
    !resource.inode_path.path.toLowerCase().includes(filter)
  ) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-gray-50",
          isSelected && "bg-blue-50",
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={() => onToggleExpand(resource.resource_id)}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 disabled:hover:bg-transparent"
          disabled={resource.inode_type !== "directory"}
        >
          {getResourceExpandIcon()}
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(resource.resource_id)}
          className="shrink-0"
        />

        {/* @ts-ignore */}
        <div className="shrink-0">{getFileIcon(resource, isExpanded)}</div>

        {/* Name and details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-medium text-gray-900">
              {resource.inode_path.path}
            </span>
            {resource.inode_type === "file" && resource.size && (
              <span className="ml-2 text-xs text-gray-500">
                {formatFileSize(resource.size)}
              </span>
            )}
            {resource.inode_type === "file" &&
              resource.status &&
              resource.status !== "resource" && (
                <span
                  title={resource.status}
                  className="ml-2 text-xs text-gray-500"
                >
                  {getStatusIcon(resource.status)}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Children (for expanded directories) */}
      {resource.inode_type === "directory" && isExpanded && (
        <div className="ml-4">
          {isLoadingChildren && <FileTreeSkeleton level={level} />}

          {children && children.length === 0 && !isLoadingChildren && (
            <div className="px-4 py-2 text-sm text-gray-500">Empty folder</div>
          )}

          {children && children.length > 0 && (
            <div className="space-y-1">
              {children.map((child) => (
                <FileTreeNode
                  key={child.resource_id}
                  filter={filter}
                  resource={child}
                  level={level + 1}
                  connectionId={connectionId}
                  onToggleSelect={onToggleSelect}
                  onToggleExpand={onToggleExpand}
                  selectedResources={selectedResources}
                  expandedDirectories={expandedDirectories}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
