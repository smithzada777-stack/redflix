require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testResend() {
    console.log('--- TESTANDO RESEND ---');

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('❌ ERRO: RESEND_API_KEY não encontrada no .env.local');
        return;
    }

    console.log('API Key encontrada (início):', apiKey.substring(0, 7) + '...');

    const resend = new Resend(apiKey);

    try {
        console.log('Enviando e-mail de teste para o administrador...');
        // Usando o e-mail padrão do Resend para domínios não verificados (onboarding@resend.dev)
        // O destinatário 'delivered@resend.dev' é um endereço de teste especial que sempre funciona
        const data = await resend.emails.send({
            from: 'RedFlix Teste <onboarding@resend.dev>',
            to: ['delivered@resend.dev'],
            subject: 'Teste de Integração RedFlix',
            html: '<h1>Integração Funcional!</h1><p>Este é um e-mail de teste para verificar se o Resend está configurado corretamente.</p>'
        });

        if (data.error) {
            console.error('❌ ERRO NO RESEND:', data.error);
        } else {
            console.log('✅ SUCESSO! E-mail enviado.');
            console.log('ID do E-mail:', data.data.id);
        }
    } catch (error) {
        console.error('❌ FALHA CRÍTICA:', error.message);
    }
}

testResend();
