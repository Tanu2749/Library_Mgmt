import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within limit", () => {
    const config = { id: "test-1", maxRequests: 3, windowSec: 60 };
    const r1 = checkRateLimit(config, "client-1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it("blocks requests over limit", () => {
    const config = { id: "test-2", maxRequests: 2, windowSec: 60 };
    checkRateLimit(config, "client-2");
    checkRateLimit(config, "client-2");
    const r3 = checkRateLimit(config, "client-2");
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("isolates different clients", () => {
    const config = { id: "test-3", maxRequests: 1, windowSec: 60 };
    checkRateLimit(config, "client-a");
    const r = checkRateLimit(config, "client-b");
    expect(r.allowed).toBe(true);
  });

  it("isolates different rate limit IDs", () => {
    const config1 = { id: "test-4a", maxRequests: 1, windowSec: 60 };
    const config2 = { id: "test-4b", maxRequests: 1, windowSec: 60 };
    checkRateLimit(config1, "client-x");
    const r = checkRateLimit(config2, "client-x");
    expect(r.allowed).toBe(true);
  });
});
