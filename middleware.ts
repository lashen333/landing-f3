// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (!req.cookies.get("sid")) {
    const sid =
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    res.cookies.set("sid", sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return res;
}

export const config = { matcher: ["/:path*"] };
