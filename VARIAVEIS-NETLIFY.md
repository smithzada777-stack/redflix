# 🔑 VARIÁVEIS QUE VOCÊ PRECISA CONFIGURAR NA NETLIFY

## 📋 Lista Completa de Environment Variables

Quando você fizer o deploy na Netlify, você vai precisar adicionar estas variáveis em:
**Site configuration** → **Environment variables** → **Add a variable**

---

## 1️⃣ FIREBASE (6 variáveis)

### Como pegar esses valores?
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. ⚙️ **Project settings** → **General**
4. Role até **Your apps** → Selecione o app Web
5. Copie os valores de `firebaseConfig`

### Variáveis para adicionar:

```
Nome: NEXT_PUBLIC_FIREBASE_API_KEY
Valor: AIzaSy... (copie do Firebase Console)
```

```
Nome: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Valor: seu-projeto.firebaseapp.com
```

```
Nome: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Valor: seu-projeto-id
```

```
Nome: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Valor: seu-projeto.appspot.com
```

```
Nome: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Valor: 123456789
```

```
Nome: NEXT_PUBLIC_FIREBASE_APP_ID
Valor: 1:123456789:web:abc123...
```

---

## 2️⃣ FIREBASE SERVICE ACCOUNT (1 variável) ⚠️ CRÍTICO!

### Como pegar esse valor?
1. Firebase Console → ⚙️ **Project settings**
2. Aba **Service accounts**
3. **Generate new private key**
4. Baixa um arquivo JSON
5. Abra o JSON no Notepad
6. Copie **TODO** o conteúdo (incluindo `{}`)

### Variável para adicionar:

```
Nome: FIREBASE_SERVICE_ACCOUNT
Valor: {
  "type": "service_account",
  "project_id": "seu-projeto",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk@...",
  ...
}
```

⚠️ **Cole TODO o JSON, não apenas uma parte!**

---

## 3️⃣ PUSHINPAY (2 variáveis)

### Como pegar esses valores?
1. Acesse: https://pushinpay.com.br/dashboard
2. Vá em **Configurações** → **API**
3. Copie as chaves

### Variáveis para adicionar:

```
Nome: PUSHINPAY_API_KEY
Valor: sua_api_key_da_pushinpay
```

```
Nome: PUSHINPAY_SECRET_KEY
Valor: sua_secret_key_da_pushinpay
```

---

## 4️⃣ RESEND (Email) (1 variável)

### Como pegar esse valor?
1. Acesse: https://resend.com/api-keys
2. Copie sua API Key

### Variável para adicionar:

```
Nome: RESEND_API_KEY
Valor: re_... (sua chave do Resend)
```

---

## 5️⃣ NODE_ENV (1 variável)

### Variável para adicionar:

```
Nome: NODE_ENV
Valor: production
```

---

## 📊 RESUMO: Total de 11 Variáveis

### Firebase (6):
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin (1):
- ✅ `FIREBASE_SERVICE_ACCOUNT` ⚠️ **CRÍTICO!**

### PushinPay (2):
- ✅ `PUSHINPAY_API_KEY`
- ✅ `PUSHINPAY_SECRET_KEY`

### Resend (1):
- ✅ `RESEND_API_KEY`

### Ambiente (1):
- ✅ `NODE_ENV`

---

## 🎯 Passo a Passo na Netlify

### 1. Acessar Configurações
1. Entre no painel da Netlify
2. Selecione seu site
3. **Site configuration** (menu lateral)
4. **Environment variables**

### 2. Adicionar Cada Variável
Para cada uma das 11 variáveis acima:

1. Clique em **Add a variable**
2. **Key**: Cole o nome (ex: `NEXT_PUBLIC_FIREBASE_API_KEY`)
3. **Value**: Cole o valor correspondente
4. **Scopes**: Deixe marcado "All scopes"
5. Clique em **Create variable**

### 3. Redeploy
Depois de adicionar TODAS as variáveis:

1. Vá em **Deploys** (menu lateral)
2. Clique em **Trigger deploy**
3. Selecione **Deploy site**
4. Aguarde o deploy terminar (~2-5 minutos)

---

## ⚠️ ATENÇÃO: Ordem de Importância

### 🔴 CRÍTICO (Sem isso não funciona):
1. `FIREBASE_SERVICE_ACCOUNT` - Webhook não grava no Firebase
2. Todas as 6 variáveis `NEXT_PUBLIC_FIREBASE_*` - Site não conecta
3. `PUSHINPAY_API_KEY` e `PUSHINPAY_SECRET_KEY` - PIX não é gerado

### 🟡 IMPORTANTE (Funcionalidades extras):
4. `RESEND_API_KEY` - Email de confirmação
5. `NODE_ENV` - Otimizações de produção

---

## 🐛 Como Verificar se Está Correto

### Opção 1: Ver Logs do Build
1. Netlify → **Deploys** → Último deploy
2. Veja os logs
3. Procure por erros de variáveis faltando

### Opção 2: Testar o Site
1. Acesse: `https://seu-site.netlify.app`
2. Tente gerar um PIX
3. Se funcionar = variáveis corretas! ✅

### Opção 3: Ver Logs da Função
1. Netlify → **Functions**
2. Clique em `webhook`
3. Veja se há erros de Firebase

---

## 💡 Dicas

### ✅ Copie e Cole com Cuidado
- Não adicione espaços extras
- Copie o valor completo
- Verifique se não cortou nada

### ✅ Firebase Service Account
- Deve ser o JSON COMPLETO
- Incluindo as chaves `{` e `}`
- Todas as quebras de linha preservadas

### ✅ Teste Antes
- Adicione todas as variáveis
- Faça redeploy
- Teste com PIX de R$ 1,00

---

## 📝 Checklist de Variáveis

Marque conforme adiciona:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `FIREBASE_SERVICE_ACCOUNT` (JSON completo!)
- [ ] `PUSHINPAY_API_KEY`
- [ ] `PUSHINPAY_SECRET_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `NODE_ENV` = `production`
- [ ] Redeploy executado
- [ ] Site testado

---

## 🎉 Pronto!

Quando todas as 11 variáveis estiverem configuradas e você fizer o redeploy, seu site vai funcionar perfeitamente na Netlify! 🚀
