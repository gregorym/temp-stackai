import z from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
        `${env.BACKEND_URL}//connections?connection_provider=${provider}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${ctx.sessionToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.statusText}`);
      }

      return await response.json();
    }),
});
