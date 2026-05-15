import { TableCell, TableRow } from "@/components/ui/table";
import { AttendanceTableShell } from "./attendance-table-shell";
import { formatDateIndo } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import { IRole } from "@/type/role";

interface MobileProps {
  groupedAttendance: any[]; // Data yang sudah di-group
  roles: IRole[];
  displayStaffName: (id: string | null) => string;
  handleOpenEdit: (row: any) => void;
  setDeleteTarget: (row: any) => void;
  setIsAlertDeleteOpen: (open: boolean) => void;
}

export function AttendanceListDesktop({
  groupedAttendance,
  roles,
  displayStaffName,
  handleOpenEdit,
  setDeleteTarget,
  setIsAlertDeleteOpen,
}: MobileProps) {
  return (
    <div className="hidden md:block overflow-auto h-full relative">
      <AttendanceTableShell roles={roles}>
        {groupedAttendance.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3 + roles.length}
              className="text-center text-muted-foreground h-32"
            >
              Belum ada data presensi.
            </TableCell>
          </TableRow>
        ) : (
          groupedAttendance.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {formatDateIndo(row.date)}
              </TableCell>
              <TableCell>{row.shift}</TableCell>
              {roles.map(({ role }) => (
                <TableCell key={role} className="text-sm truncate max-w-37.5">
                  {displayStaffName(row[role])}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(row)}
                    className="cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3 text-blue-600" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeleteTarget(row);
                      setIsAlertDeleteOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </AttendanceTableShell>
    </div>
  );
}
