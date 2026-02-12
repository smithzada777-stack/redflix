const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testPix() {
    const token = process.env.PUSHINPAY_TOKEN;
    console.log('--- TESTE DE CONEXÃO PUSHINPAY ---');
    console.log('Token encontrado:', token ? 'SIM' : 'NÃO');

    if (!token) return;

    try {
        const response = await axios.post('https://api.pushinpay.com.br/api/pix/cashIn', {
            value: 500, // R$ 5,00
            webhook_url: 'https://webhook.site/test',
            description: 'Teste de Conexão Antigravity',
            payer: {
                name: 'Teste AI',
                email: 'teste@email.com',
                document: '00000000000'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token.replace(/['"]/g, '').trim()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('✅ SUCESSO! A API respondeu corretamente.');
        console.log('ID Gerado:', response.data.id);
    } catch (error) {
        console.log('❌ ERRO NA API:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Dados:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Mensagem:', error.message);
        }
    }
}

testPix();
