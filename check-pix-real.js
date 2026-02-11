require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const transactionId = 'a10e3480-4bc6-442e-9c44-0833956cc1f0';
const PUSHINPAY_TOKEN = process.env.PUSHINPAY_TOKEN;

async function checkStatus() {
    console.log(`--- CONSULTANDO STATUS DO PIX: ${transactionId} ---`);
    try {
        const response = await axios.get(`https://api.pushinpay.com.br/api/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        console.log('Status Atual:', response.data.status || response.data.transaction_status);
        console.log('Dados Completos:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Erro na consulta:', error.response ? error.response.data : error.message);
    }
}

checkStatus();
