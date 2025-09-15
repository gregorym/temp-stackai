"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Resource } from "~/server/api/routers/connections";
import { api } from "~/trpc/react";

interface UseAllResourcesOptions {
  connectionId: string;
  resourceId?: string;
  enabled?: boolean;
  filter?: string;
}

interface UseAllResourcesResult {
  data: Resource[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
}

export function useAllResources({
  connectionId,
  resourceId,
  enabled = true,
  filter,
}: UseAllResourcesOptions): UseAllResourcesResult {
  const [data, setData] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const utils = api.useUtils();

  const filteredData = useMemo(() => {
    if (!filter) return data;

    return data.filter((resource) => {
      if (resource.inode_type === "directory") {
        return true;
      } else {
        return resource.inode_path.path
          .toLowerCase()
          .includes(filter.toLowerCase());
      }
    });
  }, [data, filter]);

  // Function to fetch a single page and update state incrementally
  const fetchNextPage = useCallback(
    async (cursor?: string, isFirstPage = false) => {
      try {
        if (isFirstPage) {
          setIsLoading(true);
          setData([]); // Reset data for first page
        } else {
          setIsLoadingMore(true);
        }

        setError(null);

        const response = await utils.connections.get.fetch({
          id: connectionId,
          resourceId,
          cursor,
        });

        // Update data incrementally
        setData((prevData) => {
          if (isFirstPage) {
            return response.data;
          }
          return [...prevData, ...response.data];
        });

        // Update pagination state
        setNextCursor(response.next_cursor ?? undefined);
        setHasMore(!!response.next_cursor);

        // If there's more data, automatically fetch the next page
        if (response.next_cursor) {
          // Small delay to show incremental loading
          await new Promise((resolve) => setTimeout(resolve, 100));
          await fetchNextPage(response.next_cursor, false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load resources";
        setError(errorMessage);
        setHasMore(false);
        console.error("Failed to load resources:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [connectionId, resourceId, utils.connections.get],
  );

  // Main fetch function
  const fetchAllData = useCallback(async () => {
    if (!enabled) return;
    await fetchNextPage(undefined, true);
  }, [enabled, fetchNextPage]);

  // Effect for initial load and when dependencies change
  useEffect(() => {
    if (!enabled) {
      setData([]);
      setError(null);
      return;
    }

    fetchAllData();
  }, [enabled, fetchAllData]);

  // Refetch function for manual triggers
  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  return {
    data: filteredData,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refetch,
  };
}
