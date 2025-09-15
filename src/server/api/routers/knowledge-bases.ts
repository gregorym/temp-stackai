import z from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const knowledgeBasesRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx, input }) => {
    const response = await fetch(`${env.BACKEND_URL}/knowledge_bases`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ctx.sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch knowledge bases: ${response.text}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string(), cursor: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${env.BACKEND_URL}/knowledge_bases/${input.id}/resources/children?next_cursor=${input.cursor}`,
        {
          headers: {
            Authorization: `Bearer ${ctx.sessionToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create knowledge base: ${response.statusText}`,
        );
      }

      const data = await response.json();

      return data;
    }),
  create: protectedProcedure
    .input(
      z.object({
        connection_id: z.string(),
        connection_source_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(`${env.BACKEND_URL}/knowledge_bases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connection_id: input.connection_id,
          connection_source_ids: input.connection_source_ids,
          indexing_params: {
            ocr: false,
            unstructured: true,
            embedding_params: {
              embedding_model: "text-embedding-ada-002",
              api_key: null,
            },
            chunker_params: {
              chunk_size: 1500,
              chunk_overlap: 500,
              chunker: "sentence",
            },
          },
          org_level_role: null,
          cron_job_id: null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create knowledge base: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return { ...data, id: data.knowledge_base_id };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        knowledge_base_id: z.string(),
        resource_path: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const queryParams = new URLSearchParams({
        resource_path: input.resource_path,
      });

      const response = await fetch(
        `${env.BACKEND_URL}/knowledge_bases/${input.knowledge_base_id}/resources?${queryParams}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${ctx.sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resource_path: input.resource_path,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete knowledge base resource: ${response.statusText}`,
        );
      }

      return { success: true, status: response.status };
    }),
});
