# 🏖️ PraiaApp — Sistema de Pedidos para Quiosques de Praia

Sistema completo de pedidos via QR Code para quiosques de praia brasileiros.

## Stack Técnico
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Convex (real-time, serverless)
- **Auth**: Clerk (gestor/superadmin) + PIN 4 dígitos (equipe)
- **Pagamentos**: MercadoPago ou Stripe (configurado por quiosque)
- **Segurança**: Chaves secretas cifradas AES-256-GCM
- **Deploy**: Vercel

---

## URLs do Sistema

```
/{slug}/{parasol}        → Cliente (via QR do guarda-sol)
/login/{slug}            → Login equipe (teclado PIN)
/cozinha/{slug}          → Cozinha (PIN obrigatório)
/garcom/{slug}           → Garçom (PIN obrigatório)
/admin/{slug}            → Gestor (Clerk email)
/superadmin              → Super Admin (Clerk email)
```

---

## Setup — Passo a Passo

### 1. Instalar dependências
```bash
npm install
cp .env.example .env.local
```

### 2. Configurar Convex
```bash
npx convex login
npx convex init          # escolher "Create a new project" → praiapp
```

Copiar a URL (ex: `https://happy-animal-123.convex.cloud`) para `.env.local`

**Adicionar no Convex Dashboard → Settings → Environment Variables:**
```
ENCRYPTION_SECRET=<gerar com: openssl rand -base64 32>
CONVEX_SITE_URL=https://happy-animal-123.convex.site
FRONTEND_URL=https://praiapp.vercel.app
```

### 3. Configurar Clerk
1. Criar conta em [clerk.com](https://clerk.com) → New Application "PraiaApp"
2. API Keys → copiar `Publishable Key` e `Secret Key` para `.env.local`
3. Seu Clerk User ID → adicionar em `VITE_SUPER_ADMIN_ID`

### 4. Rodar em desenvolvimento
```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

### 5. Deploy para produção
```bash
# Build e deploy Convex
npx convex deploy

# Push para GitHub → Vercel redeploya automaticamente
git add . && git commit -m "feat: PraiaApp v1" && git push
```

**Variáveis no Vercel Dashboard:**
```
VITE_CONVEX_URL
VITE_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
VITE_SUPER_ADMIN_ID
ENCRYPTION_SECRET
FRONTEND_URL
```

---

## Configurar Pagamento (por Quiosque)

Cada gestor configura suas próprias credenciais em **Admin → 💳 Pagamento**:

### MercadoPago (recomendado para Brasil)
1. Acessar mercadopago.com.br → Seu negócio → Credenciais
2. Copiar **Public Key** e **Access Token**
3. Colar no painel Admin → aba Pagamento

### Stripe (internacional)
1. Acessar dashboard.stripe.com → Developers → API Keys
2. Copiar **Publishable key** e **Secret key**
3. Colar no painel Admin → aba Pagamento

> As chaves secretas são **criptografadas com AES-256** antes de serem armazenadas. Nunca são expostas ao frontend.

---

## Segurança

| Elemento | Proteção |
|---|---|
| Chave secreta MP/Stripe | AES-256-GCM cifrado em Convex |
| Uso da chave secreta | Apenas em Convex Actions (servidor) |
| Chave pública | Em claro — normal e necessário |
| ENCRYPTION_SECRET | Env var Convex apenas |
| Sessões PIN | Expiram em 8h, limpas por cron |

---

## Fluxo de Pagamento

```
Gestor configura chaves → cifradas AES-256 → Convex
         ↓
Cliente faz pedido → frontend recebe chave PÚBLICA
         ↓
Convex Action (servidor) decifra chave SECRETA
         ↓
Chamada API MercadoPago/Stripe com conta do quiosque
         ↓
Dinheiro vai direto para a conta do quiosque
```

---

## Criar Primeiro Quiosque

1. Acessar `/superadmin` e logar com Clerk
2. Clicar **"+ Criar Novo Quiosque"**
3. Preencher nome, cidade, estado, email do gestor
4. Gestor acessa `/admin/{slug}` e configura pagamento

## Login da Equipe

1. Gestor vai em **Admin → Equipe** e adiciona funcionário com PIN
2. Funcionário acessa `/login/{slug}`
3. Digita PIN → redireciona para cozinha/garçom automaticamente

---

## Custo Estimado (1–5 quiosques)

| Serviço | Custo |
|---|---|
| GitHub | Grátis |
| Vercel | Grátis (até 100GB/mês) |
| Convex | Grátis (até 1M calls/mês) |
| Clerk | Grátis (até 10.000 usuários) |
| MercadoPago | 4,99% por transação |
| Stripe | 2,9% + R$0,30 por transação |

**Total fixo mensal: R$ 0** 🎉
"# quiosquepraiaclaude" 
