import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";

/**
 * AI Provider Detection:
 * Automatically uses real provider if API key is present in environment,
 * or switches to Athenaeum's Built-in Intelligent Catalog Engine.
 */

export function getAiProviderInfo() {
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai" as const,
      modelName: "gpt-4o-mini",
      isLive: true,
      label: "OpenAI (GPT-4o)",
    };
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      provider: "google" as const,
      modelName: "gemini-1.5-flash",
      isLive: true,
      label: "Google Gemini 1.5",
    };
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic" as const,
      modelName: "claude-3-5-sonnet",
      isLive: true,
      label: "Anthropic Claude 3.5",
    };
  }

  return {
    provider: "builtin" as const,
    modelName: "athena-catalog-v1",
    isLive: false,
    label: "Athenaeum Intelligent Engine (Built-in Mode)",
  };
}

export function getLanguageModel() {
  const info = getAiProviderInfo();

  if (info.provider === "openai") {
    return openai("gpt-4o-mini");
  }

  if (info.provider === "google") {
    return google("gemini-1.5-flash");
  }

  if (info.provider === "anthropic") {
    return anthropic("claude-3-5-sonnet-20241022");
  }

  return null;
}
