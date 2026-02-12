# RedFlix Ultra Pro - Plataforma de Streaming IPTV

Bem-vindo ao repositório oficial da RedFlix Ultra Pro. Este projeto foi desenvolvido com Next.js 15, Tailwind CSS e integração completa de pagamentos via Pix (PushinPay) e e-mails transacionais (Resend).

## 🚀 Funcionalidades

- **Design Premium & Responsivo:** Interface focada em conversão mobile-first, com animações suaves e glassmorphism.
- **Carrosséis de Conteúdo:** Exibição dinâmica de Filmes, Séries e Esportes.
- **Checkout Integrado:** Fluxo de pagamento simplificado com Timer de urgência e Geração de Pix automática.
- **Status em Tempo Real:** O sistema verifica automaticamente o pagamento e libera o acesso.
- **E-mails Automáticos:** Envio de credenciais de acesso assim que o pagamento é aprovado.

## 🛠️ Tecnologias

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion.
- **Backend (API Routes):** Node.js (via Next.js API), Firebase Admin SDK.
- **Integrações:** PushinPay (Pagamentos), Resend (E-mails).
- **Hospedagem Recomendada:** Vercel ou Netlify.

## 📦 Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/smithzada777-stack/redflix-final.git
    cd redflix-final
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e preencha com suas chaves (use o `.env.example` como base):
    ```env
    # Exemplo:
    FIREBASE_SERVICE_ACCOUNT='{...}'
    PUSHINPAY_TOKEN='seu_token_aqui'
    RESEND_API_KEY='re_123...'
    NEXT_PUBLIC_BASE_URL='http://localhost:3000'
    ```

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Acesse `http://localhost:3000` no seu navegador.

## 🚢 Como Fazer Deploy

### Opção 1: Vercel (Recomendado)
1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Importe este repositório do GitHub.
3.  Nas configurações do projeto, adicione as variáveis de ambiente (`FIREBASE_SERVICE_ACCOUNT`, etc.).
4.  Clique em **Deploy**.

### Opção 2: Netlify
1.  Crie um novo site a partir do Git no Netlify.
2.  Defina o comando de build como `npm run build`.
3.  Defina o diretório de publicação como `.next` ou use o plugin `@netlify/plugin-nextjs`.
4.  Adicione as variáveis de ambiente no painel do Netlify.

## 📝 Estrutura de Pastas

- `src/app`: Páginas e Rotas (App Router).
- `src/components`: Componentes reutilizáveis (UI, Sections).
- `src/lib`: Configurações de serviços (Firebase, Resend).
- `public/assets`: Imagens e ícones estáticos.

## 🔒 Segurança

- Nunca suba o arquivo `.env` ou suas chaves privadas para o GitHub.
- O arquivo `.gitignore` já está configurado para proteger seus dados.

---
Desenvolvido por **SmithZada Stack** e **Antigravity AI**.
