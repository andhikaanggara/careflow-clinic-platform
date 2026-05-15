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
import { delleteVisits } from "../actions";
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
      const res = await delleteVisits(deleteTarget.id);
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
          <AlertDialogTitle>Hapus Visit Pasien ?</AlertDialogTitle>
          <AlertDialogDescription>
            Pasien{" "}
            <span className="font-bold">
              {deleteTarget?.patients.patient_name}
            </span>
            <br />
            tanggal{" "}
            <span className="font-bold">
              {deleteTarget?.date && formatDateIndo(deleteTarget.date)}
            </span>{" "}
            shift <span className="font-bold">{deleteTarget?.shift}</span> akan
            dihapus.
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
