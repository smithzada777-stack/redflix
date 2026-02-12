import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) return NextResponse.json({ error: 'ID da venda é obrigatório' }, { status: 400 });

        const saleRef = db.collection('sales').doc(id);
        const saleSnap = await saleRef.get();

        if (!saleSnap.exists) {
            return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
        }

        const saleData = saleSnap.data();

        // Update to approved
        await saleRef.update({
            status: 'approved',
            paidAt: new Date(),
            manualApproval: true
        });

        // Send access email
        if (saleData.email) {
            await resend.emails.send({
                from: 'RedFlix <onboarding@resend.dev>',
                to: [saleData.email],
                subject: '🚀 PAGO E APROVADO! - RedFlix VIP',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eeeeee;">
                        <div style="background-color: #050505; padding: 20px; text-align: center;">
                            <img src="https://imgur.com/6H5gxcw.png" alt="RedFlix" style="width: 150px; height: auto;">
                        </div>
                        <div style="padding: 40px 20px; text-align: center; color: #333333;">
                            <h1 style="color: #22a344; margin-bottom: 20px;">🚀 PAGO E APROVADO!</h1>
                            <p style="font-size: 18px; font-weight: bold;">Seu acesso RedFlix está pronto!</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                Sua compra foi aprovada manualmente pelo administrador. Seu acesso será entregue agora mesmo através do seu <strong>WhatsApp</strong>.
                            </p>
                            
                            <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; border: 1px solid #c6f6d5; margin-bottom: 30px;">
                                <p style="margin: 0; color: #2f855a; font-size: 15px;">Fique atento às suas mensagens, nosso suporte já está te chamando!</p>
                            </div>

                            <a href="https://wa.me/5571991644164?text=Olá, ja realizei o pagamento e aguardo meu acesso!" style="background-color: #E50914; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                 CHAMAR SUPORTE AGORA
                            </a>
                        </div>
                        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                            © 2026 RedFlix Ultra Pro. Todos os direitos reservados.
                        </div>
                    </div>
                `
            }).catch(console.error);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Manual approval error:', error.message);
        return NextResponse.json({ error: 'Falha ao aprovar venda' }, { status: 500 });
    }
}
