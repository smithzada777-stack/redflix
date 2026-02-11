import { NextResponse } from 'next/server';
import axios from 'axios';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendEmail } from '@/lib/email';

// Get environment variables and clean them (remove potential quotes/spaces)
const PUSHINPAY_TOKEN = (process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || '').replace(/['"]/g, '').trim();
const NEXT_PUBLIC_BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/['"]/g, '').trim();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, description, payerEmail, leadId } = body;

        console.log('--- [PIX API] INICIANDO GERAÇÃO ---');
        console.log('Valor:', amount);
        console.log('Token presente:', !!PUSHINPAY_TOKEN);

        if (!amount) {
            return NextResponse.json({ error: 'Valor é obrigatório' }, { status: 400 });
        }

        // Handle price formatting (replace comma with dot)
        const cleanAmount = amount.toString().replace(',', '.');
        const valueInCents = Math.round(parseFloat(cleanAmount) * 100);

        if (isNaN(valueInCents) || valueInCents <= 0) {
            return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
        }

        // PushinPay requires a public webhook URL. 
        if (!NEXT_PUBLIC_BASE_URL || NEXT_PUBLIC_BASE_URL.includes('localhost')) {
            console.warn('[PIX API] AVISO: NEXT_PUBLIC_BASE_URL não configurada ou em localhost. Webhooks reais não funcionarão.');
        }

        const webhookUrl = (!NEXT_PUBLIC_BASE_URL || NEXT_PUBLIC_BASE_URL.includes('localhost'))
            ? 'https://webhook.site/dummy-url-for-local-testing'
            : `${NEXT_PUBLIC_BASE_URL}/api/webhook/pushinpay`;

        const payload = {
            value: valueInCents,
            webhook_url: webhookUrl,
            description: description || 'Assinatura RedFlix',
            payer: {
                name: 'Consumidor RedFlix',
                email: payerEmail || 'cliente@email.com',
                document: '00000000000' // Generic doc if not provided
            }
        };

        const response = await axios.post('https://api.pushinpay.com.br/api/pix/cashIn', payload, {
            headers: {
                'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        console.log('--- [PIX API] RESPOSTA RECEBIDA ---');

        // PushinPay returns: id, qr_code, qr_code_base64
        const transactionId = data.id.toString().toLowerCase();

        // 1. Log payment in "payments" collection for real-time tracking via Admin SDK
        // MANUAL: SAVE AS 'pending' IMMEDIATELY
        try {
            await adminDb.collection('payments').doc(transactionId).set({
                id: transactionId,
                status: 'pending', // Correct status as per manual
                value: parseFloat(cleanAmount),
                created_at: new Date().toISOString(), // Use created_at as per manual hint (though createdAt is fine, I will use snake_case if manual used it, manual used created_at: new Date().toISOString())
                leadId: leadId || null
            });
            console.log(`[PIX API] Documento de pagamento criado: ${transactionId} (status: pending)`);
        } catch (dbError) {
            console.error('Erro ao salvar no Firestore (payments):', dbError);
        }

        // 2. Update lead if provided via Admin SDK
        if (leadId && leadId !== 'new') {
            try {
                await adminDb.collection('leads').doc(leadId).update({
                    transactionId: transactionId,
                    pixCode: data.qr_code,
                    status: 'pending_payment'
                });
                console.log(`[PIX API] Lead ${leadId} atualizado.`);
            } catch (dbError) {
                console.error('Erro ao atualizar lead:', dbError);
            }
        }

        // --- ENVIAR E-MAIL DE PAGAMENTO PENDENTE ---
        if (payerEmail) {
            console.log(`[PIX API] Enviando e-mail de pagamento pendente para: ${payerEmail}`);
            sendEmail({
                email: payerEmail,
                plan: description || 'Plano RedFlix',
                price: cleanAmount,
                status: 'pending'
            }).catch(err => console.error('[PIX API] Erro ao enviar e-mail pendente:', err));
        }

        return NextResponse.json({
            qrcode_content: data.qr_code,
            qrcode_image_url: data.qr_code_base64,
            transaction_id: transactionId
        }, { status: 200 });

    } catch (error: any) {
        const errorData = error.response?.data;
        console.error('--- [PIX API] ERRO ---');
        console.error('Status:', error.response?.status);
        console.error('Detalhes:', JSON.stringify(errorData, null, 2));
        console.error('Mensagem:', error.message);

        return NextResponse.json({
            error: 'Erro ao gerar Pix',
            details: errorData || error.message
        }, { status: 500 });
    }
}
