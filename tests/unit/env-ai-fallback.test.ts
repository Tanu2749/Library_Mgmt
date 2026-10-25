import { describe, it, expect } from "vitest";
import { getAiProviderInfo } from "@/lib/ai/provider";
import { generateLibrarianResponse } from "@/lib/ai/librarian";
import { generateEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";

describe("AI Provider & Fallback Engine", () => {
  it("defaults to built-in intelligent engine when no API keys are present", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const info = getAiProviderInfo();
    expect(info.provider).toBe("builtin");
    expect(info.isLive).toBe(false);
  });

  it("librarian provides recommendations for 'books like Atomic Habits but fiction'", async () => {
    const response = await generateLibrarianResponse(
      "books like Atomic Habits but fiction"
    );
    expect(response.text).toContain("Dune");
    expect(response.recommendations.length).toBeGreaterThan(0);
    expect(response.recommendations.some((r) => r.title === "Dune")).toBe(true);
  });

  it("librarian provides space recommendations for teenagers", async () => {
    const response = await generateLibrarianResponse(
      "something short about space for a teenager"
    );
    expect(response.recommendations.some((r) => r.title.includes("Hitchhiker"))).toBe(true);
  });

  it("generates 1536-dimensional embedding vectors", async () => {
    const vector = await generateEmbedding("Dune by Frank Herbert");
    expect(vector.length).toBe(1536);
    // Unit length check
    let sumSquares = 0;
    for (const v of vector) sumSquares += v * v;
    expect(Math.sqrt(sumSquares)).toBeCloseTo(1, 1);
  });

  it("calculates cosine similarity correctly", () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1, 4);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0, 4);
  });
});
