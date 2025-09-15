"use client";

import { Loader2, PlusSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { FileTreeDialog } from "~/components/file-tree";
import { Button } from "~/components/ui/button";
import type { Resource } from "~/server/api/routers/connections";
import { api } from "~/trpc/react";

export default function DashboardPage() {
  const [provider] = useState<"gdrive">("gdrive");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const utils = api.useUtils();

  const {
    data: connections,
    isLoading,
    error,
  } = api.connections.all.useQuery({ provider });

  const { data: knowledgeBases } = api.knowledgeBases.all.useQuery();

  useEffect(() => {
    if (connections?.[0]?.connection_id) {
      void utils.connections.get.prefetch({ id: connections[0].connection_id });
    }
  }, [connections, utils]);

  const handleImport = (selectedResources: Resource[]) => {
    console.log("Importing resources:", selectedResources);
    // TODO: Implement actual import logic
  };

  const handleOpenDialog = () => {
    if (connections?.[0]?.connection_id) {
      setIsDialogOpen(true);
    }
  };

  console.log(knowledgeBases);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <Button
              disabled={isLoading || !connections?.[0]?.connection_id}
              onClick={handleOpenDialog}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <PlusSquare className="mr-2 h-4 w-4" />}
              Import files
            </Button>
          </div>
        </div>
      </div>

      {connections?.[0]?.connection_id && (
        <FileTreeDialog
          connectionId={connections[0].connection_id}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}
