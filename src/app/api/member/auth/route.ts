import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const userData = {
      id: `google_${Math.random().toString(36).substr(2, 9)}`,
      email: "member@kthaisociety.se",
      name: "KTH Member",
      firstName: "KTH",
      lastName: "Member",
      picture: "https://i.pravatar.cc/150?img=5",
      provider: "google",
      role: "member",
      // role: "admin",
    };

    const sessionToken = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json(
      {
        user: {
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          role: userData.role,
        },
      },
      { status: 200 }
    );

    // Set JWT session token in httpOnly cookie
    response.cookies.set({
      name: "auth_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
