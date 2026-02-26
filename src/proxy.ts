import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET||"test-secret-key");

export async function proxy(req: NextRequest) {
  console.log("proxy is triggered")
  const url = req.nextUrl.clone();
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = url;

  // Handle COOP/COEP headers
  if (pathname.startsWith("/member/login")) {
    const res = NextResponse.next();
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
    return res;
  }

  const isDashboard = pathname.startsWith("/admin/dashboard");
  const isProfile = pathname.startsWith("/member/profile");

  if (!isDashboard && !isProfile) {
    return NextResponse.next();
  }

  if (!token) {
    url.pathname = "/member/login";
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string | undefined;

    if (isDashboard) {
      if (role !== "admin") {
        url.pathname = "/"; 
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (isProfile) {
      if (!["admin", "member"].includes(role ?? "")) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
    
    return NextResponse.next();

  } catch (error) {
    console.error("Proxy Auth Error:", error);
    url.pathname = "/member/login";
    const response = NextResponse.redirect(url);
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/member/login/:path*", "/admin/dashboard/:path*", "/member/profile/:path*"],
};