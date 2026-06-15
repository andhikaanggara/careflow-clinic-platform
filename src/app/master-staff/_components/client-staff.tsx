"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { toast } from "sonner";
import { Search, Users } from "lucide-react";

// ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SectionHeader } from "@/components/section/section-header";
import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";

// utils & types
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";
import { deleteStaff } from "../actions";
import { SectionTable, TableColumn } from "@/components/section/section-table";
import { Badge } from "@/components/ui/badge";
import { StaffForm } from "./form-staff";

const TABLE_COLUMNS: TableColumn<IStaff>[] = [
  {
    header: "Staff Name",
    accessor: "staff_name",
  },
  {
    header: "Role",
    accessor: (staff) => staff.roles?.role_name,
  },
  {
    header: "Status",
    accessor: (staff) => (staff.is_active ? "Active" : "Non-active"),
  },
];

export default function StaffClient({
  initialStaff,
  initialRoles,
}: {
  initialStaff: IStaff[];
  initialRoles: IRole[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAllertDeleteOpen, setIsAlertDeleteOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IStaff | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return initialStaff;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return initialStaff.filter(
      (staff) =>
        staff.staff_name.toLowerCase().includes(lowerCaseQuery) ||
        staff.role_id.toLocaleLowerCase().includes(lowerCaseQuery),
    );
  }, [searchQuery, initialStaff]);

  const handleOpenAdd = () => {
    setSelectedStaff(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (staff: IStaff) => {
    setSelectedStaff(staff);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (staff: IStaff) => {
    setDeleteTarget(staff);
    setIsAlertDeleteOpen(true);
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;

    setIsAlertDeleteOpen(false);

    startTransition(async () => {
      const result = await deleteStaff(deleteTarget.id);

      if (result.error) {
        toast.error(
          "Failed to delete staff: staff has associated absences, you can only deactivate that officer.",
          { duration: 8000 },
        );
      } else {
        setIsAlertDeleteOpen(false);
        setDeleteTarget(null);
        router.refresh();
        toast.success(
          `Staff "${deleteTarget.staff_name}" was successfully deleted`,
        );
      }
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
      {/* Header Section */}
      <SectionHeader
        title="Staff Management"
        description="Manage the list of clinic staff."
        icon={Users}
        actionLabel="Add staff"
        onAction={handleOpenAdd}
      />

      {/* filter */}
      <section className="relative md:w-70">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 w-full"
        />
      </section>

      <SectionTable
        data={filteredStaff}
        header={TABLE_COLUMNS}
        emptyMessage={
          searchQuery
            ? `No staff found with keyword ${searchQuery}`
            : "There are no staff yet. Add one from the button above."
        }
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTrigger}
        mobileRender={(staff) => (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="text-muted-foreground">
                {staff.roles?.role_name}
              </div>
              <Badge variant={staff.is_active ? "secondary" : "destructive"}>
                {staff.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <h4 className="font-bold">{staff.staff_name}</h4>
            <div className="flex gap-2 mt-2">
              <Button
                className="w-1/2"
                variant="outline"
                onClick={() => handleOpenEdit(staff)}
              >
                Edit
              </Button>
              <Button
                className="w-1/2"
                variant="destructive"
                onClick={() => handleDeleteTrigger(staff)}
              >
                Hapus
              </Button>
            </div>
          </div>
        )}
      />

      {/* add/edit Dialog */}
      <StaffForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        rolesData={initialRoles}
        editData={selectedStaff}
      />

      {/* Delete Alert */}
      <ConfirmDeleteDialog
        isOpen={isAllertDeleteOpen}
        onOpenChange={setIsAlertDeleteOpen}
        entityName="Petugas"
        itemName={deleteTarget?.staff_name ?? ""}
        onConfirm={onConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}
