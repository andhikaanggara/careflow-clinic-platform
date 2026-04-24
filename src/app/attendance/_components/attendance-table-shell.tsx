import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IRole } from "@/type/role";

interface AttendanceTableShellProps {
  children: React.ReactNode;
  roles: IRole[];
}

export function AttendanceTableShell({
  children,
  roles,
}: AttendanceTableShellProps) {
  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-auto h-full relative">
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="font-semibold ">Tanggal</TableHead>
            <TableHead className="font-semibold ">Shift</TableHead>
            {roles.map((r) => (
              <TableHead key={r.role} className="font-semibold  min-w-30">
                {r.role}
              </TableHead>
            ))}
            <TableHead className="text-center w-32 font-semibold whitespace-nowrap">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}
