import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication server-side
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("stack_ai_token");

  // If no session token, redirect to home page
  if (!sessionToken?.value) {
    redirect("/");
  }

  // TODO: Validate the session token with Supabase to ensure it's still valid
  // For now, we just check if the cookie exists
  // In a real implementation, you would:
  // - Decode the JWT token
  // - Verify signature with Supabase
  // - Check expiration
  // - Optionally fetch user data

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}