"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { Calendar, Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/section-header";
import { AttendanceTableShell } from "./_components/attendance-table-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

// Actions & Types
import {
  createAttendance,
  updateAttendance,
  delleteAttendance,
} from "./actions";
import type { IRole } from "@/type/role";
import type { IStaff } from "@/type/staff";
import type { IAttendanceRow } from "@/type/attendance";

const SHIFTS = ["Pagi", "Sore", "Malam"] as const;

export default function AttendanceClient({
  initialAttendance,
  staffList,
  roles,
}: {
  initialAttendance: IAttendanceRow[];
  staffList: IStaff[];
  roles: IRole[];
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // --- UI States ---
  const [isDialogOpsOpen, setIsDialogOpsOpen] = useState(false);
  const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);

  // --- Data States ---
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [dateStr, setDateStr] = useState("");
  const [shift, setShift] = useState<(typeof SHIFTS)[number]>("Pagi");
  const [roleSelections, setRoleSelections] = useState<
    Record<string, { id: string; name: string }>
  >({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Transition ---
  const [isPending, startTransition] = useTransition();

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

  const getShiftDefault = () => {
    const h = new Date().getHours();
    if (h >= 7 && h < 14) return "Pagi";
    if (h >= 14 && h < 21) return "Sore";
    return "Malam";
  };

  const displayStaffName = (id: string | null) => {
    if (!id) return "—";
    return staffMap.get(id)?.full_name ?? "Petugas";
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  // --- Handlers ---
  const resetForm = () => {
    setEditing(null);
    setDateStr(format(new Date(), "yyyy-MM-dd"));
    setShift(getShiftDefault());
    setRoleSelections({});
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpsOpen(true);
  };

  const handleOpenEdit = (row: any) => {
    setEditing(row);
    setDateStr(row.date);
    setShift(row.shift);
    const initial: any = {};
    roles.forEach(({ role }) => {
      const sId = row[role];
      if (sId) initial[role] = { id: sId, name: displayStaffName(sId) };
    });
    setRoleSelections(initial);
    setIsDialogOpsOpen(true);
  };

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData();
    fd.append("date", dateStr);
    fd.append("shift", shift);
    Object.values(roleSelections).forEach((sel) => {
      if (sel?.id) fd.append("staff_id", sel.id);
    });

    startTransition(async () => {
      const res = editing
        ? await updateAttendance(editing.date, editing.shift, fd)
        : await createAttendance(fd);

      if (res.error) {
        setErrorMsg(res.error);
        toast.error("Gagal menyimpan presensi");
      } else {
        setIsDialogOpsOpen(false);
        router.refresh();
        toast.success("Presensi berhasil disimpan");
      }
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await delleteAttendance(
        deleteTarget.date,
        deleteTarget.shift,
      );
      if (res.error) toast.error(res.error);
      else {
        setIsAlertDeleteOpen(false);
        router.refresh();
        toast.success("Presensi berhasil dihapus");
      }
    });
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

      {/* Main table Sectio */}
      <div className="flex-1 min-h-0">
        {/* Mobile Card View */}
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

        {/* Desktop View */}
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
                    <TableCell
                      key={role}
                      className="text-sm truncate max-w-37.5"
                    >
                      {displayStaffName(row[role])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(row)}
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
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpsOpen} onOpenChange={setIsDialogOpsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Tambah"} Presensi</DialogTitle>
            <DialogDescription>
              Input data petugas sesuai shift.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onFormSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tanggal</label>
                <Input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  disabled={!!editing}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Shift</label>
                <Select
                  disabled={!!editing}
                  value={shift}
                  onValueChange={(v: any) => setShift(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {roles.map(({ role }) => (
              <div key={role} className="grid gap-2">
                <label className="text-sm font-medium">{role}</label>
                <Combobox
                  items={staffList.filter(
                    (s) => s.role === role && s.is_active,
                  )}
                  modal={false}
                >
                  <ComboboxInput
                    placeholder={`Pilih ${role}`}
                    value={roleSelections[role]?.name || ""}
                    onChange={(e) =>
                      setRoleSelections((prev) => ({
                        ...prev,
                        [role]: {
                          id: prev[role]?.id || "",
                          name: e.target.value,
                        },
                      }))
                    }
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Petugas tidak ditemukan</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem
                          key={item.id}
                          value={item.full_name}
                          onClick={() =>
                            setRoleSelections((prev) => ({
                              ...prev,
                              [role]: { id: item.id, name: item.full_name },
                            }))
                          }
                        >
                          {item.full_name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            ))}

            {errorMsg && (
              <p className="text-destructive text-sm font-medium">{errorMsg}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpsOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isAlertDeleteOpen} onOpenChange={setIsAlertDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Presensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Data {deleteTarget?.date && formatDateIndo(deleteTarget.date)}{" "}
              shift {deleteTarget?.shift} akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onConfirmDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
