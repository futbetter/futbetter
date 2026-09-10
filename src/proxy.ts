import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADMIN_ROLE_LIST as ADMIN_ROLES } from "@/lib/roles";

// Next.js 16 renamed `middleware` to `proxy`. This runs on the Node.js
// runtime and protects every /admin route from non-staff visitors.
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const role = req.auth?.user?.role;
    const isStaff = !!role && (ADMIN_ROLES as readonly string[]).includes(role);

    if (!isStaff) {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
