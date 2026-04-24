import { SectionHeader } from "@/components/section-header";
import { StaffTableShell } from "./_components/staff-table-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";
import { Users } from "lucide-react";

export default function StaffLoading() {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-10 h-[calc(100vh-64px)] overflow-hidden">
      {/* Header Section */}
      <SectionHeader
        title="Manajemen Petugas"
        description="Kelola daftar petugas klinik."
        icon={Users}
        actionLabel="Tambah petugas"
      />

      {/* Main table Section */}
      <div className="rounded-xl border border-border bg-background ring-1 ring-foreground/10 hidden md:block h-full">
        <StaffTableShell>
          {Array.from({ length: 2 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </StaffTableShell>
      </div>
    </div>
  );
}
