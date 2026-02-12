import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long');

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

        // 1. Password Check
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
        }

        // 2. IP Lockdown Logic (Optional)
        const configRef = db.collection('admin_config').doc('security');
        const configSnap = await configRef.get();
        const config = configSnap.data();

        if (config?.allowed_ip && config.allowed_ip !== ip && process.env.MAX_IP_LOCK === 'true') {
            console.warn(`Blocked attempt from unauthorized IP: ${ip}`);
            return NextResponse.json({ error: 'Acesso bloqueado: IP não autorizado' }, { status: 403 });
        }

        // 3. Generate JWT Immediately (No more 2FA)
        const token = await new SignJWT({ role: 'admin', ip })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // 4. Set HttpOnly Cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login realizado com sucesso!',
            redirect: '/dashredflix/admin'
        });

        response.cookies.set('redflix_admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Login error:', error.message);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
