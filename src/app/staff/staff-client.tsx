"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Edit3, Plus, Trash2, Users } from "lucide-react";

// ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/section-header";
import { StaffTableShell } from "./_components/staff-table-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

// utils & types
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";
import { createStaff, deleteStaff, updateStaff, createRole } from "./actions";

export default function StaffClient({
  initialStaff,
  initialRoles,
}: {
  initialStaff: IStaff[];
  initialRoles: IRole[];
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // --- UI States ---
  const [isDialogOpsOpen, setIsDialogOpsOpen] = useState(false);
  const [isAllertDeleteOpen, setIsAlertDeleteOpen] = useState(false);

  // --- Data states ---
  const [editingStaff, setEditingStaff] = useState<IStaff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IStaff | null>(null);

  // --- Form states ---
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    is_active: true,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Transitions ---
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  // --- Handler ---
  const resetForm = () => {
    setFormData({ name: "", role: "", is_active: true });
    setEditingStaff(null);
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpsOpen(true);
  };

  const handleOpenEdit = (staff: IStaff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.full_name,
      role: staff.role,
      is_active: staff.is_active,
    });
    setIsDialogOpsOpen(true);
  };

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editingStaff
        ? await updateStaff(fd)
        : await createStaff(fd);

      if (result.error) {
        const isAuthError =
          result.error.toLowerCase().includes("expired") ||
          result.error.toLowerCase().includes("claims");

        if (isAuthError) {
          toast.error("Sesi Anda telah habis, silakan login kembali.");
          window.location.href = "/login?error=session_expired";
          return;
        }

        setErrorMsg(result.error);
        toast.error(
          `Gagal ${editingStaff ? "memperbarui" : "menambahkan"} petugas: ${result.error}`,
        );
        return;
      } else {
        setIsDialogOpsOpen(false);
        resetForm();
        router.refresh();
        toast.success(
          `Petugas berhasil ${editingStaff ? "diperbarui" : "ditambahkan"}`,
        );
      }
    });
  };

  const handleQuickAddRole = async () => {
    if (!formData.role) return;
    const fd = new FormData();
    fd.append("role", formData.role);

    startTransition(async () => {
      const result = await createRole(fd);
      if (result.error) toast.error(`Gagal menambahkan peran: ${result.error}`);
      else {
        setFormData({ ...formData, role: formData.role });
        router.refresh();
        toast.success(`Peran "${formData.role}" berhasil ditambahkan`);
      }
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;

    setIsAlertDeleteOpen(false);

    startTransition(async () => {
      const result = await deleteStaff(deleteTarget.id);

      if (result.error) {
        toast.error(
          "Gagal menghapus petugas: petugas memiliki absensi terkait, kamu hanya bisa menonaktifkan petugas tersebut.",
          { duration: 8000 },
        );
      } else {
        setIsAlertDeleteOpen(false);
        setDeleteTarget(null);
        router.refresh();
        toast.success(`Petugas "${deleteTarget.full_name}" berhasil dihapus`);
      }
    });
  };

  /** Menampilkan komponen UI dengan tabel petugas dan dialog tambah/edit/hapus. */
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-10 h-[calc(100vh-64px)] overflow-hidden">
      {/* Header Section */}
      <SectionHeader
        title="Manajemen Petugas"
        description="Kelola daftar petugas klinik."
        icon={Users}
        actionLabel="Tambah petugas"
        onAction={handleOpenAdd}
      />

      {/* Main table Section */}
      <div className="flex-1 min-h-0">
        {/* Mobile View: Tampil Card */}
        <div className="grid grid-cols-1 gap-4 md:hidden overflow-auto max-h-full relative">
          {initialStaff.map((staff) => (
            <div key={staff.id} className="p-4 border rounded-lg shadow-sm">
              <div className="font-bold">{staff.full_name}</div>
              <div className="text-sm text-muted-foreground flex gap-2">
                {staff.role}
                <div
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    staff.is_active
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {staff.is_active ? "Aktif" : "Nonaktif"}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleOpenEdit(staff)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="cursor-pointer"
                  disabled={isPending}
                  onClick={() => {
                    setDeleteTarget(staff);
                    setIsAlertDeleteOpen(true);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Tampil Table */}
        <div className="hidden md:block overflow-auto h-full relative">
          <StaffTableShell>
            {/* Menampilkan pesan jika belum ada petugas. */}
            {initialStaff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  Belum ada petugas. Tambahkan dari tombol di atas.
                </TableCell>
              </TableRow>
            ) : (
              /** Menampilkan tabel petugas dengan nama, peran, status, dan aksi. */
              initialStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    {staff.full_name}
                  </TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {staff.is_active ? "Aktif" : "Nonaktif"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleOpenEdit(staff)}
                      >
                        <Edit3 className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        disabled={isPending}
                        onClick={() => {
                          setDeleteTarget(staff);
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
          </StaffTableShell>
        </div>
      </div>

      {/* add/edit Dialog */}
      <Dialog
        open={isDialogOpsOpen}
        onOpenChange={(next) => {
          setIsDialogOpsOpen(next);
          if (!next) {
            setEditingStaff(null);
            setErrorMsg(null);
          }
        }}
        modal={true}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit petugas" : "Tambah petugas"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Ubah nama, peran, atau status aktif petugas."
                : "Isi nama dan pilih peran petugas baru."}
            </DialogDescription>
          </DialogHeader>

          {/* Form tambah/edit petugas dengan nama, peran, dan status aktif.  */}
          <form onSubmit={onFormSubmit} className="grid gap-4">
            {editingStaff ? (
              <input type="hidden" name="id" value={editingStaff.id} />
            ) : null}
            <input
              type="hidden"
              name="is_active"
              value={formData.is_active ? "true" : "false"}
            />

            <div className="grid gap-2">
              {/* input field untuk nama petugas */}
              <label htmlFor="staff-name" className="text-sm font-medium">
                Nama
              </label>
              <Input
                id="staff-name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama lengkap"
                required
                autoComplete="name"
              />
            </div>

            {/* input field untuk peran petugas */}
            <div className="grid gap-2">
              <span className="text-sm font-medium">Peran</span>
              <input type="hidden" name="role" value={formData.role} />

              <Combobox items={initialRoles} modal={false}>
                <ComboboxInput
                  placeholder="Pilih atau ketik peran"
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
                <ComboboxContent className="pointer-events-auto">
                  <ComboboxEmpty>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full h-8 text-xs cursor-pointer"
                      onClick={handleQuickAddRole}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Tambah "{formData.role}"
                    </Button>
                  </ComboboxEmpty>
                  <ComboboxList className="max-h-43 overflow-y-auto border rounded-md shadow-sm bg-popover">
                    {(item) => (
                      <ComboboxItem
                        key={item.id}
                        value={item.role}
                        onClick={(e) =>
                          setFormData({ ...formData, role: item.role })
                        }
                      >
                        {item.role}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {/* Checkbox status aktif petugas */}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="size-4 rounded border-input"
              />
              Petugas aktif
            </label>

            {/* Menampilkan pesan error jika ada */}
            {errorMsg ? (
              <p className="text-destructive text-sm" role="alert">
                {errorMsg}
              </p>
            ) : null}

            {/* Tombol batal dan simpan */}
            <DialogFooter className="border-0 bg-transparent sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setIsDialogOpsOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Menyimpan…" : editingStaff ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={isAllertDeleteOpen}
        onOpenChange={setIsAlertDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus petugas?</AlertDialogTitle>
            <AlertDialogDescription>
              Petugas{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.full_name ?? "-"}
              </span>{" "}
              akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              variant="destructive"
              onClick={onConfirmDelete}
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
