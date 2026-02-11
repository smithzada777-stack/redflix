import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import querystring from 'querystring';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        const bodyText = await req.text();

        let data: any;

        // Parse body based on content type (JSON or Form UrlEncoded)
        if (contentType.includes('application/json')) {
            try {
                data = JSON.parse(bodyText);
            } catch (e) {
                data = querystring.parse(bodyText);
            }
        } else {
            data = querystring.parse(bodyText);
        }

        console.log('--- [WEBHOOK PUSHINPAY] RECEBIDO ---');
        // console.log('Payload:', JSON.stringify(data, null, 2)); // Optional: log full payload for debug

        // MANUAL PASSO 3: O ID e Status devem ser tratados com rigor
        const transactionId = (data.id || data.transaction_id || data.reference || data.external_id || data.reference_id)?.toString().toLowerCase();
        const status = (data.status || data.transaction_status || '').toString().toLowerCase();
        const payerEmail = data.payer_email || data.email || data.payer?.email;

        if (!transactionId) {
            console.error('[WEBHOOK] Sem ID de transação no payload.');
            return NextResponse.json({ error: 'ID not found' }, { status: 400 });
        }

        console.log(`[WEBHOOK] ID: ${transactionId} | Status: ${status} `);

        // MANUAL PASSO 3: GRAVA NO DISCO (FIREBASE) USANDO O ADMIN SDK
        // 1. Update "payments" collection (The "Blindado" Webhook)
        try {
            await adminDb.collection('payments').doc(transactionId).set({
                status: status,
                updated_at: new Date().toISOString(),
                webhook_payload: data
            }, { merge: true });
            console.log(`[WEBHOOK] Pagamento ${transactionId} atualizado para status: ${status} `);
        } catch (dbError) {
            console.error('[WEBHOOK] Erro ao atualizar payments:', dbError);
            throw dbError; // Critical error
        }

        // 2. If positive status, update "leads" collection
        const positiveStatuses = ['paid', 'approved', 'confirmed', 'concluido', 'sucesso'];
        if (positiveStatuses.includes(status)) {
            console.log(`[WEBHOOK] Pagamento confirmado.Atualizando leads...`);

            let leadUpdated = false;

            // Search manually since Admin SDK query syntax is slightly different but logic is same
            // Strategy 1: Find by transactionId
            const leadsRef = adminDb.collection('leads');
            const snapshotById = await leadsRef
                .where('transactionId', '==', transactionId)
                .limit(5)
                .get();

            if (!snapshotById.empty) {
                const batch = adminDb.batch();
                for (const doc of snapshotById.docs) {
                    const leadData = doc.data();
                    batch.update(doc.ref, {
                        status: 'approved',
                        paidAt: new Date().toISOString()
                    });
                    console.log(`[WEBHOOK] Lead ${doc.id} encontrado por ID.`);

                    // ENVIAR E-MAIL DE PAGAMENTO APROVADO
                    if (leadData.email) {
                        try {
                            await sendEmail({
                                email: leadData.email,
                                plan: leadData.plan || 'Plano RedFlix',
                                price: leadData.price || '0,00',
                                status: 'approved'
                            });
                            console.log(`[WEBHOOK] E - mail de aprovação enviado para: ${leadData.email} `);
                        } catch (emailErr: any) {
                            console.error(`[WEBHOOK] Erro ao enviar e - mail: ${emailErr.message} `);
                        }
                    }
                }
                await batch.commit();
                leadUpdated = true;
            }

            // Strategy 2: Find by Email (Fallback)
            if (!leadUpdated && payerEmail) {
                console.log(`[WEBHOOK] Buscando lead por email: ${payerEmail} `);
                const snapshotByEmail = await leadsRef
                    .where('email', '==', payerEmail)
                    .limit(5)
                    .get();

                if (!snapshotByEmail.empty) {
                    const batch = adminDb.batch();
                    for (const doc of snapshotByEmail.docs) {
                        const leadData = doc.data();
                        batch.update(doc.ref, {
                            status: 'approved',
                            paidAt: new Date().toISOString()
                        });
                        console.log(`[WEBHOOK] Lead ${doc.id} encontrado por Email.`);

                        // ENVIAR E-MAIL DE PAGAMENTO APROVADO
                        if (leadData.email) {
                            try {
                                await sendEmail({
                                    email: leadData.email,
                                    plan: leadData.plan || 'Plano RedFlix',
                                    price: leadData.price || '0,00',
                                    status: 'approved'
                                });
                                console.log(`[WEBHOOK] E - mail de aprovação enviado para(fallback email): ${leadData.email} `);
                            } catch (emailErr: any) {
                                console.error(`[WEBHOOK] Erro ao enviar e - mail fallback: ${emailErr.message} `);
                            }
                        }
                    }
                    await batch.commit();
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });

    } catch (error: any) {
        console.error('--- [WEBHOOK] ERRO CRÍTICO ---');
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

