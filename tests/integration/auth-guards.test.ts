import { describe, it, expect, vi } from "vitest";
import { AppError } from "@/lib/errors";

// Mocking auth()
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireLibrarian,
} from "@/lib/auth/guards";

describe("Auth and Role Guards", () => {
  it("getCurrentUser returns null when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("requireAuth throws UNAUTHORIZED when session is missing", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    await expect(requireAuth()).rejects.toThrow("You must be signed in");
  });

  it("requireRole allows permitted role", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "123", email: "admin@demo.com", role: "ADMIN" },
    } as any);

    const user = await requireRole(["ADMIN", "LIBRARIAN"]);
    expect(user.role).toBe("ADMIN");
  });

  it("requireRole throws FORBIDDEN when user has insufficient role", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "123", email: "member@demo.com", role: "MEMBER" },
    } as any);

    await expect(requireRole(["ADMIN", "LIBRARIAN"])).rejects.toThrow(
      "Access denied"
    );
  });

  it("requireAdmin restricts to ADMIN only", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "123", email: "librarian@demo.com", role: "LIBRARIAN" },
    } as any);

    await expect(requireAdmin()).rejects.toThrow("Access denied");
  });

  it("requireLibrarian permits both LIBRARIAN and ADMIN", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "123", email: "librarian@demo.com", role: "LIBRARIAN" },
    } as any);

    const librarian = await requireLibrarian();
    expect(librarian.role).toBe("LIBRARIAN");

    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "456", email: "admin@demo.com", role: "ADMIN" },
    } as any);

    const admin = await requireLibrarian();
    expect(admin.role).toBe("ADMIN");
  });
});
