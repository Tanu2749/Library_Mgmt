import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
  serial,
  jsonb,
  vector,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "LIBRARIAN",
  "MEMBER",
]);

export const loanStatusEnum = pgEnum("loan_status", [
  "ACTIVE",
  "RETURNED",
  "OVERDUE",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "PENDING",
  "READY",
  "FULFILLED",
  "CANCELLED",
  "EXPIRED",
]);

export const fineStatusEnum = pgEnum("fine_status", [
  "UNPAID",
  "PAID",
  "WAIVED",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "BORROW",
  "RETURN",
  "RENEW",
  "RESERVE",
  "FINE",
  "SETTINGS_CHANGE",
  "LOGIN",
]);

// ─── Users ───

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("MEMBER"),
    avatarUrl: text("avatar_url"),
    phone: varchar("phone", { length: 20 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

// ─── Authors ───

export const authors = pgTable(
  "authors",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("authors_name_idx").on(table.name),
  ]
);

// ─── Genres ───

export const genres = pgTable(
  "genres",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("genres_slug_idx").on(table.slug),
  ]
);

// ─── Books ───

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    subtitle: varchar("subtitle", { length: 500 }),
    isbn: varchar("isbn", { length: 13 }),
    description: text("description"),
    coverUrl: text("cover_url"),
    language: varchar("language", { length: 50 }).notNull().default("English"),
    pageCount: integer("page_count"),
    publishedYear: integer("published_year"),
    publisher: varchar("publisher", { length: 255 }),
    totalCopies: integer("total_copies").notNull().default(1),
    availableCopies: integer("available_copies").notNull().default(1),
    tags: text("tags").array(),
    aiDescription: text("ai_description"),
    embedding: vector("embedding", { dimensions: 1536 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("books_isbn_idx").on(table.isbn),
    index("books_title_idx").on(table.title),
    index("books_language_idx").on(table.language),
    index("books_published_year_idx").on(table.publishedYear),
  ]
);

// ─── Book ↔ Author (many-to-many) ───

export const bookAuthors = pgTable(
  "book_authors",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    authorId: integer("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.bookId, table.authorId] }),
  ]
);

// ─── Book ↔ Genre (many-to-many) ───

export const bookGenres = pgTable(
  "book_genres",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.bookId, table.genreId] }),
  ]
);

// ─── Loans ───

export const loans = pgTable(
  "loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "restrict" }),
    status: loanStatusEnum("status").notNull().default("ACTIVE"),
    borrowedAt: timestamp("borrowed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    returnedAt: timestamp("returned_at", { withTimezone: true }),
    renewalCount: integer("renewal_count").notNull().default(0),
    notes: text("notes"),
    issuedBy: uuid("issued_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("loans_user_idx").on(table.userId),
    index("loans_book_idx").on(table.bookId),
    index("loans_status_idx").on(table.status),
    index("loans_due_date_idx").on(table.dueDate),
  ]
);

// ─── Reservations ───

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    status: reservationStatusEnum("status").notNull().default("PENDING"),
    reservedAt: timestamp("reserved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("reservations_user_idx").on(table.userId),
    index("reservations_book_idx").on(table.bookId),
    index("reservations_status_idx").on(table.status),
  ]
);

// ─── Fines ───

export const fines = pgTable(
  "fines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: fineStatusEnum("status").notNull().default("UNPAID"),
    reason: text("reason"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("fines_user_idx").on(table.userId),
    index("fines_loan_idx").on(table.loanId),
    index("fines_status_idx").on(table.status),
  ]
);

// ─── Settings (key-value for runtime config) ───

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
});

// ─── Audit Logs ───

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

// ─── Relations ───

export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  reservations: many(reservations),
  fines: many(fines),
  auditLogs: many(auditLogs),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookAuthors: many(bookAuthors),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  bookGenres: many(bookGenres),
}));

export const booksRelations = relations(books, ({ many }) => ({
  bookAuthors: many(bookAuthors),
  bookGenres: many(bookGenres),
  loans: many(loans),
  reservations: many(reservations),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookAuthors.authorId],
    references: [authors.id],
  }),
}));

export const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, {
    fields: [bookGenres.bookId],
    references: [books.id],
  }),
  genre: one(genres, {
    fields: [bookGenres.genreId],
    references: [genres.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
  issuedByUser: one(users, {
    fields: [loans.issuedBy],
    references: [users.id],
    relationName: "issuedLoans",
  }),
  fines: many(fines),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reservations.bookId],
    references: [books.id],
  }),
}));

export const finesRelations = relations(fines, ({ one }) => ({
  user: one(users, {
    fields: [fines.userId],
    references: [users.id],
  }),
  loan: one(loans, {
    fields: [fines.loanId],
    references: [loans.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
