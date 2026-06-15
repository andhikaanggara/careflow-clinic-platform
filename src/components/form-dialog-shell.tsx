"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogShellProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  isPending: boolean;
  submitLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  formId: string;
  children: React.ReactNode;
  contentClassName?: string;
  showCloseButton?: boolean;
}

export function FormDialogShell({
  isOpen,
  onOpenChange,
  title,
  description,
  isPending,
  submitLabel,
  pendingLabel = "Saving...",
  cancelLabel = "Cancel",
  formId,
  children,
  contentClassName,
  showCloseButton,
}: FormDialogShellProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={contentClassName}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}