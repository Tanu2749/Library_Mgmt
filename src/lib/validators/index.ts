import { z } from "zod";

// ─── User Schemas ───

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .transform((v) => v.trim()),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("Invalid email address").max(255)
  ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z0-9!@#$%^&*])/,
      "Password must contain at least one lowercase letter and one uppercase letter, number, or special character"
    ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("Invalid email address")
  ),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .transform((v) => v.trim())
    .optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d\s()-]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

// ─── Book Schemas ───

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(500).transform((v) => v.trim()),
  subtitle: z.string().max(500).optional(),
  isbn: z
    .string()
    .regex(/^\d{10}(\d{3})?$/, "ISBN must be 10 or 13 digits")
    .optional()
    .or(z.literal("")),
  description: z.string().max(5000).optional(),
  coverUrl: z.string().url("Invalid cover URL").optional().or(z.literal("")),
  language: z.string().min(1).max(50).default("English"),
  pageCount: z.number().int().positive().optional(),
  publishedYear: z.number().int().min(0).max(new Date().getFullYear() + 1).optional(),
  publisher: z.string().max(255).optional(),
  totalCopies: z.number().int().min(1).default(1),
  authorIds: z.array(z.number().int().positive()).min(1, "At least one author is required"),
  genreIds: z.array(z.number().int().positive()).default([]),
  tags: z.array(z.string().max(50)).default([]),
});

export const updateBookSchema = createBookSchema.partial().extend({
  id: z.string().uuid(),
});

// ─── Search Schema ───

export const searchSchema = z.object({
  query: z.string().max(500).default(""),
  genre: z.string().optional(),
  author: z.string().optional(),
  language: z.string().optional(),
  availability: z.enum(["all", "available", "unavailable"]).default("all"),
  sortBy: z
    .enum(["title", "publishedYear", "createdAt", "popularity"])
    .default("title"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  semantic: z.boolean().default(false),
});

// ─── Loan Schemas ───

export const createLoanSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  bookId: z.string().uuid("Invalid book ID"),
  notes: z.string().max(500).optional(),
});

export const returnLoanSchema = z.object({
  loanId: z.string().uuid("Invalid loan ID"),
  notes: z.string().max(500).optional(),
});

export const renewLoanSchema = z.object({
  loanId: z.string().uuid("Invalid loan ID"),
});

// ─── Reservation Schema ───

export const createReservationSchema = z.object({
  bookId: z.string().uuid("Invalid book ID"),
});

// ─── Settings Schema ───

export const updateSettingsSchema = z.object({
  library_name: z.string().min(1).max(100).optional(),
  tagline: z.string().max(200).optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  loan_period_days: z.number().int().min(1).max(365).optional(),
  max_books_per_member: z.number().int().min(1).max(50).optional(),
  max_renewals: z.number().int().min(0).max(10).optional(),
  fine_per_day: z.number().min(0).max(100).optional(),
  fine_currency: z.string().min(1).max(10).optional(),
  grace_period_days: z.number().int().min(0).max(30).optional(),
  reservation_hold_days: z.number().int().min(1).max(30).optional(),
  ai_enabled: z.boolean().optional(),
  three_d_enabled: z.boolean().optional(),
  registration_open: z.boolean().optional(),
  theme_colors: z
    .object({
      primary: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional(),
});

// ─── CSV Import Schema ───

export const csvBookRowSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  genre: z.string().optional(),
  description: z.string().optional(),
  language: z.string().default("English"),
  pageCount: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .optional(),
  publishedYear: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .optional(),
  publisher: z.string().optional(),
  totalCopies: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .default("1"),
  coverUrl: z.string().optional(),
});

// ─── Member Management Schema ───

export const updateMemberRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["ADMIN", "LIBRARIAN", "MEMBER"]),
});

export const updateMemberStatusSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
});

// ─── AI Chat Schema ───

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),
});

// ─── Pagination helper ───

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Type exports ───

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ReturnLoanInput = z.infer<typeof returnLoanSchema>;
export type RenewLoanInput = z.infer<typeof renewLoanSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type CsvBookRow = z.infer<typeof csvBookRowSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
