import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/section-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "lucide-react";
import { AttendanceTableShell } from "./_components/attendance-table-shell";

export default function AttendanceLoading() {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-10 h-[calc(100vh-64px)] overflow-hidden">
      {/* Skeleton Header */}
      <SectionHeader
        title="Presensi Petugas"
        description="Kelola absensi harian klinik."
        icon={Calendar}
        actionLabel="Tambah presensi"
      />

      {/* Desktop Skeleton Table */}
      <div className="rounded-xl border border-border bg-background ring-1 ring-foreground/10 hidden md:block h-full">
        <AttendanceTableShell roles={[]}>
          {Array.from({ length: 2 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </AttendanceTableShell>
      </div>
    </div>
  );
}
