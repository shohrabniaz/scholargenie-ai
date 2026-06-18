import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/scholarships/:path*",
    "/universities/:path*",
    "/professors/:path*",
    "/advisor/:path*",
    "/deadlines/:path*",
    "/applications/:path*",
    "/tools/:path*",
    "/login",
    "/signup",
  ],
};
