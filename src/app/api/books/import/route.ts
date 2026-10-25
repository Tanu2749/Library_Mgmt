import { NextRequest, NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { books, authors, genres, bookAuthors, bookGenres } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { handleApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    await requireLibrarian();
    const body = await req.json();
    const bookList = body.books;

    if (!Array.isArray(bookList) || bookList.length === 0) {
      return NextResponse.json(
        { error: { message: "No valid books provided in request" } },
        { status: 400 }
      );
    }

    let importedCount = 0;

    for (const b of bookList) {
      // 1. Find or create author
      let authorId: number | null = null;
      if (b.author) {
        const [existingAuthor] = await db
          .select({ id: authors.id })
          .from(authors)
          .where(eq(authors.name, b.author.trim()))
          .limit(1);

        if (existingAuthor) {
          authorId = existingAuthor.id;
        } else {
          const [newAuthor] = await db
            .insert(authors)
            .values({ name: b.author.trim() })
            .returning({ id: authors.id });
          authorId = newAuthor.id;
        }
      }

      // 2. Find or create genre
      let genreId: number | null = null;
      if (b.genre) {
        const slug = slugify(b.genre.trim());
        const [existingGenre] = await db
          .select({ id: genres.id })
          .from(genres)
          .where(eq(genres.slug, slug))
          .limit(1);

        if (existingGenre) {
          genreId = existingGenre.id;
        } else {
          const [newGenre] = await db
            .insert(genres)
            .values({ name: b.genre.trim(), slug })
            .returning({ id: genres.id });
          genreId = newGenre.id;
        }
      }

      // 3. Insert Book
      const copies = Number(b.totalCopies) || 1;
      const [insertedBook] = await db
        .insert(books)
        .values({
          title: b.title.trim(),
          isbn: b.isbn?.trim() || undefined,
          description: b.description?.trim() || undefined,
          publishedYear: b.publishedYear ? Number(b.publishedYear) : undefined,
          language: b.language || "English",
          totalCopies: copies,
          availableCopies: copies,
          coverUrl: b.coverUrl || undefined,
        })
        .returning({ id: books.id });

      // 4. Link Author & Genre
      if (authorId) {
        await db.insert(bookAuthors).values({
          bookId: insertedBook.id,
          authorId,
        });
      }
      if (genreId) {
        await db.insert(bookGenres).values({
          bookId: insertedBook.id,
          genreId,
        });
      }

      importedCount++;
    }

    return NextResponse.json({
      message: `Successfully imported ${importedCount} books`,
      count: importedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
