import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
    try {
        // Get approved sales from last 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const salesRef = db.collection('sales');
        const snapshot = await salesRef
            .where('status', '==', 'approved')
            .where('paidAt', '>=', sixtyDaysAgo)
            .get();

        const renewals = snapshot.docs
            .map((doc: any) => {
                const data = doc.data();
                const paidAt = data.paidAt?.toDate() || new Date();

                // Calculate expiry based on plan
                let daysToAdd = 30; // Default: monthly
                if (data.planName?.includes('Trimestral')) daysToAdd = 90;
                if (data.planName?.includes('Anual')) daysToAdd = 365;

                const expiresAt = new Date(paidAt);
                expiresAt.setDate(expiresAt.getDate() + daysToAdd);

                const now = new Date();
                const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return {
                    id: doc.id,
                    email: data.email,
                    whatsapp: data.whatsapp,
                    planName: data.planName,
                    paidAt: data.paidAt,
                    expiresAt,
                    daysUntilExpiry
                };
            })
            .filter((r: any) => r.daysUntilExpiry > 0 && r.daysUntilExpiry <= 7) // Next 7 days
            .sort((a: any, b: any) => a.daysUntilExpiry - b.daysUntilExpiry);

        return NextResponse.json({ renewals });

    } catch (error: any) {
        console.error('Error fetching renewals:', error.message);
        return NextResponse.json({ renewals: [], error: error.message }, { status: 500 });
    }
}
