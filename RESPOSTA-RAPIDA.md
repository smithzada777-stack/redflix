# ✅ RESPOSTA RÁPIDA: Sim, você precisa configurar as keys!

## 🎯 Resumo Direto

**SIM!** Quando você subir na Netlify, você vai precisar configurar **11 variáveis** (keys) no painel da Netlify.

---

## 📋 As 11 Variáveis que Você Precisa Configurar

### 1-6. Firebase (6 variáveis)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Onde pegar**: Firebase Console → Project settings → Your apps

---

### 7. Firebase Service Account (1 variável) ⚠️ CRÍTICO
- `FIREBASE_SERVICE_ACCOUNT`

**Onde pegar**: Firebase Console → Service accounts → Generate new private key

⚠️ **Esta é a mais importante! Sem ela o webhook NÃO funciona!**

---

### 8-9. PushinPay (2 variáveis)
- `PUSHINPAY_API_KEY`
- `PUSHINPAY_SECRET_KEY`

**Onde pegar**: https://pushinpay.com.br/dashboard → Configurações → API

---

### 10. Resend (1 variável)
- `RESEND_API_KEY`

**Onde pegar**: https://resend.com/api-keys

---

### 11. Ambiente (1 variável)
- `NODE_ENV` = `production`

---

## 🎯 Onde Configurar na Netlify

```
1. Netlify Dashboard
2. Selecione seu site
3. Site configuration (menu lateral)
4. Environment variables
5. Add a variable (para cada uma das 11)
6. Trigger deploy (depois de adicionar todas)
```

---

## 📚 Guias Detalhados Criados para Você

### Para ver a lista completa com exemplos:
📄 **`VARIAVEIS-NETLIFY.md`** - Lista detalhada de todas as 11 variáveis

### Para ver onde clicar (visual):
🖼️ **`GUIA-VISUAL-NETLIFY.md`** - Diagramas mostrando onde clicar

### Para seguir passo a passo:
🚀 **`DEPLOY-RAPIDO.md`** - Guia rápido completo

---

## ✅ Checklist Rápido

- [ ] Configurar o site na Netlify (via GitHub, CLI ou Upload Manual)
- [ ] Deploy inicial (pode dar erro até configurar as variáveis, ok!)
- [ ] Adicionar as 11 variáveis
- [ ] Fazer redeploy
- [ ] Configurar webhook PushinPay
- [ ] Testar com PIX de R$ 1,00

---

## 🎉 Resultado Final

Quando tudo estiver configurado:

✅ Site funcionando em: `https://seu-site.netlify.app`  
✅ Webhook funcionando em: `https://seu-site.netlify.app/api/webhook`  
✅ PIX sendo gerado e pago  
✅ Redirecionamento automático para /success  
✅ Firebase atualizado  
✅ Email enviado  

---

**Próximo passo**: Abra `VARIAVEIS-NETLIFY.md` para ver os detalhes de cada variável! 🚀
