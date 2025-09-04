"use client";

import { Loader2, PlusSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function DashboardPage() {
  const [provider] = useState<"gdrive">("gdrive");
  const utils = api.useUtils();

  const {
    data: connections,
    isLoading,
    error,
  } = api.connections.all.useQuery({ provider });

  useEffect(() => {
    if (connections?.[0]?.connection_id) {
      void utils.connections.get.prefetch({ id: connections[0].connection_id });
    }
  }, [connections, utils]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <PlusSquare className="mr-2 h-4 w-4" />}
            Import files
          </Button>
        </div>
      </div>
    </div>
  );
}
