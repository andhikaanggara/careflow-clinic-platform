"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Edit3, Plus, Trash2, Users } from "lucide-react";

// ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { set } from "date-fns";

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

  useEffect(() => () => setIsMounted(true), []);
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

    startTransition(async () => {
      const result = await deleteStaff(deleteTarget.id);
      if (result.error) {
        toast.error(
          `Gagal menghapus petugas: petugas memiliki absensi terkait, nonaktifkan petugas tersebut. Detail: ${result.error}`,
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
    <div className="mx-auto flex w-full flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Manajemen petugas
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola daftar petugas klinik.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleOpenAdd}
          className="shrink-0 cursor-pointer"
        >
          Tambah petugas
        </Button>
      </div>

      {/* Main table Section */}
      <div className="rounded-xl border border-border bg-background ring-1 ring-foreground/10">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Nama</TableHead>
              <TableHead className="font-semibold">Peran</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-center w-35 font-semibold">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                    <div className="flex justify-around gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleOpenEdit(staff)}
                      >
                        <Edit3 className="mr-2 h-3 w-3 text-blue-600" />
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
                        <Trash2 className="mr-2 h-3 w-3" />
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
                    setFormData({ ...formData, role: formData.role })
                  }
                />
                <ComboboxContent>
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
                  <ComboboxList>
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
        onOpenChange={(next) => {
          setIsAlertDeleteOpen;
        }}
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
