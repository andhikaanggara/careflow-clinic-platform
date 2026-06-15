"use client";

import { FormEvent, useState } from "react";
import { format } from "date-fns";

import { createAttendance, updateAttendance } from "../actions";
import { useFormDialog } from "@/hooks/use-form-dialog";
import { FormDialogShell } from "@/components/form-dialog-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { IStaff } from "@/type/staff";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Shift = "Pagi" | "Sore" | "Malam";

type EditingAttendance = { date: string; shift: string } & Record<
  string,
  string
>;

interface AttendanceFormProps {
  isDialogOpsOpen: boolean;
  setIsDialogOpsOpen: (open: boolean) => void;
  editing: EditingAttendance | null;
  roles: string[];
  staffList: IStaff[];
}

const SHIFTS: Shift[] = ["Pagi", "Sore", "Malam"];

const FORM_ID = "attendanceForm";

function getShiftDefault(): Shift {
  const h = new Date().getHours();
  if (h >= 7 && h < 14) return "Pagi";
  if (h >= 14 && h < 21) return "Sore";
  return "Malam";
}

export function AttendanceForm({
  isDialogOpsOpen,
  setIsDialogOpsOpen,
  editing,
  roles,
  staffList,
}: AttendanceFormProps) {
  const isEditMode = editing !== null;

  const [dateStr, setDateStr] = useState("");
  const [shift, setShift] = useState<Shift>(getShiftDefault);
  const [roleSelections, setRoleSelections] = useState<
    Record<string, { id: string; name: string } | undefined>
  >({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isPending, handleOpenChange, handleSubmit } =
    useFormDialog<EditingAttendance>({
      isOpen: isDialogOpsOpen,
      editData: editing,
      onOpen: () => {
        setErrorMsg(null);
        if (isEditMode) {
          setDateStr(editing.date);
          setShift(editing.shift as Shift);
          setRoleSelections(
            buildInitialRoleSelections(editing, roles, staffList),
          );
        } else {
          setDateStr(format(new Date(), "yyyy-MM-dd"));
          setShift(getShiftDefault());
          setRoleSelections({});
        }
      },
      onReset: () => {
        setDateStr("");
        setShift(getShiftDefault());
        setRoleSelections({});
        setErrorMsg(null);
      },
      onOpenChange: setIsDialogOpsOpen,
    });

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const fd = buildFormData(dateStr, shift, roleSelections);

    handleSubmit(
      async () => {
        const res = isEditMode
          ? await updateAttendance(editing.date, editing.shift, fd)
          : await createAttendance(fd);

        if (res.error) {
          setErrorMsg(res.error);
          throw new Error(res.error);
        }
      },
      { successMessage: "Presensi berhasil disimpan" },
    );
  };

  return (
    <FormDialogShell
      isOpen={isDialogOpsOpen}
      onOpenChange={handleOpenChange}
      title={`${isEditMode ? "Edit" : "Tambah"} Presensi`}
      description="Input data petugas sesuai shift."
      isPending={isPending}
      submitLabel="Simpan"
      formId={FORM_ID}
      contentClassName="max-h-[90vh] overflow-y-auto sm:max-w-lg"
    >
      <form onSubmit={onFormSubmit} id={FORM_ID} className="grid gap-4">
        <div className="flex justify-between items-end">
          <div className="flex gap-4">
            <div className="grid gap-2 col-span-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                disabled={isEditMode}
                required
              />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Shift</Label>
              <Select
                disabled={isEditMode}
                value={shift}
                onValueChange={(v) => setShift(v as Shift)}
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
          {/* <Button type="button">
            <Plus />
            Tambah Staff
          </Button> */}
        </div>

        {roles.map((role) => (
          <RoleCombobox
            key={role}
            role={role}
            staffList={staffList}
            selection={roleSelections[role]}
            onSelect={(selection) =>
              setRoleSelections((prev) => ({ ...prev, [role]: selection }))
            }
          />
        ))}

        {errorMsg && (
          <p className="text-destructive text-sm font-medium">{errorMsg}</p>
        )}
      </form>
    </FormDialogShell>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

interface RoleComboboxProps {
  role: string;
  staffList: IStaff[];
  selection: { id: string; name: string } | undefined;
  onSelect: (selection: { id: string; name: string }) => void;
}

function RoleCombobox({
  role,
  staffList,
  selection,
  onSelect,
}: RoleComboboxProps) {
  const filtered = staffList.filter(
    (s) => s.roles?.role_name === role && s.is_active,
  );

  return (
    <div className="grid gap-2">
      <Label>{role}</Label>
      <Combobox items={filtered} modal={false}>
        <ComboboxInput
          placeholder={`Pilih ${role}`}
          value={selection?.name ?? ""}
          onChange={(e) =>
            onSelect({ id: selection?.id ?? "", name: e.target.value })
          }
        />
        <ComboboxContent>
          <ComboboxEmpty>Petugas tidak ditemukan</ComboboxEmpty>
          <ComboboxList>
            {(item: IStaff) => (
              <ComboboxItem
                key={item.id}
                value={item.staff_name}
                onClick={() => onSelect({ id: item.id, name: item.staff_name })}
              >
                {item.staff_name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInitialRoleSelections(
  editing: EditingAttendance,
  roles: string[],
  staffList: IStaff[],
) {
  return Object.fromEntries(
    roles.flatMap((role) => {
      const staffId = editing[role];
      if (!staffId) return [];
      const staff = staffList.find((s) => s.id === staffId);
      return [[role, { id: staffId, name: staff?.staff_name ?? "Petugas" }]];
    }),
  );
}

function buildFormData(
  date: string,
  shift: string,
  roleSelections: Record<string, { id: string; name: string } | undefined>,
) {
  const fd = new FormData();
  fd.append("date", date);
  fd.append("shift", shift);
  Object.values(roleSelections).forEach((sel) => {
    if (sel?.id) fd.append("staff_id", sel.id);
  });
  return fd;
}
