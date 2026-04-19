"use client";

// import library
import { format, set } from "date-fns";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";

// import UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAttendance,
  updateAttendance,
  delleteAttendance,
} from "./actions";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

// import type
import type { IAttendanceRow } from "@/type/attendance";
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// state
const SHIFTS = ["Pagi", "Sore", "Malam"] as const;

// type
type AttendanceClientProps = {
  initialAttendance: IAttendanceRow[];
  staffList: IStaff[];
  roles: IRole[];
};

// functions

// state awal untuk pilih petugas form kosong
function emptyRoleSelections(): Record<
  string,
  string | { id: string; name: string }
> {
  return {};
}

// fungsi menentukan shift default berdasarkan jam saat dialog dibuka
function shiftFromCurrentHour(): (typeof SHIFTS)[number] {
  const h = new Date().getHours();
  if (h >= 7 && h < 14) return "Pagi";
  if (h >= 14 && h < 21) return "Sore";
  return "Malam";
}

export default function AttendanceClient({
  initialAttendance,
  staffList,
  roles,
}: AttendanceClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateStr, setDateStr] = useState<string>("");
  const [shift, setShift] = useState<(typeof SHIFTS)[number]>("Pagi");
  const [roleSelections, setRoleSelections] = useState<
    Record<string, string | { id: string; name: string }>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteDialog = (row: any) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  function handleDelete() {
    if (!rowToDelete) return;

    startTransition(async () => {
      const result = await delleteAttendance(
        rowToDelete.date,
        rowToDelete.shift,
      );

      if (result.error) {
        setFormError(result.error);
        return;
      }
      setDeleteDialogOpen(false);
      setRowToDelete(null);
      router.refresh();
    });
  }

  const openEditDialog = (row: any) => {
    setEditing(row);
    setDateStr(row.date);
    setShift(row.shift);

    const initialSelections: Record<
      string,
      string | { id: string; name: string }
    > = {};

    roles.forEach(({ role }) => {
      const staffId = row[role];
      if (staffId) {
        const staffInfo = loopStaffById.get(staffId);
        initialSelections[role] = {
          id: staffId,
          name: staffInfo?.full_name ?? "Petugas tidak ditemukan",
        };
      }
    });

    setRoleSelections(initialSelections);
    setDialogOpen(true);
  };

  // map untuk lookup cepat data staff berdasarkan id, dipakai di fungsi displayStaffName. useMemo dipakai agar map hanya dibuat ulang jika staffList berubah, bukan setiap render.
  const loopStaffById = useMemo(() => {
    const m = new Map<string, IStaff>();
    for (const s of staffList) {
      m.set(s.id, s);
    }
    return m;
  }, [staffList]);

  // fungsi untuk menampilkan nama staff di tabel berdasarkan id. Jika id null atau tidak ditemukan di map, tampilkan "—" atau potongan id sebagai fallback.
  function displayStaffName(id: string | null): string {
    if (!id) return "—";
    return loopStaffById.get(id)?.full_name ?? id.slice(0, 8) + "…";
  }

  // fungsi untuk mendapatkan daftar staff yang sesuai dengan peran tertentu, dipakai untuk opsi di combobox per peran. Filter staffList berdasarkan role dan status aktif.
  function staffComboboxProps(roleLabel: string): IStaff[] {
    return staffList.filter(
      (s) => s.role === roleLabel && s.is_active !== false,
    );
  }

  // Setiap kali dialog dibuka, reset form ke nilai default: tanggal hari ini, shift berdasarkan jam saat ini, pilihan petugas kosong, dan error null.
  useEffect(() => {
    if (!dialogOpen) return;

    if (!editing) {
      setDateStr(format(new Date(), "yyyy-MM-dd"));
      setShift(shiftFromCurrentHour());
      setRoleSelections(emptyRoleSelections());
    }
    setFormError(null);
  }, [dialogOpen, editing]);

  //  Fungsi untuk update pilihan petugas per peran. Bisa dipanggil dari input manual atau klik item di dropdown, jadi menerima id dan nama terpisah. Nama dipakai untuk ditampilkan di input setelah pilih dari dropdown, karena value input adalah string nama, bukan id.
  function setRoleColumn(role: string, id: string, name: string = ""): void {
    setRoleSelections((prev) => ({ ...prev, [role]: { id, name } }));
  }

  // Saat submit form, kirim data ke server. Jika berhasil, tutup dialog dan refresh halaman; jika error, tampilkan pesan error.
  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setFormError(null);

    const fd = new FormData();
    fd.append("date", dateStr);
    fd.append("shift", shift);

    Object.values(roleSelections).forEach((selection) => {
      if (selection && typeof selection === "object" && selection.id) {
        fd.append("staff_id", selection.id);
      }
    });

    startTransition(async () => {
      const result = editing
        ? await updateAttendance(editing.date, editing.shift, fd)
        : await createAttendance(fd);

      if (result.error) {
        setFormError(result.error);
        return;
      }
      if (result.ok) {
        setDialogOpen(false);
        setEditing(null);
        router.refresh();
      }
    });
  }

  // fungsi untuk mengelompokkan data attendance berdasarkan kombinasi date-shift, sehingga setiap baris di tabel mewakili satu kombinasi date-shift dengan kolom per peran yang diisi id staff yang bertugas. Gunakan useMemo agar proses pengelompokan hanya terjadi saat initialAttendance atau loopStaffById berubah, bukan setiap render.
  const groupedAttendance = useMemo(() => {
    const groups: Record<string, any> = {};

    initialAttendance.forEach((item) => {
      const key = `${item.date}-${item.shift}`;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          date: item.date,
          shift: item.shift,
        };
      }

      const staffInfo = loopStaffById.get(item.staff_id);
      if (staffInfo) {
        groups[key][staffInfo.role] = item.staff_id;
      }
    });
    return Object.values(groups);
  }, [initialAttendance, loopStaffById]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      {/* Bagian atas: judul kiri + tombol kanan */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-medium">Presensi Petugas</h1>
          <p className="text-muted-foreground text-sm">
            Kelola absensi petugas klinik.
          </p>
        </div>
        <div>
          <Button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            Tambah presensi
          </Button>
        </div>
      </div>

      {/* Bagian bawah: tabel */}
      <div className="rounded-xl border border-border bg-background ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Shift</TableHead>
              {roles.map((r) => (
                <TableHead key={r.role} className="min-w-30">
                  {r.role}
                </TableHead>
              ))}
              <TableHead className="text-center w-35">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedAttendance.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2 + roles.length}
                  className="text-muted-foreground text-center"
                >
                  Belum ada data presensi.
                </TableCell>
              </TableRow>
            ) : (
              groupedAttendance.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">
                    {row.date}
                  </TableCell>
                  <TableCell>{row.shift}</TableCell>
                  {roles.map(({ role }) => (
                    <TableCell key={role} className="text-sm">
                      {displayStaffName(
                        role in row
                          ? String(
                              (row as unknown as Record<string, unknown>)[role],
                            )
                          : null,
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-around gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => openEditDialog(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        disabled={isPending}
                        onClick={() => openDeleteDialog(row)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog form tambah presensi */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => {
          setDialogOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Tambah"} presensi</DialogTitle>
            <DialogDescription>
              {editing
                ? "Ubah data presensi petugas untuk tanggal dan shift ini."
                : "Isi data presensi petugas untuk tanggal dan shift tertentu."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Tanggal */}
            <div className="grid gap-2">
              <label htmlFor="att-date" className="text-sm font-medium">
                Tanggal
              </label>
              <Input
                id="att-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
                disabled={!!editing}
              />
            </div>

            {/* Shift */}
            <div className="grid gap-2">
              <span className="text-sm font-medium">Shift</span>
              <Select
                disabled={!!editing}
                value={shift}
                onValueChange={(v) => setShift(v as (typeof SHIFTS)[number])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih shift" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {SHIFTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Default shift mengikuti jam sekarang
              </p>
            </div>

            {/* Petugas per peran */}
            {roles.map(({ role }) => {
              const RoleAssignment = staffComboboxProps(role);
              const currentSelection = roleSelections[role];
              const displayName =
                typeof currentSelection === "object"
                  ? currentSelection.name
                  : "";

              return (
                <div key={role} className="grid gap-2">
                  <span className="text-sm font-medium">{role}</span>
                  <Combobox items={RoleAssignment} modal={false}>
                    <ComboboxInput
                      placeholder={`Pilih ${role}`}
                      value={displayName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setRoleSelections((prev) => ({
                            ...prev,
                            [role]: {
                              id: "",
                              name: "",
                            },
                          }));
                        } else {
                          setRoleSelections((prev) => ({
                            ...prev,
                            [role]: {
                              id: (prev[role] as any)?.id || "",
                              name: val,
                            },
                          }));
                        }
                      }}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Petugas tidak ditemukan</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem
                            key={item.id}
                            value={item.full_name}
                            onClick={() =>
                              setRoleColumn(role, item.id, item.full_name)
                            }
                          >
                            {item.full_name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              );
            })}

            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}

            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(next) => {
          setDeleteDialogOpen(next);
          /* Reset target hapus dan error ketika modal ditutup tanpa menghapus */
          if (!next) {
            setRowToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus absensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Absensi{" "}
              <span className="font-medium text-foreground">
                {rowToDelete?.date ?? ""}
              </span>{" "}
              Shift{" "}
              <span className="font-medium text-foreground">
                {rowToDelete?.shift ?? ""}
              </span>{" "}
              akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteError}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
