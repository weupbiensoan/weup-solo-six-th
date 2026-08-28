import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const isAdmin = isAdminRequest(request);
  return Response.json({
    isAdmin,
    signedIn: isAdmin,
    signInUrl: "/admin",
  });
}

