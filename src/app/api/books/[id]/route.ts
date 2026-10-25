import { NextRequest, NextResponse } from "next/server";
import { getBookById } from "@/lib/db/queries/books";
import { requireLibrarian } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, AppError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getBookById(id);

    if (!book) {
      throw new AppError("NOT_FOUND", "Book not found");
    }

    return NextResponse.json(book);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireLibrarian();
    const { id } = await params;

    await db.delete(books).where(eq(books.id, id));

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
