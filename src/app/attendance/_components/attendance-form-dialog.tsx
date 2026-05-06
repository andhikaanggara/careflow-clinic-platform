"use client";

import { useEffect, useState, useTransition, FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { createAttendance, updateAttendance } from "../actions";

// --- UI Component ---
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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

interface AttendanceFormDialogProps {
  isDialogOpsOpen: boolean;
  setIsDialogOpsOpen: (open: boolean) => void;
  editing: { date: string; shift: string; [key: string]: string } | null;
  roles: string[];
  staffList: any[];
}

export function AttendanceFormDialog({
  isDialogOpsOpen,
  setIsDialogOpsOpen,
  editing,
  roles,
  staffList,
}: AttendanceFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dateStr, setDateStr] = useState("");
  const [shift, setShift] = useState<string>("Pagi");
  const [roleSelections, setRoleSelections] = useState<
    Record<string, { id: string; name: string } | undefined>
  >({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const SHIFTS = ["Pagi", "Sore", "Malam"] as const;

  const getShiftDefault = () => {
    const h = new Date().getHours();
    if (h >= 7 && h < 14) return "Pagi";
    if (h >= 14 && h < 21) return "Sore";
    return "Malam";
  };

  useEffect(() => {
    if (isDialogOpsOpen) {
      if (editing) {
        // Jika sedang EDIT, isi state dengan data lama
        setDateStr(editing.date);
        setShift(editing.shift);

        const initial: any = {};
        roles.forEach((role: any) => {
          const sId = editing[role];
          if (sId) {
            const staff = staffList.find((s: any) => s.id === sId);
            initial[role] = { id: sId, name: staff?.full_name || "Petugas" };
          }
        });
        setRoleSelections(initial);
      } else {
        // Jika sedang TAMBAH baru, reset ke default
        setDateStr(format(new Date(), "yyyy-MM-dd"));
        setShift(getShiftDefault());
        setRoleSelections({});
      }
      setErrorMsg(null);
    }
  }, [isDialogOpsOpen, editing]);

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData();
    fd.append("date", dateStr);
    fd.append("shift", shift);
    Object.values(roleSelections).forEach((sel: any) => {
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

  return (
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
                  {SHIFTS.map((s: any) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {roles.map((role: any) => (
            <div key={role} className="grid gap-2">
              <label className="text-sm font-medium">{role}</label>
              <Combobox
                items={staffList.filter(
                  (s: any) => s.role === role && s.is_active,
                )}
                modal={false}
              >
                <ComboboxInput
                  placeholder={`Pilih ${role}`}
                  value={roleSelections[role]?.name || ""}
                  onChange={(e) =>
                    setRoleSelections({
                      ...roleSelections,
                      [role]: {
                        id: roleSelections[role]?.id || "",
                        name: e.target.value,
                      },
                    })
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
                          setRoleSelections({
                            ...roleSelections,
                            [role]: { id: item.id, name: item.full_name },
                          })
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
  );
}
