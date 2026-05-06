import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateIndo } from "@/lib/utils/format";
import type { IRole } from "@/type/role";

interface MobileProps {
  groupedAttendance: any[]; // Data yang sudah di-group
  roles: IRole[];
  displayStaffName: (id: string | null) => string;
  handleOpenEdit: (row: any) => void;
  setDeleteTarget: (row: any) => void;
  setIsAlertDeleteOpen: (open: boolean) => void;
}

export function AttendanceListMobile({
  groupedAttendance,
  roles,
  displayStaffName,
  handleOpenEdit,
  setDeleteTarget,
  setIsAlertDeleteOpen,
}: MobileProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden overflow-auto max-h-full relative">
      {groupedAttendance.map((row) => (
        <div
          key={row.id}
          className="p-4 border border-border bg-background rounded-xl shadow-sm space-y-3"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <div className="font-bold">{formatDateIndo(row.date)}</div>
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
              {row.shift}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {roles.map(({ role }) => (
              <div key={role} className="flex flex-col">
                <span className="text-muted-foreground text-[10px] uppercase">
                  {role}
                </span>
                <span className="font-medium truncate">
                  {displayStaffName(row[role])}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenEdit(row)}
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
  );
}
