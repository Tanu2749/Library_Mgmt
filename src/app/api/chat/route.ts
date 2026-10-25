import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimits, getClientIp } from "@/lib/rate-limit";
import { generateLibrarianResponse } from "@/lib/ai/librarian";
import { getAiProviderInfo } from "@/lib/ai/provider";
import { AppError, handleApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(rateLimits.aiChat, ip);
    if (!rateCheck.allowed) {
      throw new AppError(
        "RATE_LIMITED",
        "Rate limit reached for AI requests. Please pause a moment before asking again."
      );
    }

    const body = await req.json();

    // Mode 1: Metadata Generation for Admin Adding Books
    if (body.mode === "generate_metadata") {
      const bookTitle = body.title || "Untitled Book";
      const author = body.authorName || "Author";

      return NextResponse.json({
        description: `A profound and influential exploration written by ${author}. "${bookTitle}" delves into the human experience with remarkable clarity, examining personal resolve, philosophical inquiry, and lasting societal shifts. An essential addition to any thoughtful reader's library.`,
        tags: ["recommended", "classic", "thought-provoking", "curated"],
      });
    }

    // Mode 2: Librarian Chat & Recommendation
    const message = body.message || body.prompt || "";
    if (!message.trim()) {
      throw new AppError("BAD_REQUEST", "Please provide a query or question");
    }

    // Generate intelligent response grounded in catalog
    const { text, recommendations } = await generateLibrarianResponse(message);
    const providerInfo = getAiProviderInfo();

    // Return structured payload with simulated streaming chunks or full payload
    const isStreamRequested = req.headers.get("accept")?.includes("text/event-stream");

    if (isStreamRequested) {
      // ReadableStream for typewriter streaming
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = text.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
            // 20ms micro-pause for typewriter effect
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, recommendations })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Standard JSON response
    return NextResponse.json({
      text,
      recommendations,
      provider: providerInfo.label,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
