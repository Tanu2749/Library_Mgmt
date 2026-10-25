import { getCurrentUser } from "@/lib/auth/guards";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-16 md:pb-0">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileNav user={user} />
    </div>
  );
}
