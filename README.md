# 🏛️ Athenaeum — Modern AI-Powered Digital Library System

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.38-C5F74F?style=flat)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169e1?style=flat&logo=postgresql)](https://neon.tech/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=flat&logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4_Alpha-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel_Production-brightgreen?style=flat&logo=vercel)](https://librarymgmt-ochre.vercel.app)

> **Athenaeum** (*Where Knowledge Finds You*) is a full-stack, enterprise-grade digital library management system. Built with Next.js 15, Drizzle ORM, Neon PostgreSQL, and WebGL 3D graphics, it pairs the warmth of an archival "Digital Reading Room" with modern AI-grounded catalog discovery and real-time circulation rules.

---

## 🌐 Live Production Deployment

- **Production Application**: [https://librarymgmt-ochre.vercel.app](https://librarymgmt-ochre.vercel.app)
- **Database Status**: Neon Serverless PostgreSQL with pgvector extension (online & pooled)
- **Comprehensive Technical Guide**: [SYSTEM_GUIDE.md](file:///Users/adiii/Desktop/Library_mgmt_system/library-ai/SYSTEM_GUIDE.md)

---

## ✨ Core Features & Highlights

- **Interactive 3D Bookshelf**: Real-time floating hardcover 3D book models built with Three.js (`@react-three/fiber` + `@react-three/drei`). Features procedural canvas rendering with embossed gold lettering, spine ribs, and vector emblems, plus accessible fallback for reduced-motion or low-end hardware.
- **Athena, AI Reading Room Librarian**: Built-in intelligent conversational librarian. Reasons about themes, genres, and cross-genre recommendations with **zero hallucinated books** (grounded in the active database catalog). Supports streaming responses (SSE) and optional cloud LLM providers (OpenAI GPT-4o, Google Gemini, Anthropic Claude).
- **Concurrency-Safe Circulation Core**: Atomic PostgreSQL transactions ensure zero race conditions or double-borrowing. Enforces member loan limits, overdue fine calculations with customizable grace periods, and automatic reservation hold queues.
- **Full Role-Based Access Control (RBAC)**: Secure multi-tier authentication via JWT with protected routes (`/account` for members, `/admin` for staff and librarians).
- **Live Runtime Customization**: Modify library branding, loan periods, renewal limits, fine rates, and feature toggles directly from the Admin Settings dashboard without redeploying code.
- **Bulk CSV Ingestion**: Import library catalogs via CSV with automated ISBN validation, duplicate detection, and relational author/genre tagging.

---

## 🔑 Demo Access Credentials

The database is pre-seeded with 3 accounts spanning all permission tiers:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@demo.com` | `demo1234!` | Full system control, member role management, book CRUD, CSV imports, live circulation settings |
| **📚 LIBRARIAN** | `librarian@demo.com` | `demo1234!` | Catalog management, book additions, loan processing, return reconciliation, fine reviews |
| **👤 MEMBER** | `member@demo.com` | `demo1234!` | Book borrowing, reservations, loan history, fine payments, AI Librarian chat |

---

## 📖 Deep-Dive Architecture Guide

For a thorough file-by-file, folder-by-folder walkthrough explaining how every feature works under the hood (data flow, database queries, 3D rendering pipeline, AI grounding, and testing), see:

👉 **[SYSTEM_GUIDE.md](file:///Users/adiii/Desktop/Library_mgmt_system/library-ai/SYSTEM_GUIDE.md)**

---

## 🚀 Getting Started

### Option 1: Docker (Fastest Local Setup)

Run PostgreSQL with pgvector and the Next.js standalone runner in a single command:

```bash
docker compose up --build
```

Access the application at [http://localhost:3000](http://localhost:3000). The container automatically applies schema migrations and seeds initial records on first start.

---

### Option 2: Local Development with Neon / Local PostgreSQL

#### 1. Clone & Install Dependencies
```bash
git clone git@github.com:Tanu2749/Library_Mgmt.git
cd Library_Mgmt/library-ai
npm install --legacy-peer-deps
```

#### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Fill in your database URL and authentication secret:
```env
DATABASE_URL="postgresql://user:password@ep-...neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@ep-...neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### 3. Initialize & Seed Database
```bash
# Push schema tables and relations
npm run db:push

# Seed 39 books, 16 genres, 30 authors, and demo accounts
npm run db:seed
```

#### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Code Quality

The repository includes a comprehensive testing suite spanning unit, integration, and live database tests:

```bash
# 1. Type verification
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit and integration tests (Vitest - 59 test cases)
npm run test

# 4. Production build verification
npm run build

# 5. Full automated check pipeline
npm run verify

# 6. End-to-end Neon DB audit script (verifies registration, catalog, borrowing, and returns)
npx tsx -r dotenv/config scripts/qa-audit.ts
```

---

## 📂 Project Directory Structure

```text
library-ai/
├── drizzle/                    # Generated SQL migrations and schema meta
├── public/                     # Static media, icons, and assets
├── scripts/
│   ├── enable-vector.ts        # Enables PostgreSQL pgvector extension
│   ├── qa-audit.ts             # 7-stage live database QA verification suite
│   ├── update-covers.ts        # Syncs high-resolution book covers from Open Library
│   ├── setup.sh / setup.bat    # Automated environment setup scripts
│   └── pack-zip.sh             # Release distribution archiver
├── src/
│   ├── app/
│   │   ├── (admin)/admin/      # Staff console (dashboard, books CRUD, members, loans, settings)
│   │   ├── (member)/account/   # Reader portal (active loans, due dates, holds, unpaid fines)
│   │   ├── (public)/           # Landing page, catalog, book detail, AI chat, about, auth
│   │   ├── api/                # REST endpoints (/books, /loans, /chat, /members, /settings, /health)
│   │   ├── layout.tsx          # Root HTML layout with providers and fonts
│   │   └── not-found.tsx       # Archival 404 error page
│   ├── components/
│   │   ├── admin/              # Dashboard charts, book editor, loans table, CSV importer
│   │   ├── books/              # BookCard, BorrowButton, RenewButton
│   │   ├── chat/               # LibrarianChat streaming component
│   │   ├── layout/             # Navbar, Footer, MobileNav, ThemeToggle
│   │   ├── providers/          # NextAuth and React query session providers
│   │   └── three/              # BookModel (3D procedural textures), HeroScene, Fallbacks
│   ├── config/
│   │   └── site.config.ts      # Theme color tokens, loan rules, and site metadata
│   ├── lib/
│   │   ├── ai/                 # Athena librarian brain, embeddings, provider detector
│   │   ├── auth/               # NextAuth JWT config, server-side auth guards
│   │   ├── db/                 # Drizzle schema, Neon client, queries, seeders
│   │   ├── validators/         # Zod schemas for input validation
│   │   ├── errors.ts           # Standardized application error handlers
│   │   ├── rate-limit.ts       # In-memory IP rate limiter
│   │   └── utils.ts            # Currency, fine calculations, date math
│   ├── middleware.ts           # Edge security guard for /account and /admin routes
│   └── styles/globals.css      # Archival paper & midnight ink color themes
├── tests/                      # Vitest unit and integration test suites
├── Dockerfile                  # Production multi-stage Docker container
├── docker-compose.yml          # Container configuration with PostgreSQL + pgvector
├── drizzle.config.ts           # Drizzle Kit migration configuration
├── next.config.ts              # Next.js configuration (standalone output, remote images)
├── SYSTEM_GUIDE.md             # Complete architecture and file-by-file reference guide
└── README.md                   # This documentation
```

---

## 🛠️ Environment Configuration Reference

| Variable Name | Required? | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-...neon.tech/neondb` | Pooled connection for Next.js API and queries |
| `DATABASE_URL_UNPOOLED` | Optional | `postgresql://user:pass@ep-...neon.tech/neondb` | Direct unpooled connection for schema pushes/migrations |
| `NEXTAUTH_SECRET` | **Yes** | `32+ character random string` | Secret used to sign and encrypt session JWTs |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` or production URL | Base URL for authentication redirects |
| `OPENAI_API_KEY` | Optional | `sk-proj-...` | Enables OpenAI GPT-4o embeddings and inference |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | `AIzaSy...` | Enables Google Gemini 1.5 Flash |
| `ANTHROPIC_API_KEY` | Optional | `sk-ant-...` | Enables Anthropic Claude 3.5 Sonnet |
| `AI_ENABLED` | Optional | `true` | Master toggle for AI assistant features |
| `THREE_D_ENABLED` | Optional | `true` | Master toggle for 3D interactive hero bookshelf |

*Note: If no external AI API key is provided, Athenaeum automatically engages its built-in catalog grounding engine with zero errors or disruption.*

---

## 📄 License & Attribution

Designed and developed for modern digital library environments. Built using Next.js, Three.js, Drizzle ORM, and Neon PostgreSQL.
