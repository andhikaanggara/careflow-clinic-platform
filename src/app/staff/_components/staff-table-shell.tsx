import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StaffTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-auto max-h-full relative">
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="font-semibold">Nama</TableHead>
            <TableHead className="font-semibold">Peran</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-center w-32 font-semibold">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}
