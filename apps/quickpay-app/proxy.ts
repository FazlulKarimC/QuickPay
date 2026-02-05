import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request as any });
    const path = request.nextUrl.pathname;

    // Protect /user/* routes - requires user role
    if (path.startsWith("/user")) {
        if (!token || token.role !== "user") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Protect /merchant/* routes - requires merchant role
    // Exclude /merchant/login from protection
    if (path.startsWith("/merchant") && !path.startsWith("/merchant/login")) {
        if (!token || token.role !== "merchant") {
            return NextResponse.redirect(new URL("/merchant/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/user/:path*",
        "/merchant/:path*",
    ]
};
