"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format";

import { createPatient, editPatient } from "../action";
import { PatientFormValues, patientSchema } from "../schema";
import { useFormDialog } from "@/hooks/use-form-dialog";
import { FormDialogShell } from "@/components/form-dialog-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFormProps {
  /** Full patient list – used to generate the next MR number. */
  data: unknown[];
  onSubmitSuccess?: (data: PatientFormValues) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editData?: PatientFormValues;
}

const FORM_ID = "patientForm";

const EMPTY_VALUES: PatientFormValues = {
  patient_name: "",
  mr_number: "",
  gender: "",
  birth_date: "",
  phone: "",
  address: "",
};

function generateMRNumber(existingCount: number): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const seq = (existingCount + 1).toString().padStart(3, "0");
  return `${year}${month}${seq}`;
}

export function PatientForm({
  onSubmitSuccess,
  data,
  isOpen = false,
  onOpenChange,
  editData,
}: PatientFormProps) {
  const isEditMode = !!editData;

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { isPending, handleOpenChange, handleSubmit } =
    useFormDialog<PatientFormValues>({
      isOpen,
      editData,
      onOpen: () =>
        reset(
          isEditMode
            ? editData!
            : { ...EMPTY_VALUES, mr_number: generateMRNumber(data.length) },
        ),
      onReset: () => reset(EMPTY_VALUES),
      onOpenChange,
    });

  const processSubmit = rhfHandleSubmit((formData) => {
    const payload = {
      ...formData,
      // Treat an empty string as no phone number
      phone: formData.phone === "" ? null : formData.phone,
    };

    handleSubmit(
      async () => {
        const result = isEditMode
          ? await editPatient(payload)
          : await createPatient(payload);

        if (result?.error) throw new Error(result.error);
        if (!isEditMode && !result?.ok)
          throw new Error("Gagal menyimpan data baru.");

        onSubmitSuccess?.(formData);
      },
      {
        successMessage: isEditMode
          ? "Patient updated successfully!"
          : "Patient created successfully!",
      },
    );
  });

  return (
    <FormDialogShell
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "Update Patient" : "Add Patient"}
      description={
        isEditMode
          ? "Make changes to the patient details below."
          : "Fill in the details below to create a new patient."
      }
      isPending={isPending}
      submitLabel={isEditMode ? "Save Changes" : "Save Patient"}
      cancelLabel="Cancel"
      formId={FORM_ID}
    >
      <form onSubmit={processSubmit} id={FORM_ID} className="space-y-6">
        <FieldGroup>
          <Field>
            <Label htmlFor="patient_name">Patient Name</Label>
            <Input id="patient_name" {...register("patient_name")} />
            {errors.patient_name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.patient_name.message}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="mr_number">MR Number</Label>
              <Input
                id="mr_number"
                className="bg-muted"
                readOnly
                {...register("mr_number")}
              />
            </Field>

            <Field>
              <Label htmlFor="gender">Gender</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="birth_date">Birth Date</Label>
              <Input id="birth_date" type="date" {...register("birth_date")} />
              {errors.birth_date && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.birth_date.message}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="phone">Phone Number</Label>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <PatternFormat
                    customInput={Input}
                    mask=""
                    format="#### #### ####"
                    placeholder="08..."
                    value={field.value}
                    onValueChange={(v) => field.onChange(v.value)}
                  />
                )}
              />
            </Field>
          </div>

          <Field>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} />
            {errors.address && (
              <p className="mt-1 text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </Field>
        </FieldGroup>
      </form>
    </FormDialogShell>
  );
}
