const { Resend } = require('resend');
const resend = new Resend('re_SDAyVFTA_D6XRJqqbiXLT762cfZ1Upgc7');

const emailStyle = `
    <style>
        .container { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .header { background: linear-gradient(180deg, #E50914 0%, #000000 100%); padding: 60px 40px; text-align: center; }
        .logo { width: 220px; height: auto; }
        .content { padding: 45px 35px; text-align: center; color: #1a1a1a; }
        .status-badge { display: inline-block; padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
        .status-pending { background-color: #fff9db; color: #f08c00; }
        .status-approved { background-color: #ebfbee; color: #2f9e44; }
        .title { font-size: 32px; font-weight: 900; margin-bottom: 20px; color: #000; letter-spacing: -1px; }
        .text { font-size: 17px; color: #555; line-height: 1.7; margin-bottom: 30px; }
        .info-card { background-color: #fcfcfc; padding: 30px; border-radius: 20px; margin-bottom: 35px; text-align: center; border: 1px solid #f0f0f0; }
        .btn { display: inline-block; padding: 20px 40px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 17px; transition: transform 0.2s; }
        .btn-wa { background-color: #25D366; color: white; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); }
        .btn-red { background-color: #E50914; color: white; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3); }
        .footer { background-color: #000; padding: 40px; text-align: center; color: #555; font-size: 13px; }
        .support-link { color: #E50914; font-weight: bold; text-decoration: none; margin-top: 15px; display: block; font-size: 15px; }
    </style>
`;

async function sendTest() {
    try {
        console.log('Enviando e-mail de Teste 1 (Pendente V2)...');
        await resend.emails.send({
            from: 'RedFlix <onboarding@resend.dev>',
            to: ['adalmirpsantos@gmail.com'],
            subject: '⏳ PAGAMENTO PENDENTE - FINALIZAR AGORA',
            html: `
                <!DOCTYPE html>
                <html>
                <head>${emailStyle}</head>
                <body style="background-color: #f1f1f1; padding: 40px 10px;">
                    <div class="container">
                        <div class="header">
                            <img src="https://imgur.com/6H5gxcw.png" alt="RedFlix" class="logo">
                        </div>
                        <div class="content">
                            <div class="status-badge status-pending">⏳ AGUARDANDO PAGAMENTO</div>
                            <h1 class="title">Seu Pix foi gerado!</h1>
                            <p class="text">Olá! Quase tudo pronto para sua maratona começar. Só falta confirmarmos o seu pagamento.</p>
                            
                            <div class="info-card">
                                <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.8;">
                                    <strong>Como pagar?</strong><br>
                                    1. Copie o código Pix no site.<br>
                                    2. Abra o app do seu banco e escolha "Pix Copia e Cola".<br>
                                    3. Finalize o pagamento e pronto!
                                </p>
                            </div>

                            <a href="https://wa.me/5571991644164?text=Oi%2C%20acabei%20de%20gerar%20um%20Pix%20para%20assinar%20o%20RedFlix%2C%20mas%20estou%20com%20uma%20d%C3%BAvida.%20Pode%20me%20ajudar%3F" class="btn btn-wa">
                                💬 NÃO CONSEGUI PAGAR? ME AJUDE
                            </a>
                        </div>
                        <div class="footer">
                            <p>RedFlix Ultra Pro © 2026<br>A melhor experiência cinematográfica da internet.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        console.log('Enviando e-mail de Teste 2 (Aprovado V2)...');
        await resend.emails.send({
            from: 'RedFlix <onboarding@resend.dev>',
            to: ['adalmirpsantos@gmail.com'],
            subject: '🚀 PAGAMENTO APROVADO - ACESSO LIBERADO',
            html: `
                <!DOCTYPE html>
                <html>
                <head>${emailStyle}</head>
                <body style="background-color: #f1f1f1; padding: 40px 10px;">
                    <div class="container">
                        <div class="header">
                            <img src="https://imgur.com/6H5gxcw.png" alt="RedFlix" class="logo">
                        </div>
                        <div class="content">
                            <div class="status-badge status-approved">✅ PAGAMENTO CONFIRMADO</div>
                            <h1 class="title">PAGAMENTO APROVADO!</h1>
                            <p class="text">Seu acesso RedFlix está sendo gerado e será enviado agora mesmo.</p>
                            
                            <div class="info-card">
                                <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.8;">
                                    📥 <strong>Como vou receber meu acesso?</strong><br>
                                    Fique de olho no seu <strong>WhatsApp</strong>. Em instantes, nossa equipe entrará em contato enviando seu login, senha e o app oficial.
                                </p>
                            </div>

                            <a href="https://wa.me/5571991644164?text=Oi%2C%20j%C3%A1%20realizei%20o%20pagamento%20para%20assinar%20o%20RedFlix%20e%20aguardo%20meu%20acesso%21" class="btn btn-red">
                                🚀 CHAMAR NO WHATSAPP AGORA
                            </a>
                        </div>
                        <div class="footer">
                            <p>RedFlix Ultra Pro © 2026<br>Obrigado pela sua assinatura!</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        console.log('Testes V2 enviados com sucesso!');
    } catch (err) {
        console.error('Erro ao enviar:', err);
    }
}

sendTest();
