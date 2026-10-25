import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateMemberRoleSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/errors";

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateMemberRoleSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const [updated] = await db
      .update(users)
      .set({
        role: parsed.data.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parsed.data.userId))
      .returning();

    return NextResponse.json({
      message: "Role updated successfully",
      user: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
