import { z } from "zod";
import { cookies } from "next/headers";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .output(z.object({ 
      success: z.boolean(),
      token: z.string().nullable(),
      error: z.string().nullable(),
    }))
    .mutation(async ({ input }) => {
      try {
        const requestUrl = `${env.SUPABASE_AUTH_URL}/auth/v1/token?grant_type=password`;
        
        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Apikey": env.SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            gotrue_meta_security: {},
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as {
            error_description?: string;
            msg?: string;
          };
          return {
            success: false,
            token: null,
            error: errorData.error_description ?? errorData.msg ?? "Login failed",
          };
        }

        const data = await response.json() as { access_token?: string };
        const accessToken = data.access_token;

        if (!accessToken) {
          return {
            success: false,
            token: null,
            error: "No access token received",
          };
        }

        // Set the session token cookie
        const cookieStore = await cookies();
        cookieStore.set("stack_ai_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });

        return {
          success: true,
          token: accessToken,
          error: null,
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          token: null,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
      }
    }),
});
