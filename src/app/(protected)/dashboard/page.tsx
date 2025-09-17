"use client";

import { Loader2, PlusSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileTreeDialog } from "~/components/file-tree";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";

export default function DashboardPage() {
  const utils = api.useUtils();
  const [provider] = useState<"gdrive">("gdrive");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: connections, isLoading } = api.connections.all.useQuery({
    provider,
  });

  const { data: adminList, isLoading: isLoadingKB } =
    api.knowledgeBases.all.useQuery();

  useEffect(() => {
    if (connections?.[0]?.connection_id) {
      void utils.connections.get.prefetch({ id: connections[0].connection_id });
    }
  }, [connections, utils]);

  const handleOpenDialog = () => {
    if (connections?.[0]?.connection_id) {
      setIsDialogOpen(true);
    }
  };

  const knowledgeBases = adminList?.admin ?? [];

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Knowledge Bases
            </h1>
          </div>
          <Button
            disabled={isLoading || !connections?.[0]?.connection_id}
            onClick={handleOpenDialog}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <PlusSquare className="mr-2 h-4 w-4" />}
            New knowledge base
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingKB ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : knowledgeBases?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No knowledge bases found.
                  </TableCell>
                </TableRow>
              ) : (
                (knowledgeBases ?? []).map((kb: any) => (
                  <TableRow key={kb.knowledge_base_id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/${kb.knowledge_base_id}`}>
                        {kb.name || `KB-${kb.knowledge_base_id?.slice(0, 8)}`}
                      </Link>
                    </TableCell>

                    <TableCell>
                      {kb.created_at
                        ? new Date(kb.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {connections?.[0]?.connection_id && (
        <FileTreeDialog
          orgId={connections[0].org_id}
          connectionId={connections[0].connection_id}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}
