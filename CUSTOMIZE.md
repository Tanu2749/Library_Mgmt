# 🎨 Customization Guide for Athenaeum

Athenaeum was architected from the ground up to be customized without editing code.

---

## 1. Zero-Code Customization (Admin Settings Console)

Log in with an `ADMIN` account (`admin@demo.com`) and navigate to **`/admin/settings`**.  
The following parameters can be updated live with instant persistence to the database:

### Branding & Identity
- **Library Name**: Updates the navbar brand, page titles, footer, and AI librarian greeting.
- **Tagline / Motto**: Appears on the home page hero and metadata.
- **Logo URL**: Link to your institution's custom SVG or PNG logo.

### Circulation & Lending Rules
- **Loan Period (Days)**: Standard checkout window (default: 14 days).
- **Max Books Per Member**: Simultaneous active borrowings permitted per reader (default: 5).
- **Max Renewals**: Maximum consecutive extensions before book must be returned (default: 2).
- **Overdue Fine / Day ($)**: Daily fee assessed after due date (default: $1.00).
- **Grace Period (Days)**: Leniency days allowed after due date before fines begin (default: 1 day).

### Feature Flags
- **AI Features**: Toggle Athena AI chat and semantic search on/off.
- **3D Interactive Scene**: Toggle Three.js 3D hero on/off.
- **Member Registration**: Open or close public self-registration.

---

## 2. Compile-Time Configuration (`src/config/site.config.ts`)

For white-label distributions, compile-time defaults can be modified in `src/config/site.config.ts`:

```typescript
export const siteConfig = {
  name: "Alexandria Public Library",
  tagline: "Preserving the World's Stories",
  description: "A community library with modern AI search.",
  
  // Theme palette (HSL values)
  colors: {
    primary: "24 70% 45%",      // Warm amber-brown
    accent: "16 80% 55%",       // Vibrant terracotta
    background: "40 25% 97%",   // Warm paper tone
    dark: {
      background: "222 30% 8%", // Midnight ink
      primary: "28 75% 55%",
    }
  },

  rules: {
    loanPeriodDays: 21,
    maxBooksPerMember: 10,
    finePerDay: 0.50,
  }
};
```

---

## 3. Styling & Color Palette (`src/styles/globals.css`)

All colors in Athenaeum use CSS variables in HSL format. This allows seamless transitions between Light ("Warm Paper") and Dark ("Midnight Ink") modes:

- `--background`: Base surface color (`40 25% 97%` for warm paper tone)
- `--foreground`: Deep ink text color
- `--primary`: Main brand accent for primary buttons and badges
- `--accent`: Secondary vibrant terracotta accent for AI and callouts
- `--glass-bg`: Glassmorphic backdrop blur color for navbars and modals

---

## 4. Bulk Adding Books via CSV

Navigate to **`/admin/import`** to upload your inventory spreadsheet.
Column headers recognized:
```csv
title,author,genre,isbn,publishedYear,totalCopies,description
"Clean Code","Robert C. Martin","Technology","9780132350884",2008,3,"A handbook of agile software craftsmanship."
```
Authors and genres are automatically detected, de-duplicated, and indexed into the relational tables.
