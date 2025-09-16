"use client";

import { Checkbox } from "@radix-ui/react-checkbox";
import { Loader2, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import { useAllKBResources } from "~/hooks/use-all-kb-resources";
import {
  formatFileSize,
  getExpandIcon,
  getFileIcon,
  getStatusIcon,
} from "~/lib/file-tree-utils";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import type { Resource } from "../file-tree";
import { FileTreeSkeleton } from "../file-tree/file-tree-skeleton";

type KBFileTreeNodeProps = {
  resource: Resource;
  level: number;
  onToggleExpand: (resourceId: string) => void;
  expandedDirectories: Set<string>;
  kbId: string;
  refetchParent?: () => void;
};

export function KBFileTreeNode({
  kbId,
  resource,
  level,
  expandedDirectories,
  onToggleExpand,
  refetchParent,
}: KBFileTreeNodeProps) {
  const deleteMutation = api.knowledgeBases.delete.useMutation();

  const isExpanded = useMemo(() => {
    return (
      resource.inode_type === "directory" &&
      expandedDirectories.has(resource.inode_path.path)
    );
  }, [expandedDirectories]);

  const {
    data: children,
    isLoading: isLoadingChildren,
    refetch,
  } = useAllKBResources({
    kbId,
    path: resource.inode_path.path,
    enabled: resource.inode_type === "directory" && isExpanded,
  });

  const handleExpand = () => {
    if (resource.inode_type === "directory") {
      onToggleExpand(resource.inode_path.path);
    }
  };

  const getResourceExpandIcon = () => {
    if (resource.inode_type !== "directory") return null;

    if (isLoadingChildren) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }

    return getExpandIcon(isExpanded);
  };

  const handleDelete = async () => {
    if (!resource) return;
    if (!confirm("Are you sure?")) return;

    await deleteMutation.mutateAsync({
      knowledge_base_id: kbId,
      resource_path: resource.inode_path.path,
    });

    refetchParent?.();
  };

  return (
    <div>
      <div
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 hover:bg-gray-50",
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={handleExpand}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
          disabled={resource.inode_type !== "directory"}
        >
          {getResourceExpandIcon()}
        </button>

        {/* @ts-ignore */}
        <div className="shrink-0">{getFileIcon(resource, isExpanded)}</div>

        <Checkbox disabled={true} checked={false} className="shrink-0" />

        {/* Name and details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-medium text-gray-900">
              {resource.inode_path.path}
            </span>
            <div className="ml-auto flex gap-2">
              {resource.inode_type === "file" && resource.size && (
                <span className="ml-2 text-xs text-gray-500">
                  {formatFileSize(resource.size)}
                </span>
              )}
              {resource.inode_type === "file" &&
                resource.status &&
                resource.status !== "resource" && (
                  <span className="ml-2 text-xs text-gray-500">
                    {getStatusIcon(resource.status)}
                  </span>
                )}
              {resource.inode_type === "file" && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {!deleteMutation.isPending && (
                    <Trash2Icon className="h-4 w-4" />
                  )}
                  {deleteMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </button>
              )}
            </div>
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
                <KBFileTreeNode
                  kbId={kbId}
                  key={child.resource_id}
                  resource={child}
                  level={level + 1}
                  expandedDirectories={expandedDirectories}
                  onToggleExpand={onToggleExpand}
                  refetchParent={refetch}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
