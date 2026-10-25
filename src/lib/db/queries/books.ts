import { eq, and, sql, ilike, desc, asc, inArray } from "drizzle-orm";
import { db } from "../client";
import {
  books,
  authors,
  genres,
  bookAuthors,
  bookGenres,
  loans,
} from "../schema";

export interface EnrichedBook {
  id: string;
  title: string;
  subtitle?: string | null;
  isbn?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  language: string;
  pageCount?: number | null;
  publishedYear?: number | null;
  publisher?: string | null;
  totalCopies: number;
  availableCopies: number;
  tags?: string[] | null;
  aiDescription?: string | null;
  authors: { id: number; name: string }[];
  genres: { id: number; name: string; slug: string }[];
}

export interface BookFilterParams {
  query?: string;
  genre?: string;
  author?: string;
  language?: string;
  availability?: "all" | "available" | "unavailable";
  sortBy?: "title" | "publishedYear" | "createdAt" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Get paginated books with relations and filtering.
 */
export async function getBooks(params: BookFilterParams = {}): Promise<{
  books: EnrichedBook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const {
    query = "",
    genre,
    author,
    language,
    availability = "all",
    sortBy = "title",
    sortOrder = "asc",
    page = 1,
    pageSize = 12,
  } = params;

  const offset = (page - 1) * pageSize;

  try {
    const conditions = [];

    if (query) {
      conditions.push(
        sql`(${books.title} ILIKE ${`%${query}%`} OR ${books.description} ILIKE ${`%${query}%`} OR ${books.isbn} ILIKE ${`%${query}%`})`
      );
    }

    if (language) {
      conditions.push(eq(books.language, language));
    }

    if (availability === "available") {
      conditions.push(sql`${books.availableCopies} > 0`);
    } else if (availability === "unavailable") {
      conditions.push(sql`${books.availableCopies} = 0`);
    }

    // Sort order
    const orderColumn =
      sortBy === "publishedYear"
        ? books.publishedYear
        : sortBy === "createdAt"
        ? books.createdAt
        : books.title;

    const orderExpr = sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch books
    const bookList = await db
      .select()
      .from(books)
      .where(whereClause)
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset);

    // Fetch authors and genres for these books
    const bookIds = bookList.map((b) => b.id);

    let authorsMap = new Map<string, { id: number; name: string }[]>();
    let genresMap = new Map<string, { id: number; name: string; slug: string }[]>();

    if (bookIds.length > 0) {
      const bookAuthorsList = await db
        .select({
          bookId: bookAuthors.bookId,
          authorId: authors.id,
          authorName: authors.name,
        })
        .from(bookAuthors)
        .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
        .where(inArray(bookAuthors.bookId, bookIds));

      for (const row of bookAuthorsList) {
        const arr = authorsMap.get(row.bookId) || [];
        arr.push({ id: row.authorId, name: row.authorName });
        authorsMap.set(row.bookId, arr);
      }

      const bookGenresList = await db
        .select({
          bookId: bookGenres.bookId,
          genreId: genres.id,
          genreName: genres.name,
          genreSlug: genres.slug,
        })
        .from(bookGenres)
        .innerJoin(genres, eq(bookGenres.genreId, genres.id))
        .where(inArray(bookGenres.bookId, bookIds));

      for (const row of bookGenresList) {
        const arr = genresMap.get(row.bookId) || [];
        arr.push({
          id: row.genreId,
          name: row.genreName,
          slug: row.genreSlug,
        });
        genresMap.set(row.bookId, arr);
      }
    }

    // Count total
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    const enrichedBooks = bookList.map((book) => ({
      ...book,
      authors: authorsMap.get(book.id) || [],
      genres: genresMap.get(book.id) || [],
    }));

    return {
      books: enrichedBooks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    // Zero-database fallback mode (e.g. initial serverless deploy before DB is linked)
    const { STATIC_BOOKS } = await import("../mock-data");
    let filtered = [...STATIC_BOOKS];

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.includes(q))
      );
    }

    if (genre) {
      filtered = filtered.filter((b) =>
        b.genres.some((g) => g.slug === genre)
      );
    }

    if (availability === "available") {
      filtered = filtered.filter((b) => b.availableCopies > 0);
    } else if (availability === "unavailable") {
      filtered = filtered.filter((b) => b.availableCopies === 0);
    }

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    return {
      books: paginated as any,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

/**
 * Get a single book by ID with full details, authors, genres, and availability.
 */
export async function getBookById(id: string): Promise<EnrichedBook | null> {
  try {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!book) return null;

    const bookAuthorsList = await db
      .select({
        id: authors.id,
        name: authors.name,
        bio: authors.bio,
      })
      .from(bookAuthors)
      .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
      .where(eq(bookAuthors.bookId, id));

    const bookGenresList = await db
      .select({
        id: genres.id,
        name: genres.name,
        slug: genres.slug,
      })
      .from(bookGenres)
      .innerJoin(genres, eq(bookGenres.genreId, genres.id))
      .where(eq(bookGenres.bookId, id));

    return {
      ...book,
      authors: bookAuthorsList,
      genres: bookGenresList,
    };
  } catch (error) {
    const { STATIC_BOOKS } = await import("../mock-data");
    const found = STATIC_BOOKS.find((b) => b.id === id);
    return (found as EnrichedBook) || null;
  }
}

/**
 * Get featured books for home page hero and shelves.
 */
export async function getFeaturedBooks(limit = 6): Promise<EnrichedBook[]> {
  try {
    const bookList = await db
      .select()
      .from(books)
      .limit(limit)
      .orderBy(desc(books.createdAt));

    const bookIds = bookList.map((b) => b.id);
    let authorsMap = new Map<string, { id: number; name: string }[]>();

    if (bookIds.length > 0) {
      const bookAuthorsList = await db
        .select({
          bookId: bookAuthors.bookId,
          authorId: authors.id,
          authorName: authors.name,
        })
        .from(bookAuthors)
        .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
        .where(inArray(bookAuthors.bookId, bookIds));

      for (const row of bookAuthorsList) {
        const arr = authorsMap.get(row.bookId) || [];
        arr.push({ id: row.authorId, name: row.authorName });
        authorsMap.set(row.bookId, arr);
      }
    }

    return bookList.map((b) => ({
      ...b,
      genres: [],
      authors: authorsMap.get(b.id) || [],
    }));
  } catch (error) {
    const { STATIC_BOOKS } = await import("../mock-data");
    return STATIC_BOOKS.slice(0, limit) as EnrichedBook[];
  }
}

/**
 * Get similar books based on shared genres or author.
 */
export async function getSimilarBooks(bookId: string, limit = 4): Promise<EnrichedBook[]> {
  try {
    const current = await getBookById(bookId);
    if (!current) return [];

    const genreIds = current.genres.map((g) => g.id);

    if (genreIds.length === 0) {
      return getFeaturedBooks(limit);
    }

    const similar = await db
      .select({
        id: books.id,
        title: books.title,
        coverUrl: books.coverUrl,
        availableCopies: books.availableCopies,
      })
      .from(books)
      .innerJoin(bookGenres, eq(books.id, bookGenres.bookId))
      .where(
        and(
          inArray(bookGenres.genreId, genreIds),
          sql`${books.id} != ${bookId}`
        )
      )
      .limit(limit);

    return similar.map((s) => ({
      ...s,
      language: "English",
      totalCopies: 1,
      authors: [],
      genres: [],
    }));
  } catch (error) {
    const { STATIC_BOOKS } = await import("../mock-data");
    return STATIC_BOOKS.filter((b) => b.id !== bookId).slice(0, limit) as EnrichedBook[];
  }
}

/**
 * Get all genres for filter dropdowns.
 */
export async function getAllGenres(): Promise<{ id: number; name: string; slug: string }[]> {
  try {
    return await db.select().from(genres).orderBy(asc(genres.name));
  } catch {
    const { STATIC_BOOKS } = await import("../mock-data");
    const map = new Map<string, { id: number; name: string; slug: string }>();
    for (const b of STATIC_BOOKS) {
      for (const g of b.genres) {
        map.set(g.slug, g);
      }
    }
    return Array.from(map.values());
  }
}

/**
 * Get all authors.
 */
export async function getAllAuthors(): Promise<{ id: number; name: string }[]> {
  try {
    return await db.select().from(authors).orderBy(asc(authors.name));
  } catch {
    const { STATIC_BOOKS } = await import("../mock-data");
    const map = new Map<number, { id: number; name: string }>();
    for (const b of STATIC_BOOKS) {
      for (const a of b.authors) {
        map.set(a.id, a);
      }
    }
    return Array.from(map.values());
  }
}
