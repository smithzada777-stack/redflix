# 🚀 Deploy na Netlify - Guia Completo

## 📋 Pré-requisitos
- Conta no GitHub (para conectar o repositório)
- Conta na Netlify (gratuita): https://app.netlify.com/signup
- Projeto RedFlix pronto

---

## 🔧 Passo 1: Preparar o Repositório no GitHub

### 1.1 Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `redflix` (ou outro nome)
3. Deixe como **Private** (recomendado)
4. **NÃO** adicione README, .gitignore ou license
5. Clique em **Create repository**

### 1.2 Subir código para o GitHub
```bash
# No terminal, dentro da pasta do projeto:
cd "c:\Users\Adalmir\Desktop\apenas teste\redflix"

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Preparar projeto para deploy na Netlify"

# Adicionar repositório remoto (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/redflix.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Passo 2: Deploy na Netlify

### 2.1 Conectar Repositório
1. Acesse: https://app.netlify.com
2. Clique em **Add new site** → **Import an existing project**
3. Escolha **GitHub**
4. Autorize a Netlify a acessar seus repositórios
5. Selecione o repositório `redflix`

### 2.2 Configurar Build
A Netlify vai detectar automaticamente que é Next.js:
- **Build command**: `npm run build` (já configurado)
- **Publish directory**: `.next` (já configurado)
- **Node version**: 20 (já configurado no netlify.toml)

Clique em **Deploy site**

### 2.3 Aguardar Deploy
- O primeiro deploy leva ~2-5 minutos
- Você verá logs em tempo real
- Quando terminar, terá um link tipo: `https://random-name-123.netlify.app`

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Acessar Configurações
1. No painel da Netlify, vá em **Site configuration**
2. Clique em **Environment variables**
3. Clique em **Add a variable**

### 3.2 Adicionar Variáveis (uma por uma)

#### Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY = (copie do seu .env local)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (copie do seu .env local)
NEXT_PUBLIC_FIREBASE_PROJECT_ID = (copie do seu .env local)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = (copie do seu .env local)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (copie do seu .env local)
NEXT_PUBLIC_FIREBASE_APP_ID = (copie do seu .env local)
```

#### PushinPay
```
PUSHINPAY_API_KEY = (sua chave da PushinPay)
PUSHINPAY_SECRET_KEY = (sua chave secreta da PushinPay)
```

#### Resend (Email)
```
RESEND_API_KEY = (sua chave do Resend)
```

#### Ambiente
```
NODE_ENV = production
```

### 3.3 Redeploy
Após adicionar as variáveis:
1. Vá em **Deploys**
2. Clique em **Trigger deploy** → **Deploy site**

---

## 🎯 Passo 4: Configurar Webhook na PushinPay

### 4.1 Pegar URL da Netlify
Sua URL será algo como: `https://seu-projeto.netlify.app`

### 4.2 Configurar no Painel PushinPay
1. Acesse: https://pushinpay.com.br/dashboard
2. Vá em **Configurações** → **Webhooks**
3. Adicione a URL do webhook:
   ```
   https://seu-projeto.netlify.app/api/webhook/pushinpay
   ```
4. Selecione os eventos:
   - ✅ `payment.approved`
   - ✅ `payment.cancelled`
   - ✅ `payment.expired`
5. Salve

---

## ✅ Passo 5: Testar Pagamento Real

### 5.1 Acessar Site
Abra: `https://seu-projeto.netlify.app`

### 5.2 Fazer Teste com R$ 1,00
1. Vá para a página de checkout
2. Preencha os dados
3. Gere um PIX de **R$ 1,00**
4. Pague usando seu app bancário
5. Aguarde 5-10 segundos
6. Deve redirecionar para `/success` automaticamente! 🎉

---

## 🐛 Passo 6: Monitorar e Debugar

### 6.1 Ver Logs da Netlify
1. No painel da Netlify, vá em **Functions**
2. Clique na função `webhook-pushinpay`
3. Veja os logs em tempo real

### 6.2 Ver Logs do Firebase
1. Acesse o Firebase Console
2. Vá em **Firestore Database**
3. Verifique se o documento do pagamento foi atualizado

### 6.3 Testar Webhook Manualmente
```bash
curl -X POST https://seu-projeto.netlify.app/api/webhook/pushinpay \
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

## 🎨 Passo 7: Personalizar Domínio (Opcional)

### 7.1 Mudar Nome do Site
1. Vá em **Site configuration** → **Site details**
2. Clique em **Change site name**
3. Escolha um nome: `redflix-oficial.netlify.app`

### 7.2 Adicionar Domínio Próprio
1. Vá em **Domain management**
2. Clique em **Add domain**
3. Digite seu domínio (ex: `redflix.com.br`)
4. Siga as instruções para configurar DNS

---

## 📊 Checklist Final

- [ ] Código enviado para GitHub
- [ ] Site deployado na Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook configurado na PushinPay
- [ ] Teste de pagamento R$ 1,00 realizado
- [ ] Pagamento aprovado e redirecionado
- [ ] Firebase atualizado corretamente
- [ ] Email de confirmação enviado

---

## 🆘 Problemas Comuns

### Build falhou
- Verifique os logs de build
- Certifique-se que `npm run build` funciona localmente
- Verifique se todas as dependências estão no `package.json`

### Webhook não funciona
- Verifique se a URL está correta na PushinPay
- Veja os logs da função na Netlify
- Teste manualmente com curl

### Variáveis de ambiente não funcionam
- Certifique-se que começam com `NEXT_PUBLIC_` (para frontend)
- Faça redeploy após adicionar variáveis
- Verifique se não há espaços extras

### Firebase não conecta
- Verifique se as regras do Firestore permitem escrita
- Confirme que as variáveis estão corretas
- Teste localmente primeiro

---

## 💡 Dicas

1. **Use o plano gratuito**: Netlify oferece 100GB de banda/mês grátis
2. **Monitore uso**: Veja estatísticas em **Analytics**
3. **Ative HTTPS**: Já vem ativado automaticamente
4. **Branch deploys**: Crie branches para testar antes de produção
5. **Rollback**: Pode voltar para versões anteriores facilmente

---

## 🔄 Atualizações Futuras

Quando fizer mudanças no código:

```bash
# Fazer commit
git add .
git commit -m "Descrição da mudança"

# Enviar para GitHub
git push

# A Netlify vai fazer deploy automaticamente! 🚀
```

---

## 📞 Suporte

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Status**: https://www.netlifystatus.com

---

**Pronto! Seu site estará no ar com URL fixa e webhooks funcionando! 🎉**
