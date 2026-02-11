import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, plan, price, status = 'pending' } = body;

        if (!email) {
            return NextResponse.json({ error: "Email missing" }, { status: 400 });
        }

        const data = await sendEmail({ email, plan, price, status });

        if ('error' in data && data.error) {
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

