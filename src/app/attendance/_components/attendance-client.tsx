"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Edit3, Trash2 } from "lucide-react";

// UI Components
import { SectionHeader } from "@/components/section/section-header";
import { SectionTable, TableColumn } from "@/components/section/section-table";

// Actions & Types
import type { IRole } from "@/type/role";
import type { IStaff } from "@/type/staff";
import { DeleteConfirmDialog } from "./detele-confirm-dialog";
import { AttendanceForm } from "./attendance-form";
import { AttendanceSchema } from "./schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IAttendanceRow } from "@/type/attendance";
import { formatDateIndo } from "@/lib/utils/format";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);

  // --- Data States ---
  const [selected, setSelected] = useState<any>(null);
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
      if (staffInfo && staffInfo.roles) {
        const roleName = staffInfo.roles.role_name;
        groups[key][roleName] = staffInfo.staff_name;
        groups[key][`id_${roleName}`] = item.staff_id;
      }
    });
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [initialAttendance, staffMap]);

  const HEADER: TableColumn<any>[] = [
    {
      header: "Date",
      accessor: (d) => formatDateIndo(d.date),
    },
    {
      header: "Shift",
      accessor: "shift",
    },
    ...roles.map((role) => ({
      header: role.role_name,
      accessor: (d: any) => d[role.role_name] || "-",
    })),
  ];

  const handleOpenAdd = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (row: any) => {
    const formData = {
      date: row.date,
      shift: row.shift,
      ...roles.reduce(
        (acc, role) => {
          acc[role.role_name] = row[`id_${role.role_name}`];
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
    setSelected(formData);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (att: AttendanceSchema) => {
    setDeleteTarget(att);
    setIsAlertDeleteOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
      <SectionHeader
        title="Staff Attendance"
        description="Manage daily clinic attendance."
        icon={Calendar}
        actionLabel="Add attendance"
        onAction={handleOpenAdd}
      />

      <SectionTable
        data={groupedAttendance}
        header={HEADER}
        onEdit={handleEdit}
        onDelete={handleDeleteTrigger}
        mobileRender={() => (
          <div className="grid grid-cols-1 gap-4 md:hidden overflow-auto max-h-full relative">
            {groupedAttendance.map((row) => (
              <div
                key={row.id}
                className="bg-background rounded-xl shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="font-bold">{formatDateIndo(row.date)}</div>
                  <Badge>{row.shift}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {roles.map(({ role_name }) => (
                    <div key={role_name} className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] uppercase">
                        {role_name}
                      </span>
                      <span className="font-medium truncate">
                        {row[role_name] || "-"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(row)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setDeleteTarget(row);
                      setIsAlertDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      />

      {/* Form Dialog */}
      <AttendanceForm
        staffList={staffList}
        roles={roles.map((r) => r.role_name)}
        isDialogOpsOpen={isFormOpen}
        setIsDialogOpsOpen={setIsFormOpen}
        editing={selected}
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
