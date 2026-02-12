const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testOfficialEmail() {
    console.log("--- TESTE DE ENVIO OFICIAL ---");

    // 1. Ler a chave
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("❌ ERRO: Chave RESEND_API_KEY não encontrada no .env.local");
        return;
    }
    console.log("Chave carregada:", apiKey.slice(0, 5) + "...");

    const resend = new Resend(apiKey);

    // 2. Tentar enviar com o domínio oficial
    try {
        console.log("Tentando enviar como: suporte@mail.redflixoficial.site");

        const data = await resend.emails.send({
            from: 'RedFlix <suporte@mail.redflixoficial.site>',
            to: ['delivered@resend.dev'], // Email de teste do Resend que sempre aceita
            subject: 'Teste Oficial RedFlix',
            html: '<h1>Funcionou!</h1><p>O domínio oficial está enviando e-mails corretamente.</p>'
        });

        if (data.error) {
            console.error("❌ FALHA NO ENVIO:");
            console.error(JSON.stringify(data.error, null, 2));
        } else {
            console.log("✅ SUCESSO! Email enviado.");
            console.log("ID:", data.data.id);
        }

    } catch (e) {
        console.error("❌ ERRO CRÍTICO NA EXECUÇÃO:", e);
    }
}

testOfficialEmail();
