import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the cookie
    response.cookies.delete('redflix_admin_token');

    return response;
}
