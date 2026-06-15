"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Search, Users } from "lucide-react";

import { RoleForm } from "./form-role";
import { IRole } from "@/type/role";

import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";
import { SectionHeader } from "@/components/section/section-header";
import { SectionTable, TableColumn } from "@/components/section/section-table";
import { deleteRole } from "../action";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TABLE_COLUMNS: TableColumn<IRole>[] = [
  {
    header: "Role Name",
    accessor: "role_name",
  },
  {
    header: "Status",
    accessor: (role) => (role.is_active ? "Active" : "Non-active"),
  },
];

interface RolesClientProps {
  initialRoles: IRole[];
}

export default function RolesClient({ initialRoles }: RolesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return initialRoles;
    return initialRoles.filter((r) => r.role_name.toLowerCase().includes(q));
  }, [searchQuery, initialRoles]);

  const handleAdd = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: IRole) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (role: IRole) => {
    setDeleteTarget(role);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteRole(deleteTarget.id);

      if (result.error) {
        toast.error(
          "Cannot delete this role — it still has associated staff. Disable it instead.",
          { duration: 8000 },
        );
      } else {
        setIsDeleteOpen(false);
        setDeleteTarget(null);
        router.refresh();
        toast.success(`Role "${deleteTarget.role_name}" deleted.`);
      }
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] w-full flex-col gap-6 overflow-hidden p-4 md:p-6">
      <SectionHeader
        title="Role Management"
        description="Manage the list of clinic roles."
        icon={Users}
        actionLabel="Add role"
        onAction={handleAdd}
      />

      <section className="relative md:w-70">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4"
        />
      </section>

      <SectionTable
        data={filtered}
        header={TABLE_COLUMNS}
        emptyMessage={
          searchQuery
            ? `No roles found for "${searchQuery}".`
            : "No roles yet. Add one using the button above."
        }
        onEdit={handleEdit}
        onDelete={handleDeleteTrigger}
        mobileRender={(role) => (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <h4 className="font-bold">{role.role_name}</h4>
              <Badge variant={role.is_active ? "secondary" : "destructive"}>
                {role.is_active ? "Active" : "Non-active"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleEdit(role)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteTrigger(role)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      />

      <RoleForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        editData={selectedRole}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Role"
        itemName={deleteTarget?.role_name ?? ""}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}
