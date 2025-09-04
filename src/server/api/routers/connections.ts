import z from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Zod schemas for resource data structure
const InodePathSchema = z.object({
  path: z.string(),
});

const DataloaderMetadataSchema = z.object({
  last_modified_at: z.string().optional(),
  last_modified_by: z.string().optional(),
  created_at: z.string().optional(),
  created_by: z.string().optional(),
  web_url: z.string().optional(),
  path: z.string().optional(),
});

const ResourceSchema = z.object({
  knowledge_base_id: z.string().uuid(),
  created_at: z.string(),
  modified_at: z.string(),
  indexed_at: z.string().nullable(),
  inode_type: z.enum(["file", "directory"]),
  resource_id: z.string(),
  inode_path: InodePathSchema,
  dataloader_metadata: DataloaderMetadataSchema,
  user_metadata: z.record(z.unknown()),
  inode_id: z.string().nullable(),
  // File-specific fields (only present when inode_type is "file")
  content_hash: z.string().optional(),
  content_mime: z.string().optional(),
  size: z.number().optional(),
  status: z.string().optional(),
});

const ResourcesResponseSchema = z.array(ResourceSchema);

// TypeScript types derived from Zod schemas
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourcesResponse = z.infer<typeof ResourcesResponseSchema>;

export const connectionsRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["gdrive"]).default("gdrive"),
        limit: z.number().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, provider } = input;
      const response = await fetch(
        `${env.BACKEND_URL}/connections?connection_provider=${provider}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${ctx.sessionToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.text}`);
      }

      const data = await response.json();
      return data;
    }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        cursor: z.string().optional(),
        resourceId: z.string().optional(),
      }),
    )
    .output(
      z.object({
        next_cursor: z.string().nullable(),
        current_cursor: z.string().nullable(),
        data: ResourcesResponseSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build URL with optional cursor parameter
      const params = new URLSearchParams();
      if (input.cursor) {
        params.set("cursor", input.cursor);
      }

      let url = `${env.BACKEND_URL}/connections/${input.id}/resources/children`;
      if (input.resourceId) {
        url += `?resource_id=${input.resourceId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ctx.sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connection: ${await response.text()}`);
      }

      const data = await response.json();

      // Validate the response data matches our schema
      return {
        ...data,
        data: ResourcesResponseSchema.parse(data.data),
      };
    }),
});
