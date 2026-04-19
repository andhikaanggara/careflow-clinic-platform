"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Command, Plus } from "lucide-react";

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

// utils & types
import { cn } from "@/lib/utils";
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";
import { createStaff, deleteStaff, updateStaff, createRole } from "./actions";
import { set } from "date-fns";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function StaffClient({
  initialStaff,
  initialRoles,
}: {
  initialStaff: IStaff[];
  initialRoles: IRole[];
}) {
  // variable
  const router = useRouter();

  // hydration guard
  const [isMounted, setIsMounted] = useState(false);

  // states
  const [openDialog, setOpenDialog] = useState(false);
  //
  const [editing, setEditing] = useState<IStaff | null>(null);

  // form states
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // transition states
  const [isPendingSave, startSaveTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // delete dialog states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IStaff | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // sync mounting
  useEffect(() => {
    setIsMounted(true);
    if (initialRoles.length > 0 && !role) setRole("");
  }, [initialRoles, role]);
  if (!isMounted) return null;

  // --- Handler ---

  const openAddDialog = () => {
    setEditing(null);
    setName("");
    setRole("");
    setIsActive(true);
    setFormError(null);
    setOpenDialog(true);
  };

  /** Membuka dialog edit dan mengisi form dari baris yang dipilih. */
  const openEditDialog = (row: IStaff) => {
    setEditing(row);
    setName(row.full_name);
    setRole(row.role);
    setIsActive(row.is_active);
    setFormError(null);
    setOpenDialog(true);
  };

  // form handle submit untuk tambah/edit petugas
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    startSaveTransition(async () => {
      const result = editing ? await updateStaff(fd) : await createStaff(fd);
      toast.dismiss();
      if (result.error) {
        setFormError(result.error);
        toast.error(
          `Gagal ${editing ? "memperbarui" : "menambahkan"} petugas: ${result.error}`,
        );
        return;
      }
      if (result.ok) {
        setOpenDialog(false);
        setEditing(null);
        setName("");
        setRole(initialRoles.length > 0 ? initialRoles[0].role : "");
        setIsActive(true);
        router.refresh();
        toast.success(
          `Petugas berhasil ${editing ? "diperbarui" : "ditambahkan"}`,
        );
      }
    });
  };

  // funsi quick add role dari popover di form tambah/edit petugas
  const handleQuickCreateRole = async () => {
    if (!role) return;

    const fd = new FormData();
    fd.append("role", role);

    startSaveTransition(async () => {
      const result = await createRole(fd);
      if (result.ok) {
        setRole(role);
        router.refresh();
        toast.success(`Peran "${role}" berhasil ditambahkan`);
      } else if (result.error) {
        toast.error(`Gagal menambahkan peran: ${result.error}`);
      }
    });
  };

  /** Menyiapkan baris yang akan dihapus dan membuka AlertDialog konfirmasi. */
  const openDeleteDialog = (row: IStaff) => {
    setDeleteTarget(row);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  // Aller confirmation for delete staff
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setPendingDeleteId(deleteTarget.id);
    startDeleteTransition(async () => {
      const result = await deleteStaff(deleteTarget.id);
      setPendingDeleteId(null);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      /** Menutup modal dan merefresh daftar petugas di UI. */
      setDeleteOpen(false);
      setDeleteTarget(null);
      router.refresh();
      toast.success(`Petugas "${deleteTarget.full_name}" berhasil dihapus`);
    });
  };

  /** Menampilkan komponen UI dengan tabel petugas dan dialog tambah/edit/hapus. */
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-medium">Manajemen petugas</h1>
          <p className="text-muted-foreground text-sm">
            Kelola daftar petugas klinik.
          </p>
        </div>
        <div>
          <Button
            type="button"
            onClick={openAddDialog}
            className="shrink-0 cursor-pointer"
          >
            Tambah petugas
          </Button>
        </div>
      </div>

      {/* table */}
      <div className="rounded-xl border border-border bg-background ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center w-35">Aksi</TableHead>
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
              initialStaff.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.full_name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.is_active ? "Aktif" : "Nonaktif"}
                  </TableCell>
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
                        disabled={pendingDeleteId === row.id && isPendingDelete}
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

      {/* add/edit Dialog */}
      <Dialog
        open={openDialog}
        onOpenChange={(next) => {
          setOpenDialog(next);
          if (!next) {
            setEditing(null);
            setFormError(null);
          }
        }}
        modal={true}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit petugas" : "Tambah petugas"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Ubah nama, peran, atau status aktif petugas."
                : "Isi nama dan pilih peran petugas baru."}
            </DialogDescription>
          </DialogHeader>

          {/* Form tambah/edit petugas dengan nama, peran, dan status aktif.  */}
          <form onSubmit={handleFormSubmit} className="grid gap-4">
            {editing ? (
              <input type="hidden" name="id" value={editing.id} />
            ) : null}
            <input
              type="hidden"
              name="is_active"
              value={isActive ? "true" : "false"}
            />

            <div className="grid gap-2">
              {/* input field untuk nama petugas */}
              <label htmlFor="staff-name" className="text-sm font-medium">
                Nama
              </label>
              <Input
                id="staff-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                required
                autoComplete="name"
              />
            </div>

            {/* input field untuk peran petugas */}
            <div className="grid gap-2">
              <span className="text-sm font-medium">Peran</span>
              <input type="hidden" name="role" value={role} />

              <Combobox items={initialRoles} modal={false}>
                <ComboboxInput
                  placeholder="Pilih atau ketik peran"
                  value={role || ""}
                  onChange={(e) => setRole(e.target.value)}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full h-8 text-xs cursor-pointer"
                      onClick={handleQuickCreateRole}
                      disabled={isPendingSave || !role}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Tambah "{role}"
                    </Button>
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(value) => (
                      <ComboboxItem
                        key={value.id}
                        value={value.role}
                        onClick={(e) => setRole(value.role)}
                      >
                        {value.role}
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
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Petugas aktif
            </label>

            {/* Menampilkan pesan error jika ada */}
            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}

            {/* Tombol batal dan simpan */}
            <DialogFooter className="border-0 bg-transparent sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpenDialog(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isPendingSave}
              >
                {isPendingSave ? "Menyimpan…" : editing ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          /* Reset target hapus dan error ketika modal ditutup tanpa menghapus */
          if (!next) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
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
              onClick={confirmDelete}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
