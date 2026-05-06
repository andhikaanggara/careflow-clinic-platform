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
import { formatDateIndo } from "@/lib/utils/format";
import { startTransition } from "react";
import { delleteAttendance } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface IDeleteConfirmDialog {
  isAlertDeleteOpen: any;
  setIsAlertDeleteOpen: any;
  deleteTarget: any;
}

export function DeleteConfirmDialog({
  isAlertDeleteOpen,
  setIsAlertDeleteOpen,
  deleteTarget,
}: IDeleteConfirmDialog) {
  const router = useRouter();

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

  return (
    <AlertDialog open={isAlertDeleteOpen} onOpenChange={setIsAlertDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Presensi?</AlertDialogTitle>
          <AlertDialogDescription>
            Data {deleteTarget?.date && formatDateIndo(deleteTarget.date)} shift{" "}
            {deleteTarget?.shift} akan dihapus.
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
  );
}
