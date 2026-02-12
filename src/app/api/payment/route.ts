import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/firebase-admin';

const PUSHINPAY_API = 'https://api.pushinpay.com.br/api/pix/cashIn';
const PUSHINPAY_TOKEN = process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || 'test-token';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, whatsapp, amount, description } = body;

        // Simulate creation if no token provided (for dev/demo)
        if (!process.env.PUSHINPAY_TOKEN) {
            console.warn('PUSHINPAY_TOKEN not set, simulating response');
            return NextResponse.json({
                qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // Blank placeholder
                copyPaste: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654041.005802BR5913Test Merchant6008Brasilia62070503***63041D3D',
                txId: 'simulated_' + Date.now()
            });
        }

        let pixData;
        try {
            // Call PushinPay API (Now with webhook_url for automatic approval)
            const response = await axios.post(PUSHINPAY_API, {
                value: Math.round(amount * 100),
                webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/pix`,
                metadata: { email, whatsapp }
            }, {
                headers: {
                    'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            pixData = response.data;
        } catch (apiError: any) {
            console.error('PushinPay API Error:', apiError.response?.data || apiError.message);
            // Fallback for when API fails
            pixData = {
                id: 'error_' + Date.now(),
                qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                qr_code: 'PAYMENT_LINK_FAILED'
            };
        }

        // Normalize ID (Rule of Gold #1)
        const normalizedId = String(pixData.id).toLowerCase();

        // Save to Firestore 'payments' (as per manual Firestore Rules)
        await db.collection('payments').doc(normalizedId).set({
            amount,
            email,
            whatsapp,
            planName: description,
            status: 'pending',
            createdAt: new Date(),
            pixId: pixData.id,
            qrCode: pixData.qr_code_base64 || '',
            copyPaste: pixData.qr_code || ''
        });

        // Also save to 'sales' for the admin dashboard compatibility
        await db.collection('sales').doc(normalizedId).set({
            amount,
            email,
            whatsapp,
            planName: description,
            status: 'pending',
            createdAt: new Date(),
            pixId: pixData.id,
            qrCode: pixData.qr_code_base64 || '',
            copyPaste: pixData.qr_code || ''
        }).catch((err: any) => console.error('Error saving to sales:', err));

        // Send "Pending Payment" email if possible
        if (pixData.qr_code_base64 && pixData.qr_code_base64.length > 100) {
            await sendPendingPaymentEmail(email, description, pixData.qr_code_base64).catch(console.error);
        }

        return NextResponse.json({
            qrCode: pixData.qr_code_base64,
            copyPaste: pixData.qr_code,
            txId: normalizedId // Return the normalized ID
        });

    } catch (error: any) {
        console.error('Fatal error in payment route:', error.message);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// Send pending payment email
const emailStyle = `
    <style>
        .container { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .header { background: linear-gradient(180deg, #E50914 0%, #000000 100%); padding: 60px 40px; text-align: center; }
        .logo { width: 220px; height: auto; }
        .content { padding: 45px 35px; text-align: center; color: #1a1a1a; }
        .status-badge { display: inline-block; padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
        .status-pending { background-color: #fff9db; color: #f08c00; }
        .title { font-size: 32px; font-weight: 900; margin-bottom: 20px; color: #000; letter-spacing: -1px; }
        .text { font-size: 17px; color: #555; line-height: 1.7; margin-bottom: 30px; }
        .info-card { background-color: #fcfcfc; padding: 30px; border-radius: 20px; margin-bottom: 35px; text-align: center; border: 1px solid #f0f0f0; }
        .btn { display: inline-block; padding: 20px 40px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 17px; transition: transform 0.2s; }
        .btn-wa { background-color: #25D366; color: white; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); }
        .footer { background-color: #000; padding: 40px; text-align: center; color: #555; font-size: 13px; }
    </style>
`;

async function sendPendingPaymentEmail(email: string, planName: string, qrCode: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set. Pending email not sent.');
        return;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: 'RedFlix <onboarding@resend.dev>',
        to: [email],
        subject: '⏳ PAGAMENTO PENDENTE - FINALIZAR AGORA',
        html: `
            <!DOCTYPE html>
            <html>
            <head>${emailStyle}</head>
            <body style="background-color: #f1f1f1; padding: 40px 10px;">
                <div class="container">
                    <div class="header">
                        <img src="https://imgur.com/6H5gxcw.png" alt="RedFlix" class="logo">
                    </div>
                    <div class="content">
                        <div class="status-badge status-pending">⏳ AGUARDANDO PAGAMENTO</div>
                        <h1 class="title">Seu Pix foi gerado!</h1>
                        <p class="text">Olá! Quase tudo pronto para sua maratona começar. Só falta confirmarmos o seu pagamento do <strong>${planName}</strong>.</p>
                        
                        <div class="info-card">
                            <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.8;">
                                <strong>Como pagar?</strong><br>
                                1. Use o código Pix que você copiou no site.<br>
                                2. Abra o app do seu banco e escolha "Pix Copia e Cola".<br>
                                3. Finalize o pagamento e pronto!
                            </p>
                        </div>

                        <a href="https://wa.me/5571991644164?text=Oi%2C%20acabei%20de%20gerar%20um%20Pix%20para%20assinar%20o%20RedFlix%2C%20mas%20estou%20com%20uma%20d%C3%BAvida.%20Pode%20me%20ajudar%3F" class="btn btn-wa">
                            💬 NÃO CONSEGUI PAGAR? ME AJUDE
                        </a>
                    </div>
                    <div class="footer">
                        <p>RedFlix Ultra Pro © 2026<br>A melhor experiência cinematográfica da internet.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
}
