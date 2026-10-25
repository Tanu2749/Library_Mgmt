import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/guards";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { BookOpen, Clock, Bookmark, CreditCard, User } from "lucide-react";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-16 md:pb-0">
      <Navbar user={user} />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Account Header */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-xl font-bold font-serif">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif">{user.name}</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {user.role} Member
                </span>
              </div>
            </div>
          </div>
        </div>

        <main>{children}</main>
      </div>
      <Footer />
      <MobileNav user={user} />
    </div>
  );
}
