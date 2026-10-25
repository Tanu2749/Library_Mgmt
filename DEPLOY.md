# 🚀 Athenaeum Deployment Guide

This guide walks you step-by-step through deploying Athenaeum to production with zero extra servers.

---

## 📋 Environment Variables Table

| Variable Name | Required? | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` | PostgreSQL connection string (Neon, Supabase, or self-hosted) |
| `NEXTAUTH_SECRET` | **Yes** | `w9Z8x3K...` *(generate with `openssl rand -base64 32`)* | Encryption key for JWT session tokens |
| `NEXTAUTH_URL` | **Yes** | `https://your-library.vercel.app` | Canonical public URL of your deployment |
| `OPENAI_API_KEY` | Optional | `sk-proj-...` | Enables OpenAI GPT-4o and text embeddings |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | `AIzaSy...` | Enables Google Gemini 1.5 Flash |
| `ANTHROPIC_API_KEY` | Optional | `sk-ant-...` | Enables Anthropic Claude 3.5 Sonnet |
| `AI_ENABLED` | Optional | `true` | Explicit master toggle for AI features |
| `THREE_D_ENABLED` | Optional | `true` | Toggle for 3D interactive bookshelf scene |
| `NODE_ENV` | Optional | `production` | Node environment |

> **Note**: AI keys are completely optional! If no key is set, Athenaeum automatically engages its built-in catalog assistant with zero crashes or errors.

---

## Method A: Vercel (Recommended — 100% Serverless)

Vercel provides instant worldwide deployment with zero servers to maintain.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Provision a PostgreSQL Database (Neon)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Storage** → **Create Database** → Select **Neon (Postgres)**.
3. Choose your closest region and name your database (e.g. `athenaeum-db`).
4. Once created, click the **pgvector** toggle or run in Neon SQL console:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Copy the connection string (`POSTGRES_URL` or `DATABASE_URL`).

### Step 3: Deploy Directly from Your Terminal
Run this command from inside the `library-ai` directory (no GitHub repository required):
```bash
npx vercel --prod
```
During the interactive prompt:
- Link to existing project? **No**
- What's your project name? **athenaeum**
- In which directory is your code located? **./**

### Step 4: Set Environment Variables on Vercel
In the Vercel project settings (**Settings** → **Environment Variables**), add:
- `DATABASE_URL`: Your Neon connection string
- `NEXTAUTH_SECRET`: Generate one with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `https://<your-project>.vercel.app`

### Step 5: Run Schema Migration & Seed
Run these commands from your local computer pointing to your production database:
```bash
DATABASE_URL="your-production-neon-url" npm run db:push
DATABASE_URL="your-production-neon-url" npm run db:seed
```

---

## Method B: Netlify Alternative

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Create an account at [Neon.tech](https://neon.tech) and copy your PostgreSQL connection string.
3. Link Netlify:
   ```bash
   netlify init
   ```
4. Set environment variables:
   ```bash
   netlify env:set DATABASE_URL "postgresql://..."
   netlify env:set NEXTAUTH_SECRET "your-secret-32-chars"
   netlify env:set NEXTAUTH_URL "https://your-site.netlify.app"
   ```
5. Deploy:
   ```bash
   netlify deploy --prod --build
   ```

---

## Method C: Docker on Any VPS (DigitalOcean, AWS, Hetzner)

You can run Athenaeum on any Linux server with Docker and Docker Compose installed:

```bash
# 1. Clone or unzip project onto server
cd library-ai

# 2. Copy environment file
cp .env.example .env

# 3. Start PostgreSQL with pgvector and Next.js standalone runner
docker compose up -d --build

# 4. View logs
docker compose logs -f app
```

The container automatically executes the entrypoint script `docker-entrypoint.sh`, running migrations and seeding the database on first boot.

---

## 🛠️ Troubleshooting Guide

| Issue / Error | Probable Cause | Quick Resolution |
| :--- | :--- | :--- |
| `DATABASE_URL is not set` | Missing environment variable | Verify `.env` exists or environment variables are configured in Vercel/Docker. |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running | If using Docker, run `docker compose up db -d`. If using Neon, check connection string. |
| `extension "vector" does not exist` | pgvector extension not enabled | Run `CREATE EXTENSION IF NOT EXISTS vector;` in your PostgreSQL console. |
| `JWT secret error / Decryption failed` | `NEXTAUTH_SECRET` is too short or changed | Provide a persistent string of at least 32 characters for `NEXTAUTH_SECRET`. |
| `3D scene shows static books` | Low GPU or prefers-reduced-motion | Expected behavior: Athenaeum automatically falls back to an accessible CSS bookshelf. |
| `429 Rate Limited` | Exceeded demo request limit | Wait 60 seconds. Rate limiters automatically reset window tokens. |
| `Can't borrow book` | Unpaid fines or copy limit reached | Check member account for active borrowing count or unpaid fees. |
