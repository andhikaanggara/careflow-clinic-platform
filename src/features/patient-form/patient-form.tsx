"use client";

// React & Next.js Core
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

// Form & Validation Libraries
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format";
import * as z from "zod";

// Shared/Global UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Third-Party Feedbacks & Actions
import { toast } from "sonner";
import { createPatient, editPatient } from "./action";

// Local Shared Resources
import { PatientFormValues, patientSchema } from "./schema";

interface PatientFormProps {
  data: any[];
  onSubmitSuccess?: (data: PatientFormValues) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: PatientFormValues;
}

export function PatientForm({
  onSubmitSuccess,
  data,
  isOpen,
  onOpenChange,
  initialData,
}: PatientFormProps) {
  // Hooks & System State
  const router = useRouter();
  const isEditMode = !!initialData;
  const [isPending, startTransition] = useTransition();

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      patient_name: "",
      mr_number: "",
      gender: "",
      birth_date: "",
      phone: "",
      address: "",
    },
  });

  // Local Utilities
  const generateMRNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const nextNumber = (data.length + 1).toString().padStart(3, "0");
    return `${year}${month}${nextNumber}`;
  };

  // Lifecycle hooks / side effects
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        reset(initialData);
      } else {
        reset({
          patient_name: "",
          mr_number: generateMRNumber(),
          gender: "",
          birth_date: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [isOpen, initialData, isEditMode, reset]);

  // Event Handlers (User Actions)
  const processSubmit = async (formData: PatientFormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          phone: formData.phone === "" ? null : formData.phone,
        };

        if (isEditMode) {
          const result = await editPatient(payload);
          if (result?.error) throw new Error(result.error);

          toast.success("Patient updated successfully!");
        } else {
          const result = await createPatient(payload);
          if (!result?.ok) throw new Error("Gagal menyimpan data baru");

          toast.success("Patient created successfully!");
        }

        if (onSubmitSuccess) {
          onSubmitSuccess(formData);
        }

        onOpenChange?.(false);
        reset();
        router.refresh();
      } catch (error: any) {
        toast.error(
          error.message || "Terjadi kesalahan sistem saat menyimpan data.",
        );
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open) reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Patient" : "Create Patient"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Make changes to the patient details below."
                : "Fill in the details below to create a new patient."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Patient Name</Label>
              <Input id="name-1" {...register("patient_name")} />
              {errors.patient_name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.patient_name.message}
                </p>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="mr-number">MR Number</Label>
                <Input
                  id="mr-number"
                  className="bg-muted"
                  {...register("mr_number")}
                  readOnly
                />
                {errors.mr_number && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.mr_number.message}
                  </p>
                )}
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
                  <p className="text-xs text-destructive mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="birth-date">Birth Date</Label>
                <Input
                  id="birth-date"
                  type="date"
                  {...register("birth_date")}
                />
                {errors.birth_date && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.birth_date.message}
                  </p>
                )}
              </Field>
              <Field>
                <Label htmlFor="phone-number">Phone Number</Label>
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
                      onValueChange={(v) => {
                        field.onChange(v.value);
                      }}
                    />
                  )}
                />
              </Field>
            </div>
            <Field>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register("address")} />
              {errors.address && (
                <p className="text-xs text-destructive mt-1">
                  {errors.address.message}
                </p>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Save Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
