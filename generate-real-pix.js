
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function generateRealTestPix() {
    const PUSHINPAY_TOKEN = (process.env.PUSHINPAY_TOKEN || process.env.PUSHINPAY_API_KEY || '').replace(/['"]/g, '').trim();

    console.log('--- GERANDO PIX REAL PARA TESTE ---');

    const payload = {
        value: 100, // R$ 1,00
        webhook_url: 'https://webhook.site/dummy-check',
        description: 'Teste de Integração Antigravity',
        payer: {
            name: 'Teste Real Dashboard',
            email: 'paravoce@verificar.com',
            document: '00000000000'
        }
    };

    try {
        const response = await axios.post('https://api.pushinpay.com.br/api/pix/cashIn', payload, {
            headers: {
                'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('\n✅ SUCESSO! Pix Gerado.');
        console.log('ID do Pagamento:', response.data.id);
        console.log('Copia e Cola:', response.data.qr_code);
        console.log('\n👉 Verifique agora seu painel na PushinPay: https://pushinpay.com.br/dashboard');
    } catch (error) {
        console.error('❌ Erro na API:', error.response?.status, error.response?.data || error.message);
    }
}

generateRealTestPix();
