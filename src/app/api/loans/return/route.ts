import { NextRequest, NextResponse } from "next/server";
import { returnBook } from "@/lib/db/queries/loans";
import { requireLibrarian } from "@/lib/auth/guards";
import { returnLoanSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const user = await requireLibrarian();
    const body = await req.json();

    const parsed = returnLoanSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const result = await returnBook({
      loanId: parsed.data.loanId,
      returnedBy: user.id,
      notes: parsed.data.notes,
    });

    return NextResponse.json({
      message: result.fine
        ? `Book returned. An overdue fee of $${result.fine.amount} has been assessed.`
        : "Book returned successfully.",
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
