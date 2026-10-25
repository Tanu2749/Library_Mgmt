import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAccountRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret:
      process.env.NEXTAUTH_SECRET ||
      "athenaeum-fallback-jwt-secret-do-not-use-in-strict-prod-32c",
  });

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    const role = token.role as string | undefined;
    if (role !== "ADMIN" && role !== "LIBRARIAN") {
      // Forbidden: redirect to home or account with warning
      return NextResponse.redirect(new URL("/?forbidden=admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
