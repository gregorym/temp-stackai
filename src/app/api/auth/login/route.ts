import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "~/env";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Make request to Supabase auth
    const requestUrl = `${env.SUPABASE_AUTH_URL}/auth/v1/token?grant_type=password`;
    
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Apikey": env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        gotrue_meta_security: {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as {
        error_description?: string;
        msg?: string;
      };
      return NextResponse.json(
        {
          success: false,
          error: errorData.error_description ?? errorData.msg ?? "Login failed",
        },
        { status: 401 }
      );
    }

    const data = await response.json() as { access_token?: string };
    const accessToken = data.access_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No access token received",
        },
        { status: 401 }
      );
    }

    // Create response with success data
    const responseData = {
      success: true,
      token: accessToken,
      error: null,
    };

    const nextResponse = NextResponse.json(responseData);

    // Set the cookie using NextResponse
    nextResponse.cookies.set("stack_ai_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Cookie set via NextResponse:", accessToken.substring(0, 20) + "...");

    return nextResponse;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}