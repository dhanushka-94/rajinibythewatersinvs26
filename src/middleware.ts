import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login"];

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  "/settings/users": ["admin"],
  "/settings/activity-logs": ["admin"],
  "/settings/email-logs": ["admin"],
  "/settings": ["admin"],
  "/reports": ["admin", "manager", "viewer"],
  "/payments": ["admin", "manager", "viewer"],
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

  // Check role-based access
  try {
    const session = JSON.parse(sessionCookie.value);
    const userRole = session.role;

    // Check if route requires specific role
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect to unauthorized page or home
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }
  } catch (error) {
    // Invalid session, redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
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
