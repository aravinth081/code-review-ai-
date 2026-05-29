# CodeGuard AI — Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL + Redis)
- An AI provider API key (OpenAI, Anthropic, or Google Gemini)

### Quick Start

```bash
# 1. Navigate to project
cd "d:\code review\codeguard-ai"

# 2. Start database + Redis (Docker required)
docker-compose up postgres redis -d

# 3. Copy and configure environment
copy .env.example .env.local
# Edit .env.local with your API keys

# 4. Push database schema
npm run db:push

# 5. Seed with demo data
npm run db:seed

# 6. Start dev server
npm run dev
```

**Open**: http://localhost:3000

**Demo Credentials**:
- Admin: `admin@codeguard.ai` / `Admin123!`
- User: `demo@codeguard.ai` / `Demo123!`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `JWT_SECRET` | ✅ | Long random string for JWT signing |
| `JWT_REFRESH_SECRET` | ✅ | Different long random string |
| `AI_PROVIDER` | ✅ | `openai`, `anthropic`, or `gemini` |
| `OPENAI_API_KEY` | Conditional | Required if using OpenAI |
| `ANTHROPIC_API_KEY` | Conditional | Required if using Anthropic |
| `GEMINI_API_KEY` | Conditional | Required if using Gemini |
| `GITHUB_CLIENT_ID` | Optional | For GitHub OAuth |
| `GOOGLE_CLIENT_ID` | Optional | For Google OAuth |
| `STRIPE_SECRET_KEY` | Optional | For subscription payments |

---

## Production Deployment

### Option A: Vercel + Supabase (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Set environment variables in Vercel dashboard
# Use Supabase for PostgreSQL, Upstash for Redis
```

### Option B: Railway

```bash
# Push to GitHub, then connect to Railway
# Railway auto-detects Next.js and deploys
# Add PostgreSQL and Redis services in Railway dashboard
```

### Option C: Docker (Self-hosted)

```bash
# Build and run everything
docker-compose up --build -d

# Push schema to database
docker exec codeguard_app npm run db:push
docker exec codeguard_app npm run db:seed
```

---

## Database Management

```bash
# Push schema changes (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

---

## Project Structure

```
d:\code review\codeguard-ai\
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── reviews/        # Code review CRUD
│   │   │   ├── repositories/   # GitHub repos (Phase 2)
│   │   │   ├── teams/          # Team workspaces (Phase 2)
│   │   │   ├── reports/        # PDF reports (Phase 2)
│   │   │   ├── analytics/      # Analytics (Phase 2)
│   │   │   ├── notifications/  # Notifications (Phase 2)
│   │   │   └── settings/       # User settings
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── reviews/        # Review CRUD + AI analysis
│   │   │   ├── dashboard/      # Dashboard stats
│   │   │   └── health/         # Health check
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── landing/            # Hero, Features, Pricing, CTA
│   │   ├── layout/             # Sidebar, TopBar, Footer
│   │   ├── auth/               # Login/Register forms
│   │   ├── dashboard/          # Dashboard widgets
│   │   └── providers/          # Theme provider
│   ├── lib/
│   │   ├── ai/                 # AI engine + providers
│   │   ├── auth.ts             # JWT utilities
│   │   ├── prisma.ts           # Database client
│   │   ├── redis.ts            # Cache client
│   │   ├── rate-limiter.ts     # Rate limiting
│   │   └── validators.ts       # Zod schemas
│   ├── stores/
│   │   └── auth-store.ts       # Zustand auth state
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── docker-compose.yml          # Local dev containers
├── Dockerfile                  # Production container
└── .env.example                # Environment template
```

---

## AI Configuration

CodeGuard AI supports three LLM providers with automatic fallback:

1. **OpenAI** (default) — GPT-4o, most reliable
2. **Anthropic** — Claude 3.5 Sonnet, excellent for code
3. **Google Gemini** — Gemini 1.5 Pro, cost-effective

Set `AI_PROVIDER` to your preferred provider. If that provider fails, it automatically tries the others (in order of configuration).

For development without API keys, a **mock analyzer** is used that returns sample results.

---

## Phase 2 Roadmap

- [ ] GitHub OAuth integration
- [ ] Repository scanning
- [ ] Team workspaces with RBAC
- [ ] Stripe subscription integration
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Full admin panel
- [ ] Advanced analytics with Recharts
