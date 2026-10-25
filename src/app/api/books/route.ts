import { NextRequest, NextResponse } from "next/server";
import { getBooks } from "@/lib/db/queries/books";
import { searchSchema, createBookSchema } from "@/lib/validators";
import { requireLibrarian } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { books, bookAuthors, bookGenres } from "@/lib/db/schema";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = {
      query: searchParams.get("query") || "",
      genre: searchParams.get("genre") || undefined,
      author: searchParams.get("author") || undefined,
      language: searchParams.get("language") || undefined,
      availability: (searchParams.get("availability") as any) || "all",
      sortBy: (searchParams.get("sortBy") as any) || "title",
      sortOrder: (searchParams.get("sortOrder") as any) || "asc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 12,
    };

    const parsed = searchSchema.safeParse(params);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const data = await getBooks(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireLibrarian();
    const body = await req.json();
    const parsed = createBookSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const { authorIds, genreIds, ...bookData } = parsed.data;

    // Insert book
    const [newBook] = await db
      .insert(books)
      .values({
        ...bookData,
        availableCopies: bookData.totalCopies,
      })
      .returning();

    // Link authors
    if (authorIds && authorIds.length > 0) {
      for (const authorId of authorIds) {
        await db.insert(bookAuthors).values({
          bookId: newBook.id,
          authorId,
        });
      }
    }

    // Link genres
    if (genreIds && genreIds.length > 0) {
      for (const genreId of genreIds) {
        await db.insert(bookGenres).values({
          bookId: newBook.id,
          genreId,
        });
      }
    }

    return NextResponse.json(
      { message: "Book created successfully", book: newBook },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
