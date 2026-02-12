import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
    try {
        // Collect all customers from approved sales to create a unique customer list
        const salesRef = db.collection('sales');
        // We get recent approved sales to build a list of people to talk to
        const snapshot = await salesRef
            .where('status', '==', 'approved')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const customerMap = new Map();

        snapshot.docs.forEach((doc: any) => {
            const data = doc.data();
            // Group by email to avoid duplicates in remarketing list
            if (!customerMap.has(data.email)) {
                customerMap.set(data.email, {
                    id: doc.id,
                    email: data.email,
                    whatsapp: data.whatsapp,
                    planName: data.planName || 'Plano Mensal'
                });
            }
        });

        const customers = Array.from(customerMap.values());

        return NextResponse.json({ customers });

    } catch (error: any) {
        console.error('Error fetching customers:', error.message);
        return NextResponse.json({ customers: [], error: error.message }, { status: 500 });
    }
}
