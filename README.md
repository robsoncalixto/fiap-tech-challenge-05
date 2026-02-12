# Arch Vision

Aplicacao web que realiza analise de ameacas (STRIDE) em diagramas de arquitetura usando IA. O usuario faz upload de um diagrama, escolhe o modelo de IA e recebe um relatorio detalhado com vulnerabilidades categorizadas por severidade.

## Tech Stack

- **Next.js 16** / React 19 / TypeScript
- **Supabase** — autenticacao (GitHub OAuth), banco de dados e storage
- **OpenRouter** — acesso a modelos de IA (Gemini, Claude, GPT-4)
- **Stripe** — assinaturas e pagamentos
- **Tailwind CSS 4** — estilizacao

## Pre-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Chave de API do [OpenRouter](https://openrouter.ai)
- Conta no [Stripe](https://stripe.com) (para funcionalidades de pagamento)

## Setup

```bash
# Clone o repositorio
git clone <repo-url>
cd arch-vision-app

# Instale as dependencias
npm install

# Configure as variaveis de ambiente
cp .env.local.example .env.local
```

Preencha o `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

## Executando

```bash
# Desenvolvimento
npm run dev

# Build de producao
npm run build
npm start

# Lint
npm run lint
```

A aplicacao estara disponivel em `http://localhost:3000`.

## Funcionalidades

- **Upload de diagramas** — PNG, JPG ou SVG de arquiteturas de sistema
- **Analise STRIDE** — identificacao de Spoofing, Tampering, Repudiation, Information Disclosure, DoS e Elevation of Privilege
- **Multiplos modelos de IA** — selecao entre Gemini, Claude e GPT-4 (conforme plano)
- **Relatorios exportaveis** — visualizacao em markdown com export para PDF
- **Sistema de creditos** — plano Starter (gratuito, 1 credito/mes) e Pro (R$49/mes, 5 creditos/mes)
- **Dark mode** — tema claro/escuro com persistencia
