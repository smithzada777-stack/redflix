import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_test_key');

export async function POST(req: Request) {
    try {
        // Validation with Security Token (as per manual)
        const pushinpayToken = req.headers.get('x-pushinpay-token');
        const expectedToken = process.env.PUSHINPAY_WEBHOOK_TOKEN;

        if (expectedToken && pushinpayToken !== expectedToken) {
            console.warn('⚠️ Webhook Token Inválido');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // PushinPay sends as x-www-form-urlencoded (as per manual)
        const formData = await req.formData();
        const data: any = {};
        formData.forEach((value, key) => { data[key] = value; });

        // Normalize ID to lowercase (Rule of Gold #1 in manual)
        const id = String(data.id || '').toLowerCase();
        const status = data.status;

        console.log('Webhook PushinPay:', { id, status });

        if (!id) return NextResponse.json({ error: 'No ID' }, { status: 400 });

        if (status === 'paid' || status === 'approved' || status === 'completed') {
            // Collection 'payments' as per Firestore Rules in manual
            const paymentRef = db.collection('payments').doc(id);
            const paymentSnap = await paymentRef.get();

            if (paymentSnap.exists) {
                const paymentData = paymentSnap.data();

                if (paymentData && paymentData.status !== 'approved') {
                    await paymentRef.update({
                        status: 'approved',
                        paidAt: new Date()
                    });

                    // Update 'sales' too just in case it was created there
                    await db.collection('sales').doc(id).update({
                        status: 'approved',
                        paidAt: new Date()
                    }).catch(() => { });

                    // Send access email
                    await sendAccessEmail(paymentData.email || paymentData.metadata?.email, paymentData.whatsapp || paymentData.metadata?.whatsapp).catch(console.error);

                    console.log('✅ Pagamento Aprovado Automático:', id);
                }
            } else {
                console.warn('⚠️ Pagamento não encontrado no DB:', id);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Webhook Error:', error.message);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

const emailStyle = `
    <style>
        .container { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .header { background: linear-gradient(180deg, #E50914 0%, #000000 100%); padding: 60px 40px; text-align: center; }
        .logo { width: 220px; height: auto; }
        .content { padding: 45px 35px; text-align: center; color: #1a1a1a; }
        .status-badge { display: inline-block; padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
        .status-approved { background-color: #ebfbee; color: #2f9e44; }
        .title { font-size: 32px; font-weight: 900; margin-bottom: 20px; color: #000; letter-spacing: -1px; }
        .text { font-size: 17px; color: #555; line-height: 1.7; margin-bottom: 30px; }
        .info-card { background-color: #fcfcfc; padding: 30px; border-radius: 20px; margin-bottom: 35px; text-align: center; border: 1px solid #f0f0f0; }
        .btn { display: inline-block; padding: 20px 40px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 17px; transition: transform 0.2s; }
        .btn-red { background-color: #E50914; color: white; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3); }
        .footer { background-color: #000; padding: 40px; text-align: center; color: #555; font-size: 13px; }
    </style>
`;

async function sendAccessEmail(email: string, whatsapp: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set. Email not sent.');
        return;
    }

    await resend.emails.send({
        from: 'RedFlix <onboarding@resend.dev>',
        to: [email],
        subject: '🚀 PAGAMENTO APROVADO - ACESSO LIBERADO',
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
                        <div class="status-badge status-approved">✅ PAGAMENTO CONFIRMADO</div>
                        <h1 class="title">PAGAMENTO APROVADO!</h1>
                        <p class="text">Seu acesso RedFlix está sendo gerado e será enviado agora mesmo.</p>
                        
                        <div class="info-card">
                            <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.8;">
                                📥 <strong>Como vou receber meu acesso?</strong><br>
                                Fique de olho no seu <strong>WhatsApp</strong>. Em instantes, nossa equipe entrará em contato enviando seu login, senha e o app oficial.
                            </p>
                        </div>

                        <a href="https://wa.me/5571991644164?text=Oi%2C%20j%C3%A1%20realizei%20o%20pagamento%20para%20assinar%20o%20RedFlix%20e%20aguardo%20meu%20acesso%21" class="btn btn-red">
                             🚀 CHAMAR NO WHATSAPP AGORA
                        </a>
                    </div>
                    <div class="footer">
                        <p>RedFlix Ultra Pro © 2026<br>Obrigado pela sua assinatura!</p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
}
