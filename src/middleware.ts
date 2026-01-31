import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/forgot-password"];

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  "/settings/users": ["admin", "super_admin"],
  "/settings/secure-edit-pins": ["admin", "super_admin"],
  "/settings/activity-logs": ["admin", "super_admin"],
  "/settings/email-logs": ["admin", "super_admin"],
  "/settings": ["admin", "super_admin"],
  "/reports": ["admin", "manager", "viewer"],
  "/payments": ["admin", "manager", "viewer"],
  "/promotions": ["admin", "super_admin", "manager"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("invoice-session");
  
  if (!sessionCookie) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.set("invoice-session", "", { maxAge: 0, path: "/" });
      return res;
    }
    const userRole = session.role;
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "1");
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("invoice-session", "", { maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (image files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
