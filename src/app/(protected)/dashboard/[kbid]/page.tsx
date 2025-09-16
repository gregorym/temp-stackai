"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import type { Resource } from "~/components/file-tree";
import { FileTreeSkeleton } from "~/components/file-tree/file-tree-skeleton";
import { KBFileTreeNode } from "~/components/kb/kb-file-tree";
import { api } from "~/trpc/react";

export default function KnowledgeBasePage() {
  const { kbid } = useParams<{ kbid: string }>();
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(
    new Set(),
  );

  const {
    data: kb,
    refetch,
    isLoading,
  } = api.knowledgeBases.get.useQuery({
    id: kbid,
  });

  const handleToggleExpand = (resourceId: string) => {
    const newExpanded = new Set(expandedDirectories);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedDirectories(newExpanded);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge base</h1>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-semibold">Name</span>
          <span className="mr-16 text-sm font-semibold">Status</span>
        </div>
        <div className="space-y-1 rounded-md border">
          {isLoading && <FileTreeSkeleton level={0} />}
          {((kb?.data as Resource[]) ?? []).map((resource: Resource) => (
            <KBFileTreeNode
              key={resource.resource_id}
              kbId={kbid}
              resource={resource}
              level={0}
              onToggleExpand={handleToggleExpand}
              expandedDirectories={expandedDirectories}
              refetchParent={refetch}
            />
          ))}
        </div>
      </div>
    </>
  );
}
