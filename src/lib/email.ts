import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

const Header = () => `
    <tr>
        <td align="center" style="background: linear-gradient(180deg, #1a0202 0%, #000000 100%); padding: 40px 20px; border-bottom: 4px solid #E50914;">
            <img src="https://i.imgur.com/6H5gxcw.png" alt="RedFlix" style="height: 60px; width: auto; display: block;" />
        </td>
    </tr>
`;

export const getEmailHtml = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RedFlix</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; background-color: #f6f6f6; color: #333333; }
        .button {
            background-color: #E50914;
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 900;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 6px rgba(229, 9, 20, 0.2);
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6;">
    <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            ${Header()}
            <tr>
                <td style="padding: 40px 30px; text-align: center; color: #333333;">
                    ${content}
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 30px; background-color: #eeeeee; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0;">RedFlix © 2026 • Todos os direitos reservados</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`;

export async function sendEmail({ email, plan, price, status, pixCode }: { email: string, plan: string, price: string, status: string, pixCode?: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.error("API Key missing");
        return { error: "API Key missing" };
    }

    let subject = '';
    let innerContent = '';

    if (status === 'approved') {
        subject = '🚀 ACESSO LIBERADO - RedFlix VIP';
        innerContent = `
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <h2 style="font-size: 26px; font-weight: 900; margin: 0 0 10px 0; color: #111111; text-transform: uppercase;">Pagamento Aprovado!</h2>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: #555555;">
                Seu plano <strong>${plan}</strong> foi ativado com sucesso.
            </p>
            
            <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; border-radius: 8px; padding: 25px; text-align: left; margin-bottom: 30px;">
                 <p style="color: #E50914; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">PRÓXIMOS PASSOS</p>
                <div style="margin-bottom: 12px; font-size: 14px; color: #333333;">
                    <strong style="color: #22c55e;">PASSO 1:</strong> Aguarde nosso contato via WhatsApp.
                </div>
                <div style="margin-bottom: 12px; font-size: 14px; color: #333333;">
                    <strong style="color: #22c55e;">PASSO 2:</strong> Receba seu login e senha exclusivos.
                </div>
                <div style="font-size: 14px; color: #333333;">
                    <strong style="color: #22c55e;">PASSO 3:</strong> Assista em 4K na sua TV, Celular ou PC.
                </div>
            </div>

            <a href="https://wa.me/5571991644164" class="button">
                Falar com Suporte
            </a>
        `;
    } else {
        subject = '⏳ FINALIZAR PAGAMENTO - RedFlix';
        innerContent = `
            <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
            
            <h2 style="font-size: 26px; font-weight: 900; margin: 0 0 10px 0; color: #111111; text-transform: uppercase;">Quase lá...</h2>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: #555555;">
                Recebemos seu pedido do plano <strong>${plan}</strong>. Finalize agora.
            </p>

            <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <p style="color: #888888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0;">TOTAL A PAGAR</p>
                <p style="color: #E50914; font-size: 42px; font-weight: 900; margin: 0 0 20px 0; letter-spacing: -1px;">R$ ${price}</p>
                
                ${pixCode ? `
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #dddddd; text-align: left;">
                    <p style="margin: 0 0 8px 0; color: #555555; font-size: 11px; text-transform: uppercase; font-weight: bold;">Copia e Cola Pix:</p>
                    <code style="display: block; font-family: monospace; color: #22c55e; word-break: break-all; font-size: 12px; background: #f0f0f0; padding: 10px; border-radius: 4px; border: 1px dashed #cccccc;">${pixCode}</code>
                </div>
                <p style="font-size: 12px; color: #777777; margin-top: 10px;">Copie o código acima e cole no seu app bancário.</p>
                ` : ''}
            </div>

            <p style="color: #666666; font-size: 13px; margin: 0;">
                Dúvidas? <a href="https://wa.me/5571991644164" style="color: #E50914; text-decoration: underline;">Chame no WhatsApp</a>
            </p>
        `;
    }

    try {
        console.log("Enviando e-mail para:", email);
        const data = await resend.emails.send({
            from: 'RedFlix <suporte@mail.redflixoficial.site>',
            to: [email],
            subject: subject,
            html: getEmailHtml(innerContent),
        });
        return data;
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        return { error };
    }
}
