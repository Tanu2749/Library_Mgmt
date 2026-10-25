import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validators";
import { checkRateLimit, rateLimits, getClientIp } from "@/lib/rate-limit";
import { AppError, handleApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(rateLimits.register, ip);
    if (!rateCheck.allowed) {
      throw new AppError(
        "RATE_LIMITED",
        "Too many registration attempts. Please wait a few minutes before trying again."
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const { name, email, password } = parsed.data;

    // Check existing email
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      throw new AppError(
        "CONFLICT",
        "An account with this email address already exists."
      );
    }

    // Hash password with bcrypt cost factor 12
    const passwordHash = await hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "MEMBER",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      {
        message: "Registration successful. Welcome to Athenaeum!",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
