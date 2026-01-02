import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getUserFromToken(request);

  const isAuthPage =
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup");

  const isProtected = pathname.startsWith("/user") 
    || pathname.startsWith("/cart") 
    || pathname.startsWith("/wishlist")
    || pathname.startsWith("/checkout")
    || pathname.startsWith("/library")
    || pathname.startsWith("/reader");

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  if (!user && isProtected) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/user/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/library/:path*",
    "/checkout/:path*",
    "/reader/:path*",
  ],
};
