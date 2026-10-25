import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { updateSettingsSchema } from "@/lib/validators";
import { getSystemSettings } from "@/lib/db/queries/admin";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const data = await getSystemSettings();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await req.json();

    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const updates = parsed.data;

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        await db
          .insert(settings)
          .values({
            key,
            value: JSON.stringify(val),
            updatedAt: new Date(),
            updatedBy: user.id,
          })
          .onConflictDoUpdate({
            target: settings.key,
            set: {
              value: JSON.stringify(val),
              updatedAt: new Date(),
              updatedBy: user.id,
            },
          });
      }
    }

    return NextResponse.json({
      message: "System settings saved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
