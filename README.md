# 🏛️ Athenaeum — AI-Powered Digital Library System

> **Athenaeum** (*Where Knowledge Finds You*) is a production-grade, full-stack library management system designed around the **"Digital Reading Room"** aesthetic. It pairs a warm paper and midnight-ink visual identity with interactive 3D elements and a grounded AI catalog assistant.

---

## ✨ Highlights & Architecture

- **One Deployable Unit**: Next.js 15 App Router + Server Actions + Drizzle ORM + PostgreSQL on Vercel or any container host with **zero extra servers**.
- **Interactive 3D Bookshelf**: Real-time 3D floating book models built with Three.js (`@react-three/fiber` + `@react-three/drei`), complete with mouse/touch responsiveness and graceful static fallback for low-end devices or reduced motion.
- **Athena, AI Librarian**: Answers reader inquiries, provides literary recommendations, and reasons about themes (e.g., *"books like Atomic Habits but fiction"*). Only recommends titles that genuinely exist in the catalog — **zero hallucinated books**.
- **Provider-Agnostic AI**: Supports OpenAI, Google Gemini, and Anthropic Claude keys from `.env`. When keys are absent, an intelligent built-in catalog engine engages seamlessly with live streaming responses.
- **Robust Circulation Core**: Transaction-locked borrowing (prevents double-borrowing race conditions), automatic overdue fine calculation with grace periods, and reservation hold queues.
- **One-Command Docker Setup**: `docker compose up --build` brings up PostgreSQL (with pgvector) and the Next.js standalone application, automatically runs idempotent migrations, and seeds 40 sample books and 3 demo accounts.
- **Live Runtime Customization**: Change library name, tagline, logo, colors, loan duration, fine rates, and feature flags from the Admin Settings dashboard without editing code.

---

## 🚀 Quick Start with Docker (Recommended)

To run everything (PostgreSQL + App) locally in one command:

```bash
docker compose up --build
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.  
The container automatically runs migrations and seeds the database on first start.

---

## 💻 Local Development Setup (Without Docker)

### Option A: One-Click Setup Script
```bash
./scripts/setup.sh    # macOS / Linux
# or
scripts\setup.bat     # Windows
```

### Option B: Manual Steps
1. **Clone & Install Dependencies**:
   ```bash
   cd library-ai
   npm install --legacy-peer-deps
   ```
2. **Environment Variables**:
   ```bash
   cp .env.example .env
   # Update DATABASE_URL with your local or Neon connection string
   ```
3. **Database Setup**:
   ```bash
   npm run db:push   # Push schema to PostgreSQL
   npm run db:seed   # Seed 40 books and demo accounts
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Accounts

Use these pre-configured accounts to explore the library with different permission roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@demo.com` | `demo1234!` | Full system access, members management, system settings, book CRUD |
| **📚 LIBRARIAN** | `librarian@demo.com` | `demo1234!` | Catalog maintenance, process returns, issue loans, CSV import |
| **👤 MEMBER** | `member@demo.com` | `demo1234!` | Browse catalog, borrow books, place reservations, view fines, AI chat |

> *Note: Change demo passwords or disable demo accounts in production via the Admin console.*

---

## 📂 Project Structure

```text
library-ai/
├── src/
│   ├── app/
│   │   ├── (public)/          # Home, catalog, book detail, login, register, chat, about
│   │   ├── (member)/account/  # Active loans, due dates, reservations, fines
│   │   ├── (admin)/admin/     # Analytics dashboard, books CRUD, members, loans, settings, import
│   │   └── api/               # Health check, books, loans, chat, members, settings
│   ├── components/
│   │   ├── three/             # HeroScene.tsx, BookModel.tsx, SceneFallback.tsx, SceneBoundary.tsx
│   │   ├── books/             # BookCard.tsx, BorrowButton.tsx, RenewButton.tsx
│   │   ├── chat/              # LibrarianChat.tsx
│   │   ├── admin/             # DashboardCharts.tsx, BookCrudManager.tsx, LoansTable.tsx, CsvImporter.tsx
│   │   └── layout/            # Navbar.tsx, Footer.tsx, MobileNav.tsx, ThemeToggle.tsx
│   ├── lib/
│   │   ├── db/                # Drizzle schema, client, queries, seed script (40 books)
│   │   ├── ai/                # Provider detector, embeddings, librarian brain, fallbacks
│   │   ├── auth/              # Auth.js configuration, server-side guards
│   │   ├── validators/        # Zod validation schemas
│   │   └── utils.ts           # Fine calculation, date formatting, sanitization
│   └── config/site.config.ts  # Compile-time defaults
├── tests/
│   ├── unit/                  # Utility, validator, rate-limit, and AI tests
│   ├── integration/           # Auth guards, loan flow & concurrency, CSV validation
│   └── e2e/                   # Playwright end-to-end specifications
├── Dockerfile                 # Multi-stage standalone output runner
├── docker-compose.yml         # App + pgvector Postgres services
└── README.md
```

---

## 🧪 Testing & Verification

Run the comprehensive test and verification suite:

```bash
npm run typecheck    # Strict TypeScript checks
npm run lint         # ESLint verification
npm run test         # Vitest unit & integration tests (59 tests)
npm run build        # Production standalone bundle build
npm run verify       # Runs ALL checks in sequence
```

---

## 📜 License & Acknowledgments

Built with Next.js 15, Drizzle ORM, Three.js, React Three Fiber, Tailwind CSS, and Framer Motion.
