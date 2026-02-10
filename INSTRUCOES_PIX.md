# 🚀 Manual de Integração PIX Definitivo (PushinPay + Firebase + Netlify)

Este guia foi criado após a implementação real para garantir que novos projetos sejam configurados sem erros. **Salve este arquivo e me envie (ou para outra IA) no início de qualquer novo projeto de PIX.**

---

## 🛠️ 1. O que foi feito (A Lógica)
O sistema não fica "perguntando" para a API se o PIX foi pago (isso dá erro 404 às vezes). Ele usa **Webhooks**:
1. O site gera o PIX e começa a "ouvir" o Firebase em tempo real.
2. Quando o cliente paga, a **PushinPay** avisa nosso servidor automaticamente.
3. Nosso servidor salva no Firebase: **"Pagamento OK"**.
4. O site percebe a mudança instantaneamente e libera a tela de sucesso.

---

## ⚙️ 2. Configurações Obrigatórias (Onde você mexe)

### No Painel da Netlify (Environment Variables)
Vá em `Site Configuration` > `Environment variables` e adicione exatamente estes nomes:

1.  `VITE_PUSHINPAY_TOKEN`: Seu token de API da PushinPay.
2.  `PUSHINPAY_WEBHOOK_TOKEN`: O token que você gerou na aba "Webhooks" da PushinPay.
3.  `VITE_ADMIN_PASSWORD`: A senha que você quer para o painel de administrador.

### No Painel da PushinPay (Configurações)
Vá na aba **Webhooks**:
1.  **URL do Webhook:** Cole seu link da Netlify com o final: `https://seu-site.netlify.app/.netlify/functions/webhook`
2.  **Token de Segurança:** Gere um token lá, copie e salve na Netlify (passo anterior).

### No Painel do Firebase (Firestore Rules)
Vá em `Firestore Database` > `Rules` e cole isto para permitir que o site detecte o pagamento:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{document=**} { allow read, write: if true; }
    match /payments/{document=**} { allow read, write: if true; }
  }
}
```

---

## ⚠️ 3. Segredos para NÃO dar erro (Regras de Ouro)

1.  **O Segredo do ID (Case Sensitive):** 
    - A PushinPay envia o ID assim: `A103-BC...` (Maiúsculo).
    - O Firebase entende que `A` é diferente de `a`.
    - **SOLUÇÃO:** O código deve sempre usar `.toLowerCase()` (minúsculo) tanto ao salvar no banco quanto ao ler no site.

2.  **O Segredo do Formato (URL-Encoded):**
    - A PushinPay NÃO envia JSON. Ela envia os dados como um formulário (`x-www-form-urlencoded`).
    - **SOLUÇÃO:** O código do servidor usa `querystring.parse` para ler os dados corretamente.

3.  **Dependências:** 
    - Sempre deve existir um `package.json` na raiz do projeto contendo `axios`, `firebase` e `firebase-admin` (ou usar a API REST para ser mais leve).

---

## 📝 4. Passo a Passo para um Novo Projeto
Se quiser que eu faça isso de novo em outro site, me mande este texto e peça para seguir estes passos:

1.  **Criar a pasta `netlify/functions`** com os arquivos `pix.js` e `webhook.js`.
2.  **Configurar o `checkout.js`** com o `onSnapshot` do Firebase para ouvir a coleção `payments`.
3.  **Garantir o Lowercase:** Converter todos os IDs de transação para letras minúsculas.
4.  **Configurar Webhook:** Usar a lógica de `querystring` para receber o aviso da PushinPay.
5.  **Ajustar Regras do Firebase:** Garantir que o site tenha permissão de leitura na coleção de pagamentos.

---
**Guia validado e funcionando em 06/02/2026.** 🚀
