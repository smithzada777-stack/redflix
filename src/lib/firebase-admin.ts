import * as admin from 'firebase-admin';

let dbInstance: any;

try {
    if (!admin.apps.length) {
        let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountStr) {
            const serviceAccount = JSON.parse(serviceAccountStr);

            // Fix private key newlines if they are escaped as literal '\n'
            if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin initialized successfully');
            dbInstance = admin.firestore();
            dbInstance.isMock = false;
        } else {
            console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
            throw new Error("Missing credentials");
        }
    } else {
        dbInstance = admin.firestore();
        dbInstance.isMock = false;
    }
} catch (error: any) {
    console.error('❌ Firebase Initialization Error:', error.message);

    // Improved Mock DB implementation to prevent dashboard crashes
    const mockDoc = {
        set: async () => console.log('Mock DB: Document saved'),
        get: async () => ({
            exists: true,
            id: 'mock_doc',
            data: () => ({
                status: 'pending',
                email: 'demo@redflix.app',
                whatsapp: '11999999999',
                amount: 27.90,
                planName: 'Plano Mensal',
                createdAt: new Date()
            })
        }),
        update: async () => console.log('Mock DB: Document updated'),
    };

    const mockCollection: any = {
        doc: () => mockDoc,
        where: () => mockCollection,
        orderBy: () => mockCollection,
        limit: () => mockCollection,
        get: async () => ({ docs: [] }) // Return empty list instead of crashing
    };

    dbInstance = {
        collection: () => mockCollection,
        batch: () => ({
            set: () => { },
            update: () => { },
            delete: () => { },
            commit: async () => { }
        }),
        isMock: true
    };
}

export const db = dbInstance;
