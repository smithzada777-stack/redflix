import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            let rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
            // Remove leading/trailing quotes if they exist
            if ((rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")) ||
                (rawServiceAccount.startsWith('"') && rawServiceAccount.endsWith('"'))) {
                rawServiceAccount = rawServiceAccount.slice(1, -1);
            }
            const serviceAccount = JSON.parse(rawServiceAccount);
            // Verify if key properties exist to avoid crash
            if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('[FIREBASE ADMIN] Inicializado com Service Account');
            } else {
                console.warn('[FIREBASE ADMIN] Service Account incompleta. Usando credenciais padrão ou ignorando...');
                // Fallback: try initializeApp without cert (might work if gcloud auth is present, or just fail gracefully)
                admin.initializeApp();
            }
        } else {
            admin.initializeApp();
        }
    } catch (error) {
        console.error('[FIREBASE ADMIN] Erro fatal na inicialização:', error);
        // IF WE cannot initialize, we might want to re-throw or handle it. 
        // For build time, it's better to not crash on imports if possible.
        // But if the app logic depends on it, it will struggle.
        // Let's try to initialize empty app as last resort to pass build static generation?
        // No, that might confuse things. Let's just catch.
    }
}

// Export a getter or a proxy to avoid immediate access issues if init failed?
// No, standard way is:
export const adminDb = admin.apps.length ? admin.firestore() : {} as any; 
