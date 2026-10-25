/**
 * Athenaeum — Site Configuration
 *
 * Change values here to customize the library.
 * These are compile-time defaults; runtime overrides come from the DB settings table.
 */

export const siteConfig = {
  /** Library branding */
  name: "Athenaeum",
  tagline: "Where Knowledge Finds You",
  description:
    "A modern, AI-powered library management system for the digital age.",
  logoUrl: "/logo.svg",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  /** Theme colors (HSL values without hsl() wrapper) */
  colors: {
    primary: "24 70% 45%", // warm amber-brown
    primaryForeground: "40 30% 98%",
    accent: "16 80% 55%", // vibrant terracotta
    accentForeground: "40 30% 98%",
    background: "40 25% 97%", // warm paper
    foreground: "24 15% 12%",
    muted: "35 15% 92%",
    mutedForeground: "24 10% 45%",
    card: "40 20% 99%",
    cardForeground: "24 15% 12%",
    border: "35 15% 88%",
    destructive: "0 72% 51%",
    destructiveForeground: "0 0% 98%",

    // Dark mode
    dark: {
      background: "222 30% 8%", // midnight ink
      foreground: "40 15% 92%",
      card: "222 25% 12%",
      cardForeground: "40 15% 92%",
      muted: "222 20% 16%",
      mutedForeground: "40 10% 55%",
      border: "222 20% 18%",
      primary: "28 75% 55%",
      primaryForeground: "222 30% 8%",
      accent: "16 80% 60%",
      accentForeground: "222 30% 8%",
    },
  },

  /** Typography */
  fonts: {
    heading: "Playfair Display", // serif display
    body: "Inter", // clean sans
  },

  /** Feature flags */
  features: {
    aiEnabled: true, // Will be runtime-checked against API key availability
    threeDEnabled: true,
    registrationOpen: true,
  },

  /** Loan / fine rules (overridable from Admin Settings) */
  rules: {
    loanPeriodDays: 14,
    maxBooksPerMember: 5,
    maxRenewals: 2,
    finePerDay: 1.0, // in dollars
    fineCurrency: "USD",
    gracePeriodDays: 1,
    reservationHoldDays: 3,
  },

  /** Demo accounts (created by seed; show a notice to change passwords) */
  demo: {
    password: "demo1234!",
    accounts: [
      { email: "admin@demo.com", role: "ADMIN" as const },
      { email: "librarian@demo.com", role: "LIBRARIAN" as const },
      { email: "member@demo.com", role: "MEMBER" as const },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
