import * as admin from 'firebase-admin';

// Função para tentar inicializar o Admin SDK
function initializeAdmin() {
    if (admin.apps.length > 0) return admin.app();

    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (!serviceAccount) {
            console.warn('[FIREBASE ADMIN] Variável FIREBASE_SERVICE_ACCOUNT não encontrada ou vazia.');
            return null;
        }

        // TENTATIVA 1: Parse Direto (Ideal para JSON colado corretamente)
        try {
            // Tenta limpar apenas espaços em branco nas pontas
            const rawParams = JSON.parse(serviceAccount.trim());
            console.log('[FIREBASE ADMIN] Credenciais carregadas via parse direto.');
            return admin.initializeApp({
                credential: admin.credential.cert(rawParams)
            });
        } catch (e1) {
            console.log('[FIREBASE ADMIN] Falha no parse direto. Tentando limpeza de formatação avançada...');
        }

        // TENTATIVA 2: Limpeza de aspas extras e formatação do Netlify
        // Netlify às vezes escapa os \n literals no painel
        try {
            let cleanCreds = serviceAccount.toString().trim();

            // Se o JSON estiver envelopado em aspas simples ou duplas, remove
            if ((cleanCreds.startsWith('"') && cleanCreds.endsWith('"')) ||
                (cleanCreds.startsWith("'") && cleanCreds.endsWith("'"))) {
                cleanCreds = cleanCreds.slice(1, -1);
            }

            // Tenta lidar com quebras de linha escapadas
            // Se o JSON tiver literalmente os caracteres \ e n, isso pode ser necessário
            // Mas só aplicamos se o parse falhou antes.
            if (cleanCreds.includes('\\n')) {
                cleanCreds = cleanCreds.replace(/\\n/g, '\n');
            }

            const credentials = JSON.parse(cleanCreds);
            console.log('[FIREBASE ADMIN] Credenciais carregadas após limpeza.');

            return admin.initializeApp({
                credential: admin.credential.cert(credentials)
            });

        } catch (error: any) {
            console.error('[FIREBASE ADMIN] ERRO FATAL: Não foi possível ler as credenciais. Verifique o JSON no Netlify.', error.message);
            return null;
        }
    } catch (error) {
        console.error('[FIREBASE ADMIN] Erro fatal na inicialização geral:', error);
        return null;
    }
}

const app = initializeAdmin();

// Exporta o Firestore apenas se o app inicializou.
export const adminDb = app ? app.firestore() : null as any;
