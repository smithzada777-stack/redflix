# 🎬 RedFlix Ultra Pro - Especificação Técnica (Master Prompt)

---

## 🚀 Contexto & Missão
Você é um Engenheiro de Software Sênior especializado em Next.js e Conversão de Vendas. Sua missão é reconstruir do zero, em um ambiente virgem, a plataforma de vendas de IPTV **RedFlix**.
Não use nada de projetos antigos. Comece com uma mentalidade limpa.

**Objetivo ÚNICO:** Uma Landing Page de alta conversão que leva a um Checkout de Pix, que ao detectar o pagamento libera a tela de sucesso, atualiza o status para "Aprovado" e envia as credenciais de acesso por E-mail imediatamente.

---

## 🎨 Design System (Não Negociável)
O visual deve ser **Premium, Cinematográfico e Agressivo**. Inspirado na Netflix, mas focado em vendas.
*   **Cores Primárias:**
    *   Fundo: `#050505` (Preto Profundo)
    *   Destaque: `#E50914` (Vermelho Netflix)
    *   Texto: `#FFFFFF` (Branco Puro) e `#B3B3B3` (Cinza Suave)
    *   Sucesso: `#22c55e` (Verde Venda)
*   **Tipografia:** Fonte `Outfit` (Google Fonts) para modernidade e legibilidade.
*   **Efeitos:** Glassmorphism (vidro fosco), Sombras suaves em botões (`shadow-red-500/50`), Animações sutis (Framer Motion) em *fade-in* e *hover*.
*   **Responsividade:** Mobile-First. Tudo deve ficar perfeito no celular.

---

## 🛠️ Stack Tecnológica (Simplicidade & Performance)
*   **Framework:** Next.js 15 (App Router).
*   **Estilização:** Tailwind CSS + Lucide React (Ícones).
*   **Banco de Dados:** Firebase Firestore (Apenas para salvar Leads e Status de Vendas).
*   **Pagamentos:** API PushinPay (Geração de Pix e Consulta de Status).
*   **E-mails:** Resend (Disparo Transacional).
*   **Deploy:** Netlify (Arrastar pasta `out` ou Deploy manual via CLI). **ZERO GITHUB.**

---

## ⚡ Fluxo do Usuário (Jornada de Compra)

1.  **Landing Page (Hero & Venda):**
    *   Headline impactante: *"Liberdade para Assistir Tudo. Sem Travamentos."*
    *   Vídeo/Imagem de fundo cinemática.
    *   Botão de CTA flutuante: "QUERO TESTAR AGORA" (Leva ao Checkout).
    *   Carrossel de Filmes/Séries (Cartazes verticais, efeito "Netflix").
    *   Prova Social: Depoimentos de clientes felizes.
    *   FAQ (Perguntas Frequentes) estilo sanfona.
    *   Rodapé com Links de Suporte e Termos.

2.  **Checkout (Conversão):**
    *   **Simples e Direto:** Pede apenas E-mail e WhatsApp.
    *   **Oferta:** Resumo do plano escolhido (Mensal, Trimestral, Anual).
    *   **Gatilho de Urgência:** Timer de **10 Minutos** regredindo no topo.
    *   **Pagamento:** Botão "GERAR PIX AGORA".

3.  **Tela de Pix (Açāo):**
    *   Mostra QR Code grande e legível.
    *   Botão "COPIA E COLA" enorme.
    *   Instrução: *"Abra seu banco e pague agora."*
    *   **Polling Inteligente:** O site consulta a API a cada 3 segundos: *"Já pagou?"*
    *   **Sem Webhook:** O próprio frontend detecta o pagamento e avisa o backend.

4.  **Sucesso (Pós-Venda):**
    *   Explosão de confetes (animação).
    *   Mensagem: *"Parabéns! Seu acesso foi liberado."*
    *   Botão Verde: "FALAR COM SUPORTE VIP" (Link para WhatsApp: `wa.me/5571991644164` com mensagem pronta).
    *   Aviso: *"Verifique seu e-mail agora."*

---

## ⚙️ Regras de Negócio (Backend Simplificado)

1.  **Geração de Pix (API PushinPay):**
    *   Criar rota `/api/payment`.
    *   Recebe valor e dados do cliente.
    *   Chama PushinPay para gerar QR Code.
    *   Salva o `transactionId` no Firebase com status `pending`.

2.  **Verificação de Status (Polling):**
    *   Criar rota `/api/check-status?id=XXX`.
    *   Consulta a API da PushinPay pelo ID.
    *   Se status for `paid`:
        *   **Atualiza Firebase:** Marca Lead como `approved`.
        *   **Dispara E-mail:** Envia credenciais via Resend.
        *   **Retorna:** `{ paid: true }` para o Frontend liberar a tela.

3.  **E-mail Transacional (Resend):**
    *   **Assunto:** "🚀 ACESSO LIBERADO - RedFlix VIP"
    *   **Corpo:** HTML bonito, com logo, boas-vindas e botão de suporte.
    *   **Remetente:** Usar domínio verificado (ex: `suporte@mail.redflixoficial.site` ou `onboarding@resend.dev` para testes).

---

## 🔒 Variáveis de Ambiente Necessárias (Netlify)
O sistema DEVE ler estas variáveis para funcionar. Sem elas, nada acontece.

```env
# Configurações do Firebase (JSON da Conta de Serviço)
FIREBASE_SERVICE_ACCOUNT='{...json_conteudo...}'

# Token da API de Pagamento (PushinPay)
PUSHINPAY_TOKEN='SEU_TOKEN_AQUI'

# Chave de API de E-mail (Resend)
RESEND_API_KEY='re_123456789'

# URL Base do Site (Para links nos e-mails)
NEXT_PUBLIC_BASE_URL='https://redflixoficial.site'
```

---

## 🚨 Instruções para o Desenvolvedor (IA):
1.  **Não use GitHub.** O deploy será manual (drag-and-drop no Netlify).
2.  **Não crie Dashboard complexo.** O foco é a venda e o e-mail. O status `approved` no Firebase é suficiente para controle interno.
3.  **Use `next.config.js` padrão.** Não use `output: export` pois precisamos de API Routes (Node.js) para processar o pagamento e esconder as chaves de API.
4.  **Priorize a Robustez.** Se a API de e-mail falhar, o cliente ainda deve ver a tela de sucesso. O erro deve ser logado, mas não deve travar a venda.

**FIM DAS ESPECIFICAÇÕES.**
Comece a codar agora, criando a estrutura de pastas limpa.
