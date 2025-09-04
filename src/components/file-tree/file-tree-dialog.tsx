"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useAllResources } from "~/hooks";
import type { Resource } from "~/server/api/routers/connections";
import { Skeleton } from "../ui/skeleton";
import { FileTreeNode } from "./file-tree-node";

interface FileTreeDialogProps {
  connectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onImport?: (selectedResources: Resource[]) => void;
}

export function FileTreeDialog({
  connectionId,
  isOpen,
  onClose,
  onImport,
}: FileTreeDialogProps) {
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set(),
  );
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(
    new Set(),
  );

  // Use the custom hook for incremental pagination
  const {
    data: allResources,
    isLoading,
    isLoadingMore,
    error: loadError,
    hasMore,
  } = useAllResources({
    connectionId,
    enabled: isOpen,
  });

  const handleToggleSelect = (resource: Resource) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resource.resource_id)) {
      newSelected.delete(resource.resource_id);
    } else {
      newSelected.add(resource.resource_id);
    }
    setSelectedResources(newSelected);
  };

  const handleToggleExpand = (resourceId: string) => {
    const newExpanded = new Set(expandedDirectories);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedDirectories(newExpanded);
  };

  const handleImport = () => {
    if (!allResources.length || !onImport) return;

    const selected = allResources.filter((resource) =>
      selectedResources.has(resource.resource_id),
    );
    onImport(selected);
    onClose();
  };

  const selectedCount = selectedResources.size;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] w-full max-w-5xl sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Import files</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* File tree content */}
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            {isLoading && allResources.length === 0 && (
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1"
                    style={{ paddingLeft: `${(0 + 1) * 20 + 8}px` }}
                  >
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            )}

            {loadError && (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-red-600">
                  Failed to load files: {loadError}
                </div>
              </div>
            )}

            {!isLoading && !loadError && allResources.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground text-sm">
                  No files found
                </div>
              </div>
            )}

            {allResources.length > 0 && (
              <div className="space-y-1">
                {allResources.map((resource) => (
                  <FileTreeNode
                    key={resource.resource_id}
                    resource={resource}
                    level={0}
                    connectionId={connectionId}
                    isSelected={selectedResources.has(resource.resource_id)}
                    isExpanded={expandedDirectories.has(resource.resource_id)}
                    onToggleSelect={handleToggleSelect}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      Loading more files...
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {selectedCount > 0
                ? `${selectedCount} item${selectedCount === 1 ? "" : "s"} selected`
                : "Select files to import"}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={selectedCount === 0}>
                Import {selectedCount > 0 && `(${selectedCount})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
