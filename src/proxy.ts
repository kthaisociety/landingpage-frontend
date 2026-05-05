import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importSPKI } from "jose";

const getJwtPublicKey = (): string => {
  const publicKey = process.env.JWTValidatingKey;

  if (!publicKey) {
    throw new Error("Missing JWTValidatingKey environment variable");
  }

  return publicKey.replace(/\\n/g, "\n");
};


export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const token = req.cookies.get("jwt")?.value;

  if (pathname.startsWith("/member/login")) {
    const res = NextResponse.next();
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
    return res;
  }

  const isDashboard = pathname.startsWith("/member/dashboard");
  const isAdmin = pathname.startsWith("/member/admin");

  if (!isDashboard && !isAdmin) {
    return NextResponse.next();
  }

  if (!token) {
    url.pathname = "/member/login";
    return NextResponse.redirect(url);
  }

  try {
    const publicKeyString = getJwtPublicKey();

    const publicKey = await importSPKI(publicKeyString, "RS256");

    const { payload } = await jwtVerify(token, publicKey);

    const rolesRaw = payload.roles as string | string[] | undefined;
    const roles: string[] = Array.isArray(rolesRaw)
      ? rolesRaw
      : typeof rolesRaw === "string" && rolesRaw.length > 0
      ? rolesRaw.split(",")
      : [];

    if (isAdmin && !roles.includes("admin")) {
      url.pathname = "/"; // Send non-admins away
      return NextResponse.redirect(url);
    }


    if (isDashboard && !roles.includes("user") && !roles.includes("admin")) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Error:", error);

    url.pathname = "/member/login";
    const response = NextResponse.redirect(url);

    response.cookies.delete("jwt");
    response.cookies.delete("roles");

    return response;
  }
}

export const config = {
  matcher: [
    "/member/login/:path*",
    "/member/dashboard/:path*",
    "/member/admin/:path*",
  ],
};