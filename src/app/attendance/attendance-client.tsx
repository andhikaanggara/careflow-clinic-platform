"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";

// UI Components
import { SectionHeader } from "@/components/section/section-header";

// Actions & Types
import type { IRole } from "@/type/role";
import type { IStaff } from "@/type/staff";
import type { IAttendanceRow } from "@/type/attendance";
import { AttendanceListMobile } from "./_components/attendance-list-mobile";
import { AttendanceListDesktop } from "./_components/attendance-list-desktop";
import { DeleteConfirmDialog } from "./_components/detele-confirm-dialog";
import { AttendanceFormDialog } from "./_components/attendance-form-dialog";

export default function AttendanceClient({
  initialAttendance,
  staffList,
  roles,
}: {
  initialAttendance: IAttendanceRow[];
  staffList: IStaff[];
  roles: IRole[];
}) {
  const [isMounted, setIsMounted] = useState(false);

  // --- UI States ---
  const [isDialogOpsOpen, setIsDialogOpsOpen] = useState(false);
  const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);

  // --- Data States ---
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Memos & Helpers ---
  const staffMap = useMemo(
    () => new Map(staffList.map((s) => [s.id, s])),
    [staffList],
  );

  const groupedAttendance = useMemo(() => {
    const groups: Record<string, any> = {};
    initialAttendance.forEach((item) => {
      const key = `${item.date}-${item.shift}`;
      if (!groups[key])
        groups[key] = { id: key, date: item.date, shift: item.shift };
      const staffInfo = staffMap.get(item.staff_id);
      if (staffInfo) groups[key][staffInfo.role] = item.staff_id;
    });
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [initialAttendance, staffMap]);

  const displayStaffName = (id: string | null) => {
    if (!id) return "—";
    return staffMap.get(id)?.full_name ?? "Petugas";
  };

  // --- Handlers ---

  const handleOpenAdd = () => {
    setEditing(null);
    setIsDialogOpsOpen(true);
  };

  const handleOpenEdit = (row: any) => {
    setEditing(row);
    setIsDialogOpsOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-10 h-[calc(100vh-64px)] overflow-hidden">
      <SectionHeader
        title="Presensi Petugas"
        description="Kelola absensi harian klinik."
        icon={Calendar}
        actionLabel="Tambah presensi"
        onAction={handleOpenAdd}
      />

      {/* Main table Section */}
      <div className="flex-1 min-h-0">
        {/* Mobile Card View */}
        <AttendanceListMobile
          groupedAttendance={groupedAttendance}
          roles={roles}
          displayStaffName={displayStaffName}
          handleOpenEdit={handleOpenEdit}
          setDeleteTarget={setDeleteTarget}
          setIsAlertDeleteOpen={setIsAlertDeleteOpen}
        />

        {/* Desktop View */}
        <AttendanceListDesktop
          groupedAttendance={groupedAttendance}
          roles={roles}
          displayStaffName={displayStaffName}
          handleOpenEdit={handleOpenEdit}
          setDeleteTarget={setDeleteTarget}
          setIsAlertDeleteOpen={setIsAlertDeleteOpen}
        />
      </div>

      {/* Form Dialog */}
      <AttendanceFormDialog
        staffList={staffList}
        roles={roles.map((r) => r.role)}
        isDialogOpsOpen={isDialogOpsOpen}
        setIsDialogOpsOpen={setIsDialogOpsOpen}
        editing={editing}
      />

      {/* Delete Alert */}
      <DeleteConfirmDialog
        isAlertDeleteOpen={isAlertDeleteOpen}
        setIsAlertDeleteOpen={setIsAlertDeleteOpen}
        deleteTarget={deleteTarget}
      />
    </div>
  );
}
