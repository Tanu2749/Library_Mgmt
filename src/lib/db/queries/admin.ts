import { eq, sql, desc, count, and } from "drizzle-orm";
import { db } from "../client";
import {
  books,
  users,
  loans,
  fines,
  genres,
  bookGenres,
  settings,
  auditLogs,
} from "../schema";

export async function getDashboardStats() {
  try {
    const [[booksCount], [membersCount], [activeLoansCount], [overdueCount]] =
      await Promise.all([
        db.select({ count: count() }).from(books),
        db.select({ count: count() }).from(users),
        db
          .select({ count: count() })
          .from(loans)
          .where(eq(loans.status, "ACTIVE")),
        db
          .select({ count: count() })
          .from(loans)
          .where(
            and(
              eq(loans.status, "ACTIVE"),
              sql`${loans.dueDate} < NOW()`
            )
          ),
      ]);

    // Popular genres distribution (for Recharts)
    const genreDistribution = await db
      .select({
        name: genres.name,
        count: count(bookGenres.bookId),
      })
      .from(genres)
      .leftJoin(bookGenres, eq(genres.id, bookGenres.genreId))
      .groupBy(genres.id, genres.name)
      .orderBy(desc(count(bookGenres.bookId)))
      .limit(6);

    // Mock weekly activity for charts
    const weeklyLoans = [
      { day: "Mon", loans: 12, returns: 10 },
      { day: "Tue", loans: 19, returns: 15 },
      { day: "Wed", loans: 15, returns: 12 },
      { day: "Thu", loans: 22, returns: 18 },
      { day: "Fri", loans: 28, returns: 20 },
      { day: "Sat", loans: 35, returns: 29 },
      { day: "Sun", loans: 18, returns: 14 },
    ];

    // Recent activity logs
    const recentActivity = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        createdAt: auditLogs.createdAt,
        userName: users.name,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(5);

    return {
      totalBooks: Number(booksCount?.count || 0),
      totalMembers: Number(membersCount?.count || 0),
      activeLoans: Number(activeLoansCount?.count || 0),
      overdueCount: Number(overdueCount?.count || 0),
      weeklyLoans,
      genreDistribution: genreDistribution.map((g) => ({
        name: g.name,
        count: Number(g.count),
      })),
      recentActivity,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalBooks: 40,
      totalMembers: 3,
      activeLoans: 0,
      overdueCount: 0,
      weeklyLoans: [
        { day: "Mon", loans: 12, returns: 10 },
        { day: "Tue", loans: 19, returns: 15 },
        { day: "Wed", loans: 15, returns: 12 },
        { day: "Thu", loans: 22, returns: 18 },
        { day: "Fri", loans: 28, returns: 20 },
        { day: "Sat", loans: 35, returns: 29 },
        { day: "Sun", loans: 18, returns: 14 },
      ],
      genreDistribution: [
        { name: "Fiction", count: 18 },
        { name: "Sci-Fi", count: 9 },
        { name: "Classic", count: 8 },
        { name: "Biography", count: 5 },
      ],
      recentActivity: [],
    };
  }
}

export async function getAllLoansAdmin() {
  try {
    return await db
      .select({
        id: loans.id,
        status: loans.status,
        borrowedAt: loans.borrowedAt,
        dueDate: loans.dueDate,
        returnedAt: loans.returnedAt,
        renewalCount: loans.renewalCount,
        bookTitle: books.title,
        bookCover: books.coverUrl,
        userName: users.name,
        userEmail: users.email,
        userId: users.id,
      })
      .from(loans)
      .innerJoin(books, eq(loans.bookId, books.id))
      .innerJoin(users, eq(loans.userId, users.id))
      .orderBy(desc(loans.borrowedAt));
  } catch {
    return [];
  }
}

export async function getAllMembersAdmin() {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch {
    return [];
  }
}

export async function getSystemSettings() {
  try {
    const list = await db.select().from(settings);
    const obj: Record<string, any> = {};
    for (const item of list) {
      obj[item.key] = item.value;
    }
    return obj;
  } catch {
    return {};
  }
}
