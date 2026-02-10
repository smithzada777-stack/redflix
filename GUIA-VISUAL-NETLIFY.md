# 🎯 GUIA VISUAL: Configurar Variáveis na Netlify

## 📍 Onde Configurar

```
Netlify Dashboard
    └── Seu Site (redflix)
        └── Site configuration (menu lateral)
            └── Environment variables
                └── Add a variable ← CLIQUE AQUI
```

---

## 🖼️ Passo a Passo Visual

### PASSO 1: Acessar Environment Variables

```
┌─────────────────────────────────────────────┐
│  Netlify                                    │
├─────────────────────────────────────────────┤
│  ☰ Menu                                     │
│  ├─ Site overview                           │
│  ├─ Deploys                                 │
│  ├─ Site configuration  ← CLIQUE AQUI       │
│  │   ├─ General                             │
│  │   ├─ Environment variables ← DEPOIS AQUI │
│  │   ├─ Build & deploy                      │
│  │   └─ ...                                 │
│  └─ ...                                     │
└─────────────────────────────────────────────┘
```

---

### PASSO 2: Adicionar Variável

```
┌─────────────────────────────────────────────┐
│  Environment variables                      │
├─────────────────────────────────────────────┤
│                                             │
│  [+ Add a variable]  ← CLIQUE AQUI          │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Key                                   │ │
│  │ ┌───────────────────────────────────┐ │ │
│  │ │ NEXT_PUBLIC_FIREBASE_API_KEY      │ │ │
│  │ └───────────────────────────────────┘ │ │
│  │                                       │ │
│  │ Value                                 │ │
│  │ ┌───────────────────────────────────┐ │ │
│  │ │ AIzaSyABC123...                   │ │ │
│  │ └───────────────────────────────────┘ │ │
│  │                                       │ │
│  │ Scopes                                │ │
│  │ ☑ All scopes                          │ │
│  │                                       │ │
│  │ [Create variable]  ← CLIQUE AQUI      │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

### PASSO 3: Repetir para TODAS as 11 Variáveis

#### 1. Firebase (6 variáveis)

```
Key: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSy... (do Firebase Console)
```

```
Key: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: seu-projeto.firebaseapp.com
```

```
Key: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: seu-projeto-id
```

```
Key: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: seu-projeto.appspot.com
```

```
Key: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789
```

```
Key: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:123456789:web:abc123
```

---

#### 2. Firebase Service Account (1 variável) ⚠️ CRÍTICO

```
Key: FIREBASE_SERVICE_ACCOUNT
Value: {
  "type": "service_account",
  "project_id": "seu-projeto",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

⚠️ **IMPORTANTE**: Cole TODO o JSON, do `{` até o `}`

---

#### 3. PushinPay (2 variáveis)

```
Key: PUSHINPAY_API_KEY
Value: sua_api_key
```

```
Key: PUSHINPAY_SECRET_KEY
Value: sua_secret_key
```

---

#### 4. Resend (1 variável)

```
Key: RESEND_API_KEY
Value: re_...
```

---

#### 5. Ambiente (1 variável)

```
Key: NODE_ENV
Value: production
```

---

### PASSO 4: Verificar Todas as Variáveis

Depois de adicionar todas, você verá algo assim:

```
┌─────────────────────────────────────────────────────────┐
│  Environment variables                    [Add variable] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ NEXT_PUBLIC_FIREBASE_API_KEY          AIzaSy...     │
│  ✓ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN      projeto.fi... │
│  ✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID       projeto-id    │
│  ✓ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET   projeto.ap... │
│  ✓ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID  12345...  │
│  ✓ NEXT_PUBLIC_FIREBASE_APP_ID           1:12345...    │
│  ✓ FIREBASE_SERVICE_ACCOUNT              {"type":"... │
│  ✓ PUSHINPAY_API_KEY                     ********      │
│  ✓ PUSHINPAY_SECRET_KEY                  ********      │
│  ✓ RESEND_API_KEY                        re_******     │
│  ✓ NODE_ENV                              production    │
│                                                          │
│  Total: 11 variables                                    │
└─────────────────────────────────────────────────────────┘
```

✅ **Deve ter 11 variáveis no total!**

---

### PASSO 5: Fazer Redeploy

```
┌─────────────────────────────────────────────┐
│  Deploys                                    │
├─────────────────────────────────────────────┤
│                                             │
│  [Trigger deploy ▼]  ← CLIQUE AQUI          │
│    ├─ Deploy site    ← DEPOIS AQUI          │
│    └─ Clear cache and deploy site           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Onde Pegar Cada Valor

### 🔥 Firebase (6 variáveis)

```
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Clique em ⚙️ (engrenagem) → Project settings
4. Role até "Your apps"
5. Clique no ícone </> (Web app)
6. Copie os valores de firebaseConfig:

const firebaseConfig = {
  apiKey: "AIzaSy...",           ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "projeto.firebaseapp.com",  ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "projeto-id",       ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "projeto.appspot.com",   ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456",   ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"         ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

### 🔐 Firebase Service Account (1 variável)

```
1. Firebase Console → ⚙️ Project settings
2. Aba "Service accounts"
3. Clique em "Generate new private key"
4. Confirme "Generate key"
5. Um arquivo JSON será baixado
6. Abra no Notepad
7. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
8. Cole na Netlify
```

---

### 💳 PushinPay (2 variáveis)

```
1. Acesse: https://pushinpay.com.br/dashboard
2. Menu → Configurações → API
3. Copie:
   - API Key → PUSHINPAY_API_KEY
   - Secret Key → PUSHINPAY_SECRET_KEY
```

---

### 📧 Resend (1 variável)

```
1. Acesse: https://resend.com/api-keys
2. Copie sua API Key
3. Cole em RESEND_API_KEY
```

---

## ✅ Checklist Visual

```
Configuração de Variáveis na Netlify
├─ [ ] Acessei Site configuration
├─ [ ] Cliquei em Environment variables
├─ [ ] Adicionei NEXT_PUBLIC_FIREBASE_API_KEY
├─ [ ] Adicionei NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
├─ [ ] Adicionei NEXT_PUBLIC_FIREBASE_PROJECT_ID
├─ [ ] Adicionei NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
├─ [ ] Adicionei NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
├─ [ ] Adicionei NEXT_PUBLIC_FIREBASE_APP_ID
├─ [ ] Adicionei FIREBASE_SERVICE_ACCOUNT (JSON completo!)
├─ [ ] Adicionei PUSHINPAY_API_KEY
├─ [ ] Adicionei PUSHINPAY_SECRET_KEY
├─ [ ] Adicionei RESEND_API_KEY
├─ [ ] Adicionei NODE_ENV = production
├─ [ ] Verifiquei que tenho 11 variáveis
├─ [ ] Fiz Trigger deploy → Deploy site
└─ [ ] Aguardei deploy terminar (2-5 min)
```

---

## 🎉 Pronto!

Quando você ver:

```
✓ Deploy successful!
Your site is live at: https://seu-site.netlify.app
```

Significa que está tudo configurado! 🚀

Agora é só testar com um PIX de R$ 1,00!
