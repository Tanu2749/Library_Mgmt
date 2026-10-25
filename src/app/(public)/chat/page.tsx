import { Sparkles } from "lucide-react";
import { LibrarianChat } from "@/components/chat/LibrarianChat";

export default function ChatPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Literary AI</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Consult Athena, AI Librarian
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Ask questions about any work in our catalog, request personalized recommendations, or discover connections between classics and modern fiction.
        </p>
      </div>

      <LibrarianChat />
    </div>
  );
}
