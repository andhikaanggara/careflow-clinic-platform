"use client";

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

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName: string;
  entityName?: string;
  onConfirm: () => void;
  isPending: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onOpenChange,
  itemName,
  entityName,
  onConfirm,
  isPending,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Hapus ${entityName} ?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {entityName}{" "}
            <span className="font-medium text-foreground">
              {itemName || "-"}
            </span>{" "}
            akan dihapus permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? "Menghapus…" : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
