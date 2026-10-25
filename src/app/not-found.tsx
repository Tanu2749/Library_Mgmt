import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-primary/15 text-primary flex items-center justify-center border border-primary/30">
        <BookOpen className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold">Page or Book Not Found</h1>
      <p className="text-xs text-muted-foreground max-w-md">
        The shelf or record you are searching for does not exist in our library archives.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Reading Room</span>
        </Link>
      </div>
    </div>
  );
}
