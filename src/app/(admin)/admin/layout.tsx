import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Navbar } from "@/components/layout/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (user.role !== "ADMIN" && user.role !== "LIBRARIAN") {
    redirect("/?forbidden=admin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={user} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <div className="hidden md:block">
          <AdminSidebar userRole={user.role} userName={user.name ?? undefined} />
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
