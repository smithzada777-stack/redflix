import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long');

export async function POST(req: Request) {
    try {
        const { otp } = await req.json();

        // 1. Verify OTP from Firebase
        const otpRef = db.collection('admin_auth').doc('otp_session');
        const otpSnap = await otpRef.get();
        const otpData = otpSnap.data();

        if (!otpData) {
            return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        }

        const now = new Date();
        if (otpData.otp !== otp || now > otpData.expiresAt.toDate()) {
            return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 401 });
        }

        // 2. Clear OTP session
        await otpRef.delete();

        // 3. Generate JWT
        // "Remember for 1 week" -> 7 days
        const token = await new SignJWT({ role: 'admin', ip: otpData.ip })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // 4. Set HttpOnly Cookie
        const response = NextResponse.json({ success: true, redirect: '/dashredflix/admin' });

        response.cookies.set('redflix_admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Verify error:', error.message);
        return NextResponse.json({ error: 'Erro de validação' }, { status: 500 });
    }
}
