import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

// --- Robust Email API (Adaptive Theme) ---

// Header: Sempre Escuro com Gradiente (Premium)
const Header = () => `
    <tr>
        <td align="center" style="background: linear-gradient(180deg, #1a0202 0%, #000000 100%); padding: 40px 20px; border-bottom: 4px solid #E50914;">
            <h1 style="color: #E50914; font-family: 'Arial Black', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase; font-style: italic; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">REDFLIX</h1>
        </td>
    </tr>
`;

// Layout Base: Sem forçar cor de fundo no corpo para evitar bugs de inversão
const getEmailHtml = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RedFlix</title>
    <style>
        /* Base Reset */
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        
        /* O Cliente de Email decide a cor de fundo (Branco no Light, Preto no Dark) */
        /* Isso evita o bug de texto branco em fundo branco */
        
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
            <!-- Header (Sempre Dark) -->
            ${Header()}
            
            <!-- Content (Adaptativo) -->
            <tr>
                <td style="padding: 40px 20px; text-align: center;">
                    ${content}
                </td>
            </tr>
            
            <!-- Footer -->
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

export async function POST(request: Request) {
    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { email, plan, price, status = 'pending' } = body;

        if (!email) {
            return NextResponse.json({ error: "Email missing" }, { status: 400 });
        }

        let subject = '';
        let innerContent = '';

        if (status === 'approved') {
            subject = '🚀 Pagamento Aprovado - RedFlix';
            innerContent = `
                <!-- Ícone -->
                <div style="font-size: 48px; margin-bottom: 20px;">✅</div>

                <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0; color: #333333;">Pagamento Confirmado!</h2>
                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px 0; color: #555555;">
                    Seu plano <strong>${plan}</strong> está ativo e pronto para uso.
                </p>

                <!-- Box de Instruções (Cinza Claro para contraste seguro) -->
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
            // Pending
            subject = '⏳ Pagamento Pendente - RedFlix';
            innerContent = `
                <!-- Ícone -->
                <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>

                <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0; color: #333333;">Quase lá...</h2>
                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px 0; color: #555555;">
                    Recebemos seu pedido do plano <strong>${plan}</strong>.
                </p>

                <!-- Box de Valor -->
                <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #333333; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">TOTAL A PAGAR</p>
                    <p style="color: #E50914; font-size: 36px; font-weight: 900; margin: 0;">R$ ${price}</p>
                </div>

                <p style="color: #555555; font-size: 14px; margin: 0;">
                    Caso não tenha recebido sua chave de acesso ou tenha dúvidas, fale com o suporte.
                </p>
            `;
        }

        console.log("Enviando e-mail para:", email, "via", 'suporte@mail.redflixoficial.site');

        const data = await resend.emails.send({
            from: 'RedFlix <suporte@mail.redflixoficial.site>',
            to: [email],
            subject: subject,
            html: getEmailHtml(innerContent),
        });

        if (data.error) {
            console.error(data.error);
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
