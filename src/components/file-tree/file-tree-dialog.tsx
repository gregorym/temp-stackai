"use client";

import { useRouter } from "next/navigation";
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
import { api } from "~/trpc/react";
import Dropbox from "../icons/providers/dropbox";
import GoogleDrive from "../icons/providers/google-drive";
import Slack from "../icons/providers/slack";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { FileTreeNode } from "./file-tree-node";

interface FileTreeDialogProps {
  orgId: string;
  connectionId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Provider {
  id: string;
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

const providers: Provider[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: <GoogleDrive />,
    isConnected: true,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: <Dropbox />,
    isConnected: false,
  },
  {
    id: "slack",
    name: "Slack",
    icon: <Slack />,
    isConnected: false,
  },
];

export function FileTreeDialog({
  orgId,
  connectionId,
  isOpen,
  onClose,
}: FileTreeDialogProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<Provider>(
    providers[0]!,
  );
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set(),
  );
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(
    new Set(),
  );

  const createKnowledgeBase = api.knowledgeBases.create.useMutation();
  const { data: allResources, isLoading } = useAllResources({
    connectionId,
    enabled: isOpen,
  });

  const handleClose = () => {
    setExpandedDirectories(new Set());
    setSelectedResources(new Set());
    onClose();
  };

  const handleToggleSelect = (resourceId: string) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId);
    } else {
      newSelected.add(resourceId);
    }
    setSelectedResources(newSelected);
  };

  const handleToggleExpand = (resourceId: string) => {
    console.log(resourceId);
    const newExpanded = new Set(expandedDirectories);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedDirectories(newExpanded);
  };

  const handleCreateKB = async () => {
    if (!selectedResources.size) return;

    const kb = await createKnowledgeBase.mutateAsync({
      org_id: orgId,
      connection_id: connectionId,
      connection_source_ids: Array.from(selectedResources),
    });

    setSelectedResources(new Set());
    handleClose();

    if (kb?.id) {
      router.push(`/dashboard/${kb.id}`);
    }
  };

  const selectedCount = selectedResources.size;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-5xl sm:max-w-7xl">
        <DialogHeader className="mb-0">
          <DialogTitle>Integrations</DialogTitle>
        </DialogHeader>

        <div className="flex h-full gap-4 py-4">
          {/* Providers list */}
          <div className="w-64 shrink-0">
            <div className="space-y-1">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  disabled={!provider.isConnected}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedProvider?.id === provider.id
                      ? "bg-blue-50 text-blue-900"
                      : provider.isConnected
                        ? "text-gray-700 hover:bg-gray-50"
                        : "cursor-not-allowed text-gray-400"
                  }`}
                >
                  {provider.icon}
                  <span className="flex-1">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File tree content */}
          <div className="flex-1">
            <div className="mb-2 flex items-center">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                {selectedProvider?.icon}
                {selectedProvider?.name}
              </h3>
              <Input
                placeholder="Filter files..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="ml-auto max-w-xs"
              />
            </div>

            <ScrollArea className="h-96 w-full border-t p-4">
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

              {!isLoading && allResources.length === 0 && (
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
                      filter={filter}
                      key={resource.resource_id}
                      resource={resource}
                      level={0}
                      connectionId={connectionId}
                      onToggleSelect={handleToggleSelect}
                      onToggleExpand={handleToggleExpand}
                      selectedResources={selectedResources}
                      expandedDirectories={expandedDirectories}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Action buttons */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                {selectedCount > 0
                  ? `${selectedCount} item${selectedCount === 1 ? "" : "s"} selected`
                  : "Select files to import"}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKB}
                  disabled={
                    selectedCount === 0 || createKnowledgeBase.isPending
                  }
                >
                  {createKnowledgeBase.isPending
                    ? "Creating..."
                    : `Import ${selectedCount > 0 ? `(${selectedCount})` : ""}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
