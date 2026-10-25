import { auth } from "./config";
import { AppError } from "@/lib/errors";

export type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";

/**
 * Get current session user safely.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require an authenticated session or throw AppError(UNAUTHORIZED).
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("UNAUTHORIZED", "You must be signed in to perform this action");
  }
  return user;
}

/**
 * Require specific role(s) or throw AppError(FORBIDDEN).
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AppError(
      "FORBIDDEN",
      `Access denied. Required role: ${allowedRoles.join(" or ")}`
    );
  }
  return user;
}

/**
 * Check if the user is an Admin.
 */
export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

/**
 * Check if the user is a Librarian or Admin.
 */
export async function requireLibrarian() {
  return requireRole(["ADMIN", "LIBRARIAN"]);
}
