# MANUAL DE CORREÇÃO DEFINITIVA: INTEGRAÇÃO PIX (PUSHINPAY + FIREBASE)
# DATA: 10/02/2026
# OBJETIVO: Resolver o erro onde o status "PAGO" não atualiza automaticamente.

Este manual descreve EXATAMENTE como a integração deve ser feita para funcionar 100%.
Se o seu programador ou você seguir este guia à risca, o sistema VAI funcionar.

---

## 🚫 O QUE NÃO FAZER (ERROS COMUNS)

1. **NÃO USAR A LIB PADRÃO NO BACKEND**
   - Erro: Tentar usar `import { db } from './firebase.js'` (Client SDK) dentro do Netlify Functions ou Node.js.
   - Consequência: O Webhook falha silenciosamente por falta de permissão ou cai por timeout.

2. **NÃO ESPERAR O WEBHOOK PARA CRIAR O DOCUMENTO**
   - Erro: Gerar o Pix na PushinPay e não salvar NADA no banco de dados imediatamente.
   - Consequência: O Frontend fica "ouvindo" um documento que não existe. Se o webhook demorar 1 segundo, o usuário acha que deu erro.

3. **NÃO IGNORAR A FORMATAÇÃO DE DADOS**
   - Erro: Comparar IDs numéricos com strings ou status "PAID" com "paid".
   - Consequência: O código recebe a confirmação de pagamento mas acha que é outro pedido.

---

## ✅ O QUE FAZER (PASSO A PASSO TÉCNICO)

### PASSO 1: CONFIGURAÇÃO DO BACKEND (Netlify Functions)

Você PRECISA usar o `firebase-admin` (SDK Administrativo) no Backend. Ele tem permissão total para gravar no banco sem bloqueios de segurança.

**Instalação:**
`npm install firebase-admin`

**Como Inicializar (Exemplo de código para `firebaseAdmin.js`):**

```javascript
var admin = require("firebase-admin");

// DICA DE OURO:
// Pegue o JSON da Service Account no Console do Firebase (Configurações do Projeto > Contas de Serviço).
// Converta esse JSON em uma string e coloque numa variável de ambiente (ex: FIREBASE_SERVICE_ACCOUNT).

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = admin.firestore();
module.exports = { db };
```

---

### PASSO 2: A REGRA DE OURO DA CRIAÇÃO (pix.js)

**REGRA:** Assim que você receber o ID do Pix da PushinPay, GRAVE NO BANCO IMEDIATAMENTE com status `pending`.

**Como o código deve ser:**

```javascript
// ...chama API da PushinPay...
const pixData = response.data; // ID: 12345

// SALVA O ESTADO INICIAL AGORA!
await db.collection('payments').doc(String(pixData.id)).set({
    id: String(pixData.id),
    status: 'pending', // Status inicial
    value: 1000,
    created_at: new Date().toISOString()
});

return { statusCode: 200, body: JSON.stringify(pixData) };
```

---

### PASSO 3: O WEBHOOK PERFEITO (webhook.js)

O Webhook deve ser "blindado". Ele deve aceitar JSON e garantir que o status seja atualizado.

**Checklist do Webhook:**
1. Recebeu o POST?
2. O ID existe?
3. O status é novo?
4. **GRAVA NO DISCO (FIREBASE) USANDO O ADMIN SDK.**

**Snippet Crucial:**
```javascript
const { db } = require('./firebaseAdmin'); // Importa o Admin SDK configurado no Passo 1

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const pixId = String(data.id); // Força string
    const novoStatus = String(data.status).toLowerCase(); // Força minúsculo (ex: "paid")

    console.log(`Recebido Pix ${pixId} com status ${novoStatus}`);

    // Atualiza o documento que JÁ EXISTE (criado no Passo 2)
    await db.collection('payments').doc(pixId).set({
        status: novoStatus,
        updated_at: new Date().toISOString()
    }, { merge: true });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

---

### PASSO 4: O FRONTEND QUE ESCUTA (Monitoramento em Tempo Real)

O Frontend não deve perguntar "já pagou?" a cada 5 segundos. Ele deve abrir um canal direto (WebSocket) com o Firestore.

**Código no Frontend (Client-side):**

```javascript
import { onSnapshot, doc } from "firebase/firestore"; 

function monitorarPagamento(idDoPix) {
    // IMPORTANTE: O ID tem que ser String!
    const docRef = doc(db, "payments", String(idDoPix));

    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const dados = doc.data();
            console.log("Status atual:", dados.status);

            if (dados.status === 'paid' || dados.status === 'approved') {
                // SUCESSO! LIBERA O ACESSO
                alert("Pagamento Aprovado!");
                window.location.href = "/sucesso";
            }
        }
    });
}
```

---

## 🛠 RESUMO DIAGNÓSTICO
Se o "Pago" não aparece, verifique nesta ordem:
1. O documento é criado no Firebase logo no começo? (Se não, corrija o Passo 2).
2. O Webhook está recebendo o POST da PushinPay? (Olhe os logs do Netlify).
3. O Webhook tem permissão de escrita? (Se estiver usando `firebase-admin`, TEM. Se não, corrija o Passo 1).
4. O Frontend está ouvindo o mesmo ID que o Backend gravou? (Verifique se um não é número e o outro string).

Siga este roteiro e o problema sera resolvido.
