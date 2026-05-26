import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/dashboard(.*)",
  "/signoff/admin(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/success(.*)",
  "/signoff/(.*)",
  "/api/signoff(.*)",
  "/api/stripe(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (isProtectedRoute(req) && !userId) {
    // For API routes return 401 instead of redirecting
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
