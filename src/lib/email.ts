import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

// Header: Sempre Escuro com Gradiente (Premium)
const Header = () => `
    <tr>
        <td align="center" style="background: linear-gradient(180deg, #1a0202 0%, #000000 100%); padding: 30px 20px; border-bottom: 4px solid #E50914;">
            <img src="https://i.imgur.com/6H5gxcw.png" alt="RedFlix" style="height: 60px; width: auto; display: block;" />
        </td>
    </tr>
`;

// Layout Base
export const getEmailHtml = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RedFlix</title>
    <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .button {
            background-color: #E50914;
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            mso-hide: all;
        }
    </style>
</head>
<body style="margin: 0; padding: 0;">
    <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
            ${Header()}
            <tr>
                <td style="padding: 40px 20px; text-align: center;">
                    ${content}
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 20px; color: #888888; font-size: 12px; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0;">RedFlix © 2026</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`;

export async function sendEmail({ email, plan, price, status }: { email: string, plan: string, price: string, status: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.error("API Key missing");
        return { error: "API Key missing" };
    }

    let subject = '';
    let innerContent = '';

    if (status === 'approved') {
        subject = '🚀 Pagamento Aprovado - RedFlix';
        innerContent = `
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0; color: #333333;">Pagamento Confirmado!</h2>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px 0; color: #555555;">
                Seu plano <strong>${plan}</strong> está ativo e pronto para uso.
            </p>
            <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 30px;">
                <p style="color: #333333; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">COMO ACESSAR</p>
                <p style="color: #555555; font-size: 14px; margin: 0 0 5px 0;">1. Aguarde o contato da nossa equipe.</p>
                <p style="color: #555555; font-size: 14px; margin: 0 0 5px 0;">2. Enviaremos seu login e senha no WhatsApp.</p>
                <p style="color: #555555; font-size: 14px; margin: 0;">3. Suporte total para instalação na TV.</p>
            </div>
            <a href="https://wa.me/5571991644164" class="button" style="color: #ffffff;">
                Suporte / WhatsApp
            </a>
            <p style="margin-top: 30px; color: #999999; font-size: 12px;">Precisa de ajuda? Clique no botão acima.</p>
        `;
    } else {
        subject = '⏳ Pagamento Pendente - RedFlix';
        innerContent = `
            <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
            <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0; color: #333333;">Quase lá...</h2>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px 0; color: #555555;">
                Recebemos seu pedido do plano <strong>${plan}</strong>.
            </p>
            <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #333333; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">TOTAL A PAGAR</p>
                <p style="color: #E50914; font-size: 36px; font-weight: 900; margin: 0;">R$ ${price}</p>
            </div>
            <p style="color: #555555; font-size: 14px; margin: 0;">
                Caso não tenha recebido sua chave de acesso ou tenha dúvidas, fale com o suporte.
            </p>
        `;
    }

    try {
        console.log("Enviando e-mail para:", email, "via", 'suporte@mail.redflixoficial.site');
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
