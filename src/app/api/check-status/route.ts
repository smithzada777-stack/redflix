import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/firebase-admin';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_test_key');

const PUSHINPAY_API_STATUS = 'https://api.pushinpay.com.br/api/transaction';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const txIdRaw = searchParams.get('id');

        if (!txIdRaw) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
        }

        // Normalize ID (Rule of Gold #1)
        const txId = txIdRaw.toLowerCase();

        // CHECK FIRESTORE ONLY (To avoid the 404 errors mentioned in manual)
        // Automatic flow: Webhook updates DB -> Client notices via this poll
        const paymentRef = db.collection('payments').doc(txId);
        const paymentSnap = await paymentRef.get();

        if (paymentSnap.exists) {
            const data = paymentSnap.data();
            console.log(`Checking DB for ${txId}:`, data?.status);

            if (data?.status === 'approved' || data?.status === 'paid' || data?.status === 'completed') {
                return NextResponse.json({ paid: true, status: data.status });
            }
            return NextResponse.json({ paid: false, status: data?.status || 'pending' });
        }

        // Fallback to 'sales' collection
        const saleRef = db.collection('sales').doc(txId);
        const saleSnap = await saleRef.get();
        if (saleSnap.exists) {
            const data = saleSnap.data();
            if (data?.status === 'approved' || data?.status === 'paid' || data?.status === 'completed') {
                return NextResponse.json({ paid: true, status: data.status });
            }
        }

        return NextResponse.json({ paid: false, status: 'pending' });

    } catch (error: any) {
        console.error('Check status error:', error.message);
        return NextResponse.json({ paid: false, error: error.message });
    }
}

async function sendAccessEmail(email: string, whatsapp: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set. Email not sent.');
        return;
    }

    await resend.emails.send({
        from: 'RedFlix <onboarding@resend.dev>', // Update with verified domain later
        to: [email],
        subject: '🚀 ACESSO LIBERADO - RedFlix VIP',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #050505; color: #fff; padding: 20px; text-align: center;">
                <h1 style="color: #E50914;">Seu Acesso RedFlix VIP Chegou!</h1>
                <p>Obrigado por assinar. Aqui estão suas credenciais:</p>
                <div style="background: #222; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block; text-align: left;">
                    <p><strong>Login:</strong> ${formatUsername(email)}</p>
                    <p><strong>Senha:</strong> redflix2026</p>
                </div>
                <p>Baixe nosso aplicativo agora:</p>
                <a href="https://redflixoficial.site/download" style="background-color: #E50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">BAIXAR APP</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">Dúvidas? <a href="https://wa.me/5571991644164" style="color: #E50914;">Fale com o Suporte</a></p>
            </div>
        `
    });
}

function formatUsername(email: string) {
    return email.split('@')[0] + Math.floor(Math.random() * 100);
}
