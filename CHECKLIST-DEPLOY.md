# ✅ Checklist de Deploy - RedFlix na Netlify

## 📦 Preparação Local
- [ ] Projeto funcionando em `localhost:3000`
- [ ] Arquivo `.env` com todas as variáveis
- [ ] Git instalado no computador
- [ ] Conta no GitHub criada
- [ ] Conta na Netlify criada

---

## 🔧 Configuração do Firebase
- [ ] Firebase Service Account gerada
- [ ] Arquivo JSON baixado e guardado em local seguro
- [ ] Conteúdo do JSON copiado (para usar depois)

---

## 📤 Enviar para GitHub
- [ ] Repositório criado no GitHub (`redflix`)
- [ ] Comandos git executados:
  - [ ] `git init`
  - [ ] `git add .`
  - [ ] `git commit -m "Deploy inicial"`
  - [ ] `git remote add origin ...`
  - [ ] `git push -u origin main`
- [ ] Código aparecendo no GitHub

---

## 🚀 Deploy na Netlify
- [ ] Site importado do GitHub
- [ ] Primeiro deploy concluído (pode ter erros, ok!)
- [ ] URL da Netlify copiada (ex: `https://xxx.netlify.app`)

---

## 🔐 Variáveis de Ambiente na Netlify
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `PUSHINPAY_API_KEY`
- [ ] `PUSHINPAY_SECRET_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `NODE_ENV` = `production`
- [ ] ⚠️ **CRÍTICO**: `FIREBASE_SERVICE_ACCOUNT` (JSON completo)

---

## 🔄 Redeploy
- [ ] Trigger deploy executado após adicionar variáveis
- [ ] Deploy concluído com sucesso (sem erros)
- [ ] Site abrindo no navegador

---

## 🔗 Configurar Webhook PushinPay
- [ ] Painel PushinPay acessado
- [ ] Webhook URL configurada: `https://seu-site.netlify.app/api/webhook`
- [ ] Eventos selecionados:
  - [ ] `payment.approved`
  - [ ] `payment.cancelled`
- [ ] Webhook salvo

---

## 🧪 Teste Final
- [ ] Site acessível pela URL da Netlify
- [ ] Página de checkout carregando
- [ ] PIX gerado com sucesso (teste R$ 1,00)
- [ ] QR Code aparecendo
- [ ] Pagamento realizado
- [ ] ⏳ Aguardou 5-10 segundos
- [ ] ✅ Redirecionou para `/success` automaticamente
- [ ] Firebase atualizado (verificar no console)
- [ ] Email de confirmação recebido

---

## 🎉 Sucesso!
- [ ] Tudo funcionando perfeitamente
- [ ] Webhook recebendo pagamentos
- [ ] Sistema em produção

---

## 📝 Anotações

**URL do Site**: ___________________________________

**Data do Deploy**: ___________________________________

**Problemas Encontrados**:
- 
- 
- 

**Soluções Aplicadas**:
- 
- 
- 

---

## 🆘 Se Algo Deu Errado

### Build falhou
→ Ver logs de build na Netlify
→ Testar `npm run build` localmente

### Webhook não funciona
→ Verificar logs em Functions na Netlify
→ Confirmar `FIREBASE_SERVICE_ACCOUNT` está configurada
→ Testar manualmente com curl

### Variáveis não funcionam
→ Verificar se começam com `NEXT_PUBLIC_` (frontend)
→ Redeploy após adicionar variáveis
→ Verificar se não há espaços extras

### Firebase não conecta
→ Verificar regras do Firestore
→ Confirmar Service Account está correta
→ Ver logs da função webhook

---

## 📚 Documentação de Referência
- `DEPLOY-RAPIDO.md` - Comandos rápidos
- `DEPLOY-NETLIFY.md` - Guia completo
- `FIREBASE-SERVICE-ACCOUNT.md` - Configuração Firebase
- `TESTE-PIX-REAL.md` - Alternativas de teste

---

**Última atualização**: 10/02/2026
