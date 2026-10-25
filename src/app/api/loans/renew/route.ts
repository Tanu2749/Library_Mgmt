import { NextRequest, NextResponse } from "next/server";
import { renewLoan } from "@/lib/db/queries/loans";
import { requireAuth } from "@/lib/auth/guards";
import { renewLoanSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = renewLoanSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const updatedLoan = await renewLoan({
      loanId: parsed.data.loanId,
      userId: user.id,
    });

    return NextResponse.json({
      message: `Loan renewed successfully! New due date: ${
        new Date(updatedLoan.dueDate).toISOString().split("T")[0]
      }`,
      loan: updatedLoan,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
