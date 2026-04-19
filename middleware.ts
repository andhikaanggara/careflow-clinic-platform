import { type NextRequest } from "next/server";
import { updateSesion } from "@/utils/supabase/middlewate";

export async function middleware(request: NextRequest) {
  return await updateSesion(request);
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
