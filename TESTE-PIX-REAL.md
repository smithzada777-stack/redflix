# Como Testar PIX Real (Sair do Debug)

## 🎯 Problema
A PushinPay não consegue enviar webhooks para `localhost`, então não recebemos confirmação de pagamento.

## ✅ Solução 1: Ngrok (Mais Rápido)

### Passo 1: Instalar Ngrok
1. Baixe em: https://ngrok.com/download
2. Extraia o arquivo
3. Crie conta grátis em: https://dashboard.ngrok.com/signup

### Passo 2: Configurar Ngrok
```bash
# Autenticar (pegue o token em https://dashboard.ngrok.com/get-started/your-authtoken)
ngrok config add-authtoken SEU_TOKEN_AQUI

# Criar túnel para porta 3000
ngrok http 3000
```

### Passo 3: Usar URL do Ngrok
Ngrok vai gerar uma URL tipo: `https://abc123.ngrok.io`

**Configure no painel PushinPay:**
- Webhook URL: `https://abc123.ngrok.io/api/webhook/pushinpay`

### Passo 4: Testar
1. Mantenha ngrok rodando
2. Mantenha `npm run dev` rodando
3. Acesse pelo navegador: `https://abc123.ngrok.io`
4. Faça um pagamento PIX real
5. O webhook será recebido!

---

## ✅ Solução 2: Deploy na Vercel (Produção)

### Passo 1: Preparar Projeto
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Passo 2: Configurar Variáveis de Ambiente
No painel da Vercel, adicione:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `PUSHINPAY_API_KEY`
- `PUSHINPAY_SECRET_KEY`

### Passo 3: Atualizar PushinPay
Configure o webhook para: `https://seu-projeto.vercel.app/api/webhook/pushinpay`

---

## ✅ Solução 3: Localhost Tunneling (Alternativa)

### Usando LocalTunnel
```bash
# Instalar
npm install -g localtunnel

# Criar túnel
lt --port 3000
```

Vai gerar URL tipo: `https://random-name.loca.lt`

---

## 🔧 Remover Modo Debug

### 1. Remover Auto-Aprovação
Edite `src/app/api/webhook/pushinpay/route.ts`:

```typescript
// REMOVER ESTAS LINHAS:
if (process.env.NODE_ENV === 'development') {
  // Auto-aprovar em desenvolvimento
  setTimeout(async () => {
    // ... código de auto-aprovação
  }, 5000);
}
```

### 2. Configurar Webhook Real
No painel PushinPay (https://pushinpay.com.br):
1. Vá em **Configurações** → **Webhooks**
2. Adicione a URL do ngrok/vercel
3. Eventos: `payment.approved`, `payment.cancelled`

---

## 📋 Checklist de Teste Real

- [ ] Ngrok/Vercel rodando
- [ ] Webhook configurado no PushinPay
- [ ] Variáveis de ambiente configuradas
- [ ] Firebase com permissões corretas
- [ ] Modo debug removido
- [ ] Fazer pagamento PIX de **valor baixo** (R$ 1,00)
- [ ] Verificar logs do webhook
- [ ] Confirmar atualização no Firebase
- [ ] Verificar redirecionamento para `/success`

---

## 🐛 Debug de Webhooks

### Ver Logs do Ngrok
Acesse: `http://localhost:4040`
- Mostra todas requisições HTTP
- Útil para ver se webhook chegou

### Ver Logs da Vercel
```bash
vercel logs
```

### Testar Webhook Manualmente
```bash
curl -X POST https://sua-url.ngrok.io/api/webhook/pushinpay \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.approved",
    "data": {
      "id": "test123",
      "status": "approved"
    }
  }'
```

---

## 💰 Dica: Teste com Valor Baixo
- Primeiro teste: R$ 1,00
- Confirme que funciona
- Depois teste com valores reais

---

## ⚠️ Importante
- **Ngrok grátis**: URL muda cada vez que reinicia
- **Ngrok pago**: URL fixa
- **Vercel**: Melhor para produção
- **LocalTunnel**: Alternativa gratuita
