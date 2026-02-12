
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

async function runTest() {
    console.log('--- INICIANDO TESTE DE FLUXO PIX ---');

    // 1. Inicializar Firebase Admin
    let rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if ((rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")) ||
        (rawServiceAccount.startsWith('"') && rawServiceAccount.endsWith('"'))) {
        rawServiceAccount = rawServiceAccount.slice(1, -1);
    }
    const serviceAccount = JSON.parse(rawServiceAccount);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    const db = admin.firestore();
    console.log('✅ Firebase Admin Inicializado.');

    // 2. Gerar um Pix (Simulando o Checkout)
    const PUSHINPAY_TOKEN = (process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || '').replace(/['"]/g, '').trim();
    const API_URL = 'http://localhost:3000/api/pix'; // Assumindo porta 3000

    console.log('Gerando Pix na API local...');
    try {
        const pixRes = await axios.post(API_URL, {
            amount: 5.00,
            description: 'Teste de Fluxo Antigravity',
            payerEmail: 'teste_antigravity@email.com',
            leadId: 'test_lead_id'
        });

        const { transaction_id } = pixRes.data;
        console.log(`✅ Pix Gerado! ID: ${transaction_id}`);

        // 3. Verificar status inicial no DB
        const payDoc = await db.collection('payments').doc(transaction_id).get();
        console.log(`Status inicial no Firestore: ${payDoc.data()?.status}`);

        // 4. SIMULAR PAGAMENTO (O que o webhook faria)
        console.log('Simulando recebimento de pagamento...');
        await db.collection('payments').doc(transaction_id).set({
            status: 'paid',
            updated_at: new Date().toISOString()
        }, { merge: true });

        // O webhook também atualizaria o lead. Vamos simular isso também (como no route.ts do webhook)
        const leadsRef = db.collection('leads');
        const snapshot = await leadsRef.where('email', '==', 'teste_antigravity@email.com').get();
        if (!snapshot.empty) {
            const leadDoc = snapshot.docs[0];
            await leadDoc.ref.update({
                status: 'approved',
                paidAt: new Date().toISOString()
            });
            console.log(`✅ Lead ${leadDoc.id} atualizado para 'approved'.`);
        }

        // 5. Verificar via API de Check-Status (O que o frontend faz no polling)
        console.log('Verificando status via API check-status...');
        const checkRes = await axios.get(`http://localhost:3000/api/check-status?id=${transaction_id}`);
        console.log('Resposta da API:', JSON.stringify(checkRes.data, null, 2));

        if (checkRes.data.paid === true) {
            console.log('🚀 SUCESSO! O sistema detectou o pagamento e liberaria a tela de aprovação.');
        } else {
            console.log('❌ FALHA! O status não foi detectado como pago.');
        }

    } catch (error) {
        console.error('Erro no teste:', error.response?.data || error.message);
    }
}

runTest();
