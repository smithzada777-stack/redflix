# 🚀 Deploy Rápido - Netlify

## Comandos para Executar (em ordem)

### 1️⃣ Preparar Git
```bash
# Navegar para a pasta do projeto
cd "c:\Users\Adalmir\Desktop\apenas teste\redflix"

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Deploy inicial na Netlify"
```

### 2️⃣ Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `redflix`
3. Deixe **Private**
4. Clique em **Create repository**

### 3️⃣ Enviar para GitHub
```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/redflix.git
git branch -M main
git push -u origin main
```

### 4️⃣ Deploy na Netlify
1. Acesse: https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. Escolha **GitHub** → Autorize
4. Selecione repositório `redflix`
5. Clique em **Deploy site**
6. ⏳ Aguarde 2-5 minutos

### 5️⃣ Configurar Variáveis de Ambiente
No painel da Netlify:
1. **Site configuration** → **Environment variables**
2. Adicione (copie do seu `.env` local):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
PUSHINPAY_API_KEY
PUSHINPAY_SECRET_KEY
RESEND_API_KEY
NODE_ENV = production
```

### 5.5️⃣ ⚠️ IMPORTANTE: Firebase Service Account
**O webhook NÃO vai funcionar sem isso!**

1. Firebase Console → ⚙️ **Project settings** → **Service accounts**
2. **Generate new private key** → Baixa um arquivo JSON
3. Abra o JSON no Notepad e copie **TODO** o conteúdo
4. Na Netlify, adicione variável:
   - Nome: `FIREBASE_SERVICE_ACCOUNT`
   - Valor: Cole TODO o JSON (incluindo `{}`)

📖 **Guia detalhado**: Veja `FIREBASE-SERVICE-ACCOUNT.md`

3. **Trigger deploy** → **Deploy site**

### 6️⃣ Configurar Webhook PushinPay

1. Copie a URL da Netlify: `https://seu-projeto.netlify.app`
2. Acesse: https://pushinpay.com.br/dashboard
3. **Configurações** → **Webhooks**
4. URL: `https://seu-projeto.netlify.app/api/webhook`
5. Eventos: `payment.approved`, `payment.cancelled`
6. Salvar

### 7️⃣ Testar! 🎉
1. Acesse: `https://seu-projeto.netlify.app`
2. Gere PIX de R$ 1,00
3. Pague
4. Aguarde redirecionamento automático!

---

## ✅ Checklist
- [ ] Código no GitHub
- [ ] Site deployado
- [ ] Variáveis configuradas
- [ ] Webhook configurado
- [ ] Teste realizado

---

## 🆘 Problemas?
Veja o guia completo: `DEPLOY-NETLIFY.md`
