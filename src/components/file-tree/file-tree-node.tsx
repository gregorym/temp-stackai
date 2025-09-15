"use client";

import {
  ChevronDown,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { useAllResources } from "~/hooks";
import { cn } from "~/lib/utils";
import type { Resource } from "~/server/api/routers/connections";

interface FileTreeNodeProps {
  resource: Resource;
  level: number;
  connectionId: string;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (resource: Resource) => void;
  onToggleExpand: (resourceId: string) => void;
  selectedResources: Set<string>;
  filter?: string;
}

export function FileTreeNode({
  resource,
  level,
  connectionId,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  selectedResources,
  filter,
}: FileTreeNodeProps) {
  const [childrenExpanded, setChildrenExpanded] = useState<Set<string>>(
    new Set(),
  );

  // Fetch directory contents when expanded
  const {
    data: children,
    isLoading: isLoadingChildren,
    error: childrenError,
  } = useAllResources({
    connectionId,
    resourceId: resource.resource_id,
    enabled: resource.inode_type === "directory" && isExpanded,
  });

  const getFileIcon = (resource: Resource) => {
    if (resource.inode_type === "directory") {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 text-blue-600" />
      ) : (
        <Folder className="h-4 w-4 text-blue-600" />
      );
    }

    // File type icons based on MIME type
    const mimeType = resource.content_mime?.toLowerCase();
    if (mimeType?.includes("image/")) {
      return <Image className="h-4 w-4 text-gray-600" />;
    }
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("csv")) {
      return <FileSpreadsheet className="h-4 w-4 text-gray-600" />;
    }
    if (mimeType?.includes("text/") || mimeType?.includes("pdf")) {
      return <FileText className="h-4 w-4 text-gray-600" />;
    }

    return <File className="h-4 w-4 text-gray-600" />;
  };

  const getExpandIcon = () => {
    if (resource.inode_type !== "directory") return null;

    if (isLoadingChildren) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }

    return isExpanded ? (
      <ChevronDown className="h-4 w-4 text-gray-600" />
    ) : (
      <ChevronRight className="h-4 w-4 text-gray-600" />
    );
  };

  const handleExpand = () => {
    if (resource.inode_type === "directory") {
      onToggleExpand(resource.resource_id);
    }
  };


  const handleChildToggleExpand = (childResourceId: string) => {
    const newExpanded = new Set(childrenExpanded);
    if (newExpanded.has(childResourceId)) {
      newExpanded.delete(childResourceId);
    } else {
      newExpanded.add(childResourceId);
    }
    setChildrenExpanded(newExpanded);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div>
      {/* Current node */}
      <div
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 hover:bg-gray-50",
          isSelected && "bg-blue-50",
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={handleExpand}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
          disabled={resource.inode_type !== "directory"}
        >
          {getExpandIcon()}
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(resource)}
          className="shrink-0"
        />

        {/* File/folder icon */}
        <div className="shrink-0">{getFileIcon(resource)}</div>

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
          </div>
        </div>
      </div>

      {/* Children (for expanded directories) */}
      {resource.inode_type === "directory" && isExpanded && (
        <div className="ml-4">
          {isLoadingChildren && (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1"
                  style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          )}

          {childrenError && (
            <div className="px-4 py-2 text-sm text-red-600">
              {childrenError}
            </div>
          )}

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
                  isSelected={selectedResources.has(child.resource_id)}
                  isExpanded={childrenExpanded.has(child.resource_id)}
                  onToggleSelect={onToggleSelect}
                  selectedResources={selectedResources}
                  onToggleExpand={handleChildToggleExpand}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
