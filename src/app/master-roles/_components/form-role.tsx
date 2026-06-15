"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createRole, updateRole } from "../action";
import { roleSchema } from "../schema";
import { useFormDialog } from "@/hooks/use-form-dialog";
import { FormDialogShell } from "@/components/form-dialog-shell";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type RoleSchema = z.infer<typeof roleSchema>;

interface RoleFormProps {
  onSubmitSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editData?: RoleSchema | null;
}

const FORM_ID = "roleForm";

const DEFAULT_VALUES: RoleSchema = {
  role_name: "",
  is_active: true,
};

export function RoleForm({
  onSubmitSuccess,
  isOpen = false,
  onOpenChange,
  editData,
}: RoleFormProps) {
  const isEditMode = !!editData;

  const form = useForm<RoleSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { isPending, handleOpenChange, handleSubmit } =
    useFormDialog<RoleSchema>({
      isOpen,
      editData,
      onOpen: () => form.reset(isEditMode ? editData! : DEFAULT_VALUES),
      onReset: () => form.reset(DEFAULT_VALUES),
      onOpenChange,
    });

  const processSubmit = form.handleSubmit((data) =>
    handleSubmit(
      async () => {
        const result = isEditMode
          ? await updateRole({
              id: data.id!,
              role_name: data.role_name,
              is_active: data.is_active,
            })
          : await createRole(data);

        if (result?.error) throw new Error(result.error);
        if (!isEditMode && !result?.ok)
          throw new Error(result?.error ?? "Gagal menyimpan data baru.");

        onSubmitSuccess?.();
      },
      {
        successMessage: isEditMode
          ? "Role updated successfully!"
          : "Role created successfully!",
      },
    ),
  );

  return (
    <FormDialogShell
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "Update Role" : "Create Role"}
      description={
        isEditMode
          ? "Make changes to the Role details below."
          : "Fill in the details below to create a new Role."
      }
      isPending={isPending}
      submitLabel={isEditMode ? "Save Changes" : "Save Role"}
      cancelLabel="Cancel"
      formId={FORM_ID}
      showCloseButton
    >
      <form onSubmit={processSubmit} id={FORM_ID}>
        <FieldGroup>
          <Controller
            name="role_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Role Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="is_active"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <Checkbox
                  id="is_active"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="is_active">Is Active</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </FormDialogShell>
  );
}
