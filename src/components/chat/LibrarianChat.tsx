"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  BookOpen,
  User,
  RotateCcw,
  Bot,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site.config";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: {
    id?: string;
    title: string;
    author: string;
    reason: string;
    genre?: string;
  }[];
}

export function LibrarianChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome to the reading room! I am Athena, your AI research and literature guide at ${siteConfig.name}. Ask me for recommendations, thematic searches (e.g., "books like Atomic Habits but fiction"), or inquiries about our 40 catalog titles. What would you like to explore today?`,
    },
  ]);

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Books like Atomic Habits but fiction",
    "Something short about space for a teenager",
    "Best locked-room mysteries in the collection",
    "Philosophical masterworks on purpose & meaning",
  ];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to contact librarian");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            recommendations: data.recommendations,
          },
        ]);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[75vh] rounded-3xl bg-card border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 border-b border-border/80 bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center border border-accent/30 shadow-xs">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-foreground flex items-center gap-2">
              <span>Athena</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
                AI Librarian
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Grounded in Athenaeum Catalog (40 titles)</span>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: `Chat session refreshed. How may I assist your reading journey?`,
              },
            ])
          }
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 border border-accent/20 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                  : "bg-muted/50 border border-border/70 text-foreground rounded-bl-xs"
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Book recommendation cards embedded in assistant responses */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                  <div className="text-[11px] font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Catalog Matches</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.recommendations.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2.5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-serif font-bold text-foreground">
                            {rec.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            by {rec.author}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {rec.reason}
                          </p>
                        </div>
                        <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-primary">
                            {rec.genre || "Collection"}
                          </span>
                          <Link
                            href={`/catalog?query=${encodeURIComponent(rec.title)}`}
                            className="text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 border border-accent/20">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/70 text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span>Athena is reviewing catalog shelves...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/50 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-muted-foreground shrink-0 text-[11px] font-semibold">
          Try:
        </span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-[11px] font-medium text-foreground/80 hover:text-foreground shrink-0 border border-border/60 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3 bg-card border-t border-border/80">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Athena for reading advice, thematic queries, or author insights..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-50"
            title="Send inquiry"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
