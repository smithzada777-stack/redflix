# 🔐 Configurar Firebase Service Account na Netlify

## ⚠️ IMPORTANTE
O Firebase Admin SDK precisa de uma **Service Account** para funcionar em produção (Netlify).

---

## 📋 Passo 1: Gerar Service Account no Firebase

### 1.1 Acessar Firebase Console
1. Vá para: https://console.firebase.google.com
2. Selecione seu projeto RedFlix
3. Clique no ⚙️ (engrenagem) → **Project settings**

### 1.2 Gerar Chave Privada
1. Vá na aba **Service accounts**
2. Clique em **Generate new private key**
3. Confirme clicando em **Generate key**
4. Um arquivo JSON será baixado (ex: `redflix-firebase-adminsdk-xxxxx.json`)

⚠️ **NUNCA compartilhe este arquivo! Ele dá acesso total ao seu Firebase!**

---

## 📋 Passo 2: Adicionar na Netlify

### 2.1 Abrir o Arquivo JSON
Abra o arquivo baixado no Notepad. Ele terá este formato:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
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

### 2.2 Copiar TODO o Conteúdo
1. Selecione **TODO** o conteúdo do arquivo (Ctrl+A)
2. Copie (Ctrl+C)

### 2.3 Adicionar na Netlify
1. Vá para o painel da Netlify
2. **Site configuration** → **Environment variables**
3. Clique em **Add a variable**
4. Nome: `FIREBASE_SERVICE_ACCOUNT`
5. Valor: **Cole TODO o JSON** (incluindo as chaves `{}`)
6. Clique em **Save**

### 2.4 Redeploy
1. Vá em **Deploys**
2. **Trigger deploy** → **Deploy site**

---

## ✅ Verificar se Funcionou

### Opção 1: Ver Logs da Netlify
1. Após o deploy, vá em **Functions**
2. Clique em `webhook`
3. Procure por: `[FIREBASE ADMIN] Inicializado com Service Account`

### Opção 2: Fazer Teste Real
1. Gere um PIX de R$ 1,00
2. Pague
3. Se redirecionar para `/success` → ✅ Funcionou!

---

## 🐛 Problemas Comuns

### Erro: "Service Account incompleta"
- Certifique-se que copiou **TODO** o JSON
- Verifique se tem as chaves `{}` no início e fim
- Não adicione espaços extras

### Erro: "Cannot parse JSON"
- O JSON deve estar em uma única linha OU
- Certifique-se que as quebras de linha estão preservadas no `private_key`

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Certifique-se que a Service Account tem permissões

---

## 🔒 Segurança

### ✅ Boas Práticas
- ✅ Mantenha o arquivo JSON em local seguro
- ✅ Nunca commite no GitHub
- ✅ Use variáveis de ambiente
- ✅ Revogue chaves antigas se necessário

### ❌ Nunca Faça
- ❌ Compartilhar o arquivo JSON
- ❌ Commitar no Git
- ❌ Deixar em pastas públicas
- ❌ Enviar por email/WhatsApp

---

## 🔄 Revogar/Regenerar Chave

Se a chave vazar:
1. Firebase Console → **Service accounts**
2. Clique em **Manage service account permissions**
3. Encontre a conta → **Delete**
4. Gere uma nova chave
5. Atualize na Netlify

---

## 📝 Resumo

1. ✅ Gerar Service Account no Firebase
2. ✅ Copiar TODO o JSON
3. ✅ Adicionar `FIREBASE_SERVICE_ACCOUNT` na Netlify
4. ✅ Redeploy
5. ✅ Testar pagamento

**Pronto! O webhook vai conseguir gravar no Firebase! 🎉**
