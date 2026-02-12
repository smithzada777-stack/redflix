import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all admin routes
    if (pathname.startsWith('/dashredflix/admin') || pathname.startsWith('/api/admin')) {
        // Skip auth check for the auth APIs themselves to avoid infinite loop
        if (pathname.includes('/auth/')) {
            return NextResponse.next();
        }

        const token = request.cookies.get('redflix_admin_token')?.value;

        if (!token) {
            // No token, redirect to login
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/dashredflix', request.url));
        }

        try {
            // Verify JWT
            const { payload } = await jwtVerify(token, JWT_SECRET);

            // Optional: Basic IP check on session token
            // const currentIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
            // if (payload.ip !== currentIp) throw new Error('IP Mismatch');

            return NextResponse.next();
        } catch (err) {
            // Invalid token
            const response = NextResponse.redirect(new URL('/dashredflix', request.url));
            response.cookies.delete('redflix_admin_token');
            return response;
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/dashredflix/admin/:path*',
        '/api/admin/:path*',
    ],
};
