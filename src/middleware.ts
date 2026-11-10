import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = process.env.NODE_ENV === "production" ? "__Host-findit_session" : "findit_session";

// Lapisan awal: arahkan pengunjung tanpa token valid ke login.
// Otorisasi sebenarnya (role, session_version, kepemilikan) tetap dicek di server component dan API.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  let ok = false;
  let role = "";
  if (token && process.env.JWT_SECRET) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { algorithms: ["HS256"] });
      ok = true;
      role = String(payload.role ?? "");
    } catch {
      ok = false;
    }
  }
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.rewrite(new URL("/forbidden", req.url), { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-reports/:path*", "/reports/new", "/admin/:path*"],
};
