import { NextRequest, NextResponse } from "next/server";
import { borrowBook } from "@/lib/db/queries/loans";
import { requireAuth } from "@/lib/auth/guards";
import { createLoanSchema } from "@/lib/validators";
import { handleApiError, AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // If caller is regular member, enforce userId is their own
    const requestedUserId = body.userId || user.id;

    if (user.role === "MEMBER" && requestedUserId !== user.id) {
      throw new AppError("FORBIDDEN", "Members can only borrow books for themselves");
    }

    const parsed = createLoanSchema.safeParse({
      userId: requestedUserId,
      bookId: body.bookId,
      notes: body.notes,
    });

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const loan = await borrowBook({
      userId: parsed.data.userId,
      bookId: parsed.data.bookId,
      issuedBy: user.id,
      notes: parsed.data.notes,
    });

    return NextResponse.json(
      { message: "Book borrowed successfully! Happy reading.", loan },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
