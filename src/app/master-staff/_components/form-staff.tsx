"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createStaff, updateStaff } from "../actions";
import { staffSchema } from "../schema";
import { IRole } from "@/type/role";
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
import { InputCombobox } from "@/components/input-combobox";
import { RoleForm } from "@/app/master-roles/_components/form-role";
import { useState } from "react";

type StaffSchema = z.infer<typeof staffSchema>;

interface StaffFormProps {
  rolesData: IRole[];
  onSubmitSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editData?: StaffSchema | null;
}

const FORM_ID = "staffForm";

const DEFAULT_VALUES: StaffSchema = {
  staff_name: "",
  role_id: "",
  is_active: true,
};

export function StaffForm({
  onSubmitSuccess,
  rolesData,
  isOpen = false,
  onOpenChange,
  editData,
}: StaffFormProps) {
  const isEditMode = !!editData;
  const [isFormOpen, setIsFormOpen] = useState(false);

  const form = useForm<StaffSchema>({
    resolver: zodResolver(staffSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { isPending, handleOpenChange, handleSubmit } =
    useFormDialog<StaffSchema>({
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
          ? await updateStaff({ id: data.id!, ...data })
          : await createStaff(data);

        if (result?.error) throw new Error(result.error);
        if (!isEditMode && !result?.ok)
          throw new Error(result?.error ?? "Gagal menyimpan data baru.");

        onSubmitSuccess?.();
      },
      {
        successMessage: isEditMode
          ? "Staff updated successfully!"
          : "Staff created successfully!",
      },
    ),
  );

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  return (
    <FormDialogShell
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "Update Staff" : "Create Staff"}
      description={
        isEditMode
          ? "Make changes to the staff details below."
          : "Fill in the details below to create a new staff."
      }
      isPending={isPending}
      submitLabel={isEditMode ? "Save Changes" : "Save Staff"}
      cancelLabel="Cancel"
      formId={FORM_ID}
      contentClassName="sm:max-w-md"
      showCloseButton
    >
      <form onSubmit={processSubmit} id={FORM_ID}>
        <FieldGroup>
          <Controller
            name="staff_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Staff Name</FieldLabel>
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

          <div className="flex">
            <InputCombobox
              control={form.control}
              name="role_id"
              label="Role"
              items={rolesData}
              itemValueKey="id"
              itemDisplayKey="role_name"
              showAddButton
              onAddClick={handleAdd}
            />
          </div>

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
      <RoleForm isOpen={isFormOpen} onOpenChange={setIsFormOpen}/>
    </FormDialogShell>
  );
}
