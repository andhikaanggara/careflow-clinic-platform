"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseFormDialogOptions<TEditData> {
  isOpen: boolean;
  editData?: TEditData | null;
  onOpen: () => void;
  onReset: () => void;
  onOpenChange?: (open: boolean) => void;
}

interface SubmitOptions {
  successMessage: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export function useFormDialog<TEditData>({
  isOpen,
  editData,
  onOpen,
  onReset,
  onOpenChange,
}: UseFormDialogOptions<TEditData>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) onOpen();
  }, [isOpen, editData]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open) onReset();
  };

  const handleSubmit = (
    action: () => Promise<void>,
    { successMessage, errorMessage, onSuccess }: SubmitOptions,
  ) => {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
        onSuccess?.();
        onOpenChange?.(false);
        onReset();
        router.refresh();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "System error occurred.";
        toast.error(errorMessage ?? message);
      }
    });
  };

  return { isPending, handleOpenChange, handleSubmit };
}
