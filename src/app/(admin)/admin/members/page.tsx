import { getAllMembersAdmin } from "@/lib/db/queries/admin";
import { MembersTable } from "@/components/admin/MembersTable";

export default async function AdminMembersPage() {
  const members = await getAllMembersAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Member Directory & Permissions
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View registered readers, promote users to Librarian or Admin, and toggle account access.
        </p>
      </div>

      <MembersTable initialMembers={members} />
    </div>
  );
}
