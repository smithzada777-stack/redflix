import { NextResponse } from 'next/server';
import axios from 'axios';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendEmail } from '@/lib/email';

const PUSHINPAY_TOKEN = (process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || '').replace(/['"]/g, '').trim();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get('id');

        if (!transactionId) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const tid = transactionId.toLowerCase();

        // 1. CONSULTA DIRETA NA API DA PUSHINPAY
        try {
            const response = await axios.get(`https://api.pushinpay.com.br/api/transactions/${tid}`, {
                headers: {
                    'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            const data = response.data;
            const remoteStatus = (data.status || data.transaction_status || '').toString().toLowerCase();
            const positiveStatuses = ['paid', 'approved', 'confirmed', 'concluido', 'sucesso'];
            const isPaid = positiveStatuses.includes(remoteStatus);

            // 2. LÓGICA AUTO-PROCESSÁVEL (SE NÃO TEM WEBHOOK, O CHECK-STATUS FAZ O TRABALHO)
            if (isPaid && adminDb) {
                const leadsRef = adminDb.collection('leads');
                const snapshot = await leadsRef.where('transactionId', '==', tid).get();

                if (!snapshot.empty) {
                    for (const doc of snapshot.docs) {
                        const leadData = doc.data();

                        // Processa apenas se ainda não estiver aprovado
                        if (leadData.status !== 'approved') {
                            console.log(`[CHECK-STATUS] Detectado pagamento para Lead ${doc.id}. Aprovando e enviando e-mail...`);

                            // Atualiza no banco (Dashboard)
                            await doc.ref.update({
                                status: 'approved',
                                paidAt: new Date().toISOString()
                            });

                            // Dispara o E-mail de Aprovação
                            if (leadData.email) {
                                try {
                                    await sendEmail({
                                        email: leadData.email,
                                        plan: leadData.plan || 'Plano RedFlix',
                                        price: leadData.price || '0,00',
                                        status: 'approved'
                                    });
                                    console.log(`[CHECK-STATUS] E-mail de aprovação enviado.`);
                                } catch (emailErr) {
                                    console.error("[CHECK-STATUS] Falha ao enviar e-mail:", emailErr);
                                }
                            }
                        }
                    }
                }
            }

            return NextResponse.json({
                status: remoteStatus,
                paid: isPaid
            });

        } catch (apiError: any) {
            console.warn(`[CHECK STATUS] API instável para ID ${tid}: ${apiError.message}`);
            return NextResponse.json({
                status: 'pending',
                paid: false
            });
        }

    } catch (error: any) {
        console.error('[CHECK STATUS] Erro Interno:', error.message);
        return NextResponse.json({ status: 'pending', paid: false }, { status: 200 });
    }
}
