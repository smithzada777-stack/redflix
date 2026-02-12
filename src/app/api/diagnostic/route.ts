import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const firebase_status = !db.isMock ? 'CONNECTED ✅' : 'MOCK MODE ⚠️ (Credentials invalid)';

        const pushinpayToken = process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || '';
        const maskedToken = pushinpayToken
            ? `${pushinpayToken.substring(0, 4)}...${pushinpayToken.substring(pushinpayToken.length - 4)}`
            : 'NOT SET';

        return NextResponse.json({
            status: 'online',
            firebase: firebase_status,
            config: {
                has_resend: !!process.env.RESEND_API_KEY,
                has_pushinpay: !!pushinpayToken,
                has_webhook_token: !!process.env.PUSHINPAY_WEBHOOK_TOKEN,
                pushinpay_token_preview: maskedToken,
                has_service_account: !!process.env.FIREBASE_SERVICE_ACCOUNT,
                base_url: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET ❌'
            }
        });
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            error: e.message,
            firebase: 'DISCONNECTED ❌'
        });
    }
}
