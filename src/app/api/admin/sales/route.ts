import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'today';
        const customStart = searchParams.get('start');
        const customEnd = searchParams.get('end');

        let startDate: Date;
        let endDate: Date = new Date();

        // Calculate date range based on period
        switch (period) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'custom':
                if (customStart && customEnd) {
                    startDate = new Date(customStart);
                    endDate = new Date(customEnd);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    startDate = new Date();
                    startDate.setHours(0, 0, 0, 0);
                }
                break;
            default:
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
        }

        // Simplified Query for Debugging: Get last 100 sales regardless of date
        const salesRef = db.collection('sales');
        const snapshot = await salesRef
            .limit(100)
            .get();

        const sales = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort manually by createdAt if available
        sales.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || 0;
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || 0;
            return dateB - dateA;
        });

        return NextResponse.json({ sales });

    } catch (error: any) {
        console.error('Error fetching sales:', error.message);
        return NextResponse.json({ sales: [], error: error.message }, { status: 500 });
    }
}
