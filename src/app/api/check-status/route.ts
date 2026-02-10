import { NextResponse } from 'next/server';
import axios from 'axios';
import { adminDb } from '@/lib/firebaseAdmin';

// Remove quotes and whitespace from tokens if any
const PUSHINPAY_TOKEN = (process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || '').replace(/['"]/g, '').trim();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get('id');
        const debugMode = searchParams.get('debug');

        if (!transactionId) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const tid = transactionId.toLowerCase();
        console.log(`[CHECK STATUS] Verificando ID: ${tid}`);

        // 0. DEBUG MODE REMOVIDO PARA TESTE REAL

        // 1. PRIMEIRO: Verificar no nosso próprio banco de dados
        // Se já estiver pago no DB (via webhook ou polling anterior), retornamos sucesso direto
        const paymentDoc = await adminDb.collection('payments').doc(tid).get();
        if (paymentDoc.exists) {
            const currentStatus = (paymentDoc.data()?.status || '').toLowerCase();
            const positiveStatuses = ['paid', 'approved', 'confirmed', 'concluido', 'sucesso'];

            if (positiveStatuses.includes(currentStatus)) {
                console.log(`[CHECK STATUS] Transação ${tid} já está aprovada no banco de dados.`);
                return NextResponse.json({ status: currentStatus, paid: true });
            }
        }

        // 2. SEGUNDO: Consultar a API da PushinPay (Fallback)
        try {
            const response = await axios.get(`https://api.pushinpay.com.br/api/pix/cashIn/${tid}`, {
                headers: {
                    'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                    'Accept': 'application/json'
                },
                timeout: 5000
            });

            const data = response.data;
            const remoteStatus = (data.status || data.transaction_status || '').toString().toLowerCase();
            const positiveStatuses = ['paid', 'approved', 'confirmed', 'concluido', 'sucesso'];

            console.log(`[CHECK STATUS] Resposta da API PushinPay: ${remoteStatus}`);

            if (positiveStatuses.includes(remoteStatus)) {
                // Sincronizar banco de dados
                await adminDb.collection('payments').doc(tid).set({
                    status: 'paid',
                    updated_at: new Date().toISOString(),
                    check_method: 'manual_api_poll'
                }, { merge: true });

                return NextResponse.json({ status: 'paid', paid: true });
            }

            return NextResponse.json({ status: remoteStatus, paid: false });

        } catch (apiError: any) {
            // Em vez de dar erro 502 (que assusta o usuário no console), retornamos o status atual do DB
            console.warn(`[CHECK STATUS] PushinPay API instável para ID ${tid}: ${apiError.message}`);
            const currentStatus = paymentDoc.exists ? (paymentDoc.data()?.status || 'pending') : 'pending';
            return NextResponse.json({
                status: currentStatus,
                paid: false,
                message: 'API externa indisponível momentaneamente, usando cache local.'
            });
        }

    } catch (error: any) {
        console.error('[CHECK STATUS] Erro Interno:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
