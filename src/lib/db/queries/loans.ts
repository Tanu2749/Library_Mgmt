import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../client";
import {
  loans,
  books,
  users,
  fines,
  reservations,
  auditLogs,
  settings,
} from "../schema";
import { AppError } from "@/lib/errors";
import { calculateFine, calculateDueDate } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

/**
 * Fetch dynamic loan rules from the settings table, falling back to siteConfig.
 */
export async function getLoanRules() {
  try {
    const allSettings = await db.select().from(settings);
    const map = new Map(allSettings.map((s) => [s.key, s.value]));

    return {
      loanPeriodDays: Number(map.get("loan_period_days")) || siteConfig.rules.loanPeriodDays,
      maxBooksPerMember: Number(map.get("max_books_per_member")) || siteConfig.rules.maxBooksPerMember,
      maxRenewals: Number(map.get("max_renewals")) || siteConfig.rules.maxRenewals,
      finePerDay: Number(map.get("fine_per_day")) || siteConfig.rules.finePerDay,
      gracePeriodDays: Number(map.get("grace_period_days")) || siteConfig.rules.gracePeriodDays,
      fineCurrency: String(map.get("fine_currency") || siteConfig.rules.fineCurrency),
    };
  } catch {
    return siteConfig.rules;
  }
}

/**
 * Borrow a book with strict validation and transaction locking.
 */
export async function borrowBook({
  userId,
  bookId,
  issuedBy,
  notes,
}: {
  userId: string;
  bookId: string;
  issuedBy?: string;
  notes?: string;
}) {
  const rules = await getLoanRules();

  return await db.transaction(async (tx) => {
    // 1. Verify user exists and is active
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.isActive) {
      throw new AppError("BAD_REQUEST", "Member account is inactive or not found");
    }

    // 2. Check for unpaid fines
    const [unpaid] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(fines)
      .where(and(eq(fines.userId, userId), eq(fines.status, "UNPAID")));

    if (Number(unpaid?.count || 0) > 0) {
      throw new AppError(
        "FORBIDDEN",
        "Borrowing blocked: you have outstanding unpaid library fines. Please resolve your fines first."
      );
    }

    // 3. Check active loans limit
    const [activeLoanCount] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(loans)
      .where(and(eq(loans.userId, userId), eq(loans.status, "ACTIVE")));

    if (Number(activeLoanCount?.count || 0) >= rules.maxBooksPerMember) {
      throw new AppError(
        "FORBIDDEN",
        `Member limit reached: you cannot borrow more than ${rules.maxBooksPerMember} books simultaneously.`
      );
    }

    // 4. Check if user already has an active loan for this book
    const [existingLoan] = await tx
      .select({ id: loans.id })
      .from(loans)
      .where(
        and(
          eq(loans.userId, userId),
          eq(loans.bookId, bookId),
          eq(loans.status, "ACTIVE")
        )
      )
      .limit(1);

    if (existingLoan) {
      throw new AppError(
        "CONFLICT",
        "You already have an active loan for this book."
      );
    }

    // 5. Check copy availability and lock row
    const [book] = await tx
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book || !book.isActive) {
      throw new AppError("NOT_FOUND", "Book not found or discontinued");
    }

    if (book.availableCopies <= 0) {
      throw new AppError(
        "CONFLICT",
        "No copies of this book are currently available to borrow. You may place a reservation."
      );
    }

    // 6. Decrement available copies
    await tx
      .update(books)
      .set({
        availableCopies: book.availableCopies - 1,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId));

    // 7. Calculate due date
    const now = new Date();
    const dueDate = calculateDueDate(now, rules.loanPeriodDays);

    // 8. Create loan record
    const [newLoan] = await tx
      .insert(loans)
      .values({
        userId,
        bookId,
        status: "ACTIVE",
        borrowedAt: now,
        dueDate,
        renewalCount: 0,
        notes,
        issuedBy,
      })
      .returning();

    // 9. If user had a pending reservation for this book, fulfill it
    await tx
      .update(reservations)
      .set({
        status: "FULFILLED",
        fulfilledAt: now,
      })
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.bookId, bookId),
          eq(reservations.status, "PENDING")
        )
      );

    // 10. Audit log
    await tx.insert(auditLogs).values({
      userId,
      action: "BORROW",
      entityType: "book",
      entityId: bookId,
      details: { loanId: newLoan.id, dueDate: dueDate.toISOString() },
    });

    return newLoan;
  });
}

/**
 * Return a loaned book, increment available copies, calculate late fine if applicable.
 */
export async function returnBook({
  loanId,
  returnedBy,
  notes,
}: {
  loanId: string;
  returnedBy?: string;
  notes?: string;
}) {
  const rules = await getLoanRules();

  return await db.transaction(async (tx) => {
    const [loan] = await tx
      .select()
      .from(loans)
      .where(eq(loans.id, loanId))
      .limit(1);

    if (!loan) {
      throw new AppError("NOT_FOUND", "Loan record not found");
    }

    if (loan.status === "RETURNED") {
      throw new AppError("BAD_REQUEST", "This loan has already been returned");
    }

    const now = new Date();

    // 1. Mark loan as returned
    const [updatedLoan] = await tx
      .update(loans)
      .set({
        status: "RETURNED",
        returnedAt: now,
        notes: notes ? `${loan.notes || ""}\n${notes}`.trim() : loan.notes,
      })
      .where(eq(loans.id, loanId))
      .returning();

    // 2. Increment available copies
    const [book] = await tx
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, loan.bookId))
      .limit(1);

    if (book) {
      await tx
        .update(books)
        .set({
          availableCopies: book.availableCopies + 1,
          updatedAt: now,
        })
        .where(eq(books.id, loan.bookId));
    }

    // 3. Check for overdue fine
    const fineAmount = calculateFine(
      loan.dueDate,
      now,
      rules.finePerDay,
      rules.gracePeriodDays
    );

    let fineRecord = null;
    if (fineAmount > 0) {
      const [fine] = await tx
        .insert(fines)
        .values({
          userId: loan.userId,
          loanId: loan.id,
          amount: String(fineAmount.toFixed(2)),
          status: "UNPAID",
          reason: `Late return: returned on ${now.toISOString().split("T")[0]}, was due ${loan.dueDate.toISOString().split("T")[0]}`,
        })
        .returning();
      fineRecord = fine;
    }

    // 4. Check if there are pending reservations for this book
    const [oldestReservation] = await tx
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.bookId, loan.bookId),
          eq(reservations.status, "PENDING")
        )
      )
      .orderBy(reservations.reservedAt)
      .limit(1);

    if (oldestReservation) {
      const holdExpires = new Date();
      holdExpires.setDate(holdExpires.getDate() + 3);

      await tx
        .update(reservations)
        .set({
          status: "READY",
          expiresAt: holdExpires,
        })
        .where(eq(reservations.id, oldestReservation.id));
    }

    // 5. Audit log
    await tx.insert(auditLogs).values({
      userId: loan.userId,
      action: "RETURN",
      entityType: "loan",
      entityId: loanId,
      details: { fineAmount },
    });

    return {
      loan: updatedLoan,
      fine: fineRecord,
    };
  });
}

/**
 * Renew an active loan.
 */
export async function renewLoan({
  loanId,
  userId,
}: {
  loanId: string;
  userId: string;
}) {
  const rules = await getLoanRules();

  return await db.transaction(async (tx) => {
    const [loan] = await tx
      .select()
      .from(loans)
      .where(eq(loans.id, loanId))
      .limit(1);

    if (!loan) {
      throw new AppError("NOT_FOUND", "Loan record not found");
    }

    if (loan.userId !== userId) {
      throw new AppError("FORBIDDEN", "You can only renew your own loans");
    }

    if (loan.status !== "ACTIVE") {
      throw new AppError(
        "BAD_REQUEST",
        "Only active loans in good standing can be renewed"
      );
    }

    if (loan.renewalCount >= rules.maxRenewals) {
      throw new AppError(
        "BAD_REQUEST",
        `Maximum renewal limit of ${rules.maxRenewals} reached for this loan.`
      );
    }

    // Check if overdue
    const now = new Date();
    if (now > loan.dueDate) {
      throw new AppError(
        "BAD_REQUEST",
        "Overdue loans cannot be renewed. Please return the book to the desk."
      );
    }

    // Calculate new due date
    const newDueDate = calculateDueDate(loan.dueDate, rules.loanPeriodDays);

    const [updated] = await tx
      .update(loans)
      .set({
        dueDate: newDueDate,
        renewalCount: loan.renewalCount + 1,
      })
      .where(eq(loans.id, loanId))
      .returning();

    await tx.insert(auditLogs).values({
      userId,
      action: "RENEW",
      entityType: "loan",
      entityId: loanId,
      details: {
        previousDue: loan.dueDate.toISOString(),
        newDue: newDueDate.toISOString(),
        renewalCount: updated.renewalCount,
      },
    });

    return updated;
  });
}

/**
 * Get a user's loans with book details.
 */
export async function getUserLoans(userId: string) {
  try {
    const loanList = await db
      .select({
        id: loans.id,
        status: loans.status,
        borrowedAt: loans.borrowedAt,
        dueDate: loans.dueDate,
        returnedAt: loans.returnedAt,
        renewalCount: loans.renewalCount,
        bookId: books.id,
        bookTitle: books.title,
        bookCover: books.coverUrl,
        isbn: books.isbn,
      })
      .from(loans)
      .innerJoin(books, eq(loans.bookId, books.id))
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.borrowedAt));

    return loanList;
  } catch (error) {
    console.error("Error fetching user loans:", error);
    return [];
  }
}

/**
 * Get a user's fines.
 */
export async function getUserFines(userId: string) {
  try {
    return await db
      .select()
      .from(fines)
      .where(eq(fines.userId, userId))
      .orderBy(desc(fines.createdAt));
  } catch {
    return [];
  }
}

/**
 * Get a user's reservations.
 */
export async function getUserReservations(userId: string) {
  try {
    return await db
      .select({
        id: reservations.id,
        status: reservations.status,
        reservedAt: reservations.reservedAt,
        expiresAt: reservations.expiresAt,
        bookId: books.id,
        bookTitle: books.title,
        bookCover: books.coverUrl,
      })
      .from(reservations)
      .innerJoin(books, eq(reservations.bookId, books.id))
      .where(eq(reservations.userId, userId))
      .orderBy(desc(reservations.reservedAt));
  } catch {
    return [];
  }
}
