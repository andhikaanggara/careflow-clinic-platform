"use client";

import { useEffect, useState, useTransition } from "react";
import { NumericFormat } from "react-number-format";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import * as z from "zod";

// UI Component
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientFormSection } from "./form-section/patient-form-section";
import { VisitFormSection } from "./form-section/visit-form-section";
import { TreatmentFormSelection } from "./form-section/treatment-form-section";

// Server action
import {
  createPatient,
  createTreatments,
  createVisits,
  editPatient,
  editVisits,
} from "../actions";

// --- Skema zod validation ---
// 1. Aturan Dasar Kunjungan (Tanpa field pasien)
const baseVisitSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  shift: z.string().min(1, "Shift wajib diisi"),
  patient_id: z.string().optional(),
  poly_destination: z.string().min(1, "Poliklinik tujuan wajib diisi"),
  recipe_type: z.string().min(1, "Jenis resep wajib diisi"),
  total_amount: z.string(),
  payment: z.string(),
  payment_methode: z.string().min(1, "Metode pembayaran wajib diisi"),
  create_by: z.string().optional(),
  treatments: z.array(z.any()).optional().default([]),
});

// 2. SKEMA A: Untuk Pasien Lama (Sangat Longgar, field pasien boleh kosong)
const oldPatientSchema = baseVisitSchema.extend({
  patients: z.object({
    id: z.string().optional(),
    patient_name: z.string().optional(),
    mr_number: z.string().optional(),
    gender: z.string().optional(),
    birth_date: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

// 3. SKEMA B: Untuk Pasien Baru (Sangat Ketat, semua field pasien wajib)
const newPatientSchema = baseVisitSchema.extend({
  patients: z.object({
    id: z.string().optional(),
    patient_name: z.string().min(3, "Nama pasien minimal 3 karakter"),
    mr_number: z.string().min(1, "Nomor MR wajib diisi"),
    gender: z.string().min(1, "Jenis kelamin wajib diisi"),
    birth_date: z.string().min(1, "Tanggal lahir wajib diisi"),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
    address: z.string().min(5, "Alamat minimal 5 karakter"),
  }),
});

// Berikan tipe data gabungan agar VS Code tidak eror
type VisitFormValues =
  | z.input<typeof oldPatientSchema>
  | z.input<typeof newPatientSchema>;

// --- Global Helper function ---
const validateResponse = (res: any): any => {
  if (res?.error) throw new Error(res.error);
  return res?.id ?? res?.data?.id;
};

const filterValidTreatments = (treatments: any[], visitId: string) => {
  if (!treatments) return [];
  return treatments
    .filter(
      (t) =>
        t && t.treatment_name_id !== "" && t.treatment_name_id !== undefined,
    )
    .map((t) => ({ ...t, visit_id: visitId }));
};

const getShiftDefault = () => {
  const h = new Date().getHours();
  if (h >= 7 && h < 14) return "Pagi";
  if (h >= 14 && h < 21) return "Sore";
  return "Malam";
};

// --- Main Component ---
export function VisitFormDialog({
  patientList = [],
  staffList,
  treatmentsList,
  setIsOpen,
  isOpen,
  isEditVisit,
}: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [selectedCard, setSelectedCard] = useState(false);
  const [newPatient, setNewPatient] = useState(true);
  const [isEditPatient, setIsEditPatient] = useState(false);

  const currentSchema = newPatient ? newPatientSchema : oldPatientSchema;

  // --- Initialize React Hook Form ---
  const methods = useForm<VisitFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      id: "",
      date: format(new Date(), "yyyy-MM-dd"),
      shift: getShiftDefault(),
      patient_id: "",
      poly_destination: "Umum",
      recipe_type: "Biasa",
      total_amount: "",
      payment: "",
      payment_methode: "Cash",
      create_by: "",
      // patient
      patients: {
        id: "",
        patient_name: "",
        mr_number: "",
        gender: "",
        birth_date: "",
        phone: "",
        address: "",
      },
      // treatment
      treatments: [],
    },
  });

  const { handleSubmit, watch, reset, setValue } = methods;

  // --- Helper ---
  const generateMRNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const nextNumber = (patientList.length + 1).toString().padStart(3, "0");
    return `${year}${month}${nextNumber}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (!isEditVisit) {
        setNewPatient(true);
        setIsEditPatient(false);
        setSelectedCard(false);
        reset();
        setValue("patients.mr_number", generateMRNumber());
      } else {
        reset(isEditVisit);
        setValue("patient_id", isEditVisit.patient_id);
        setValue("patients.id", isEditVisit.patients?.id);
        setNewPatient(false);
        setSelectedCard(true);
        setIsEditPatient(false);
        console.log("form state", watch());
      }
    }
  }, [isOpen, isEditVisit]);

  const handleSubmitVisit = async (data: any) => {
    startTransition(async () => {
      try {
        let currentPatientId = data.patient_id;
        let currentVisitsId = data.id;

        // --- create patient ---
        if (!currentPatientId) {
          const patientRes = await createPatient(data.patients);
          currentPatientId = validateResponse(patientRes);

          // inset patient id to visits
          setValue("patients.id", currentPatientId);
          setValue("patient_id", currentPatientId);
        }
        if (isEditPatient) {
          // --- edit patient ---
          const editPatientRes = await editPatient(data.patients);
          validateResponse(editPatientRes);
        }

        // --- manaje visit payload ---
        const visitPayload = {
          ...data,
          patient_id: currentPatientId,
          total_amount: Number(data.total_amount) || 0,
          payment: Number(data.payment) || 0,
        };

        // --- create visits ---
        if (!isEditVisit) {
          const visitsRes = await createVisits(visitPayload);
          currentVisitsId = validateResponse(visitsRes);

          // inset visit id to treatments
          if (currentVisitsId) {
            setValue("id", currentVisitsId);
          }
        } else {
          // --- edit visits ---
          const editVisitsRes = await editVisits(visitPayload);
          validateResponse(editVisitsRes);
        }

        // handle treatments
        const finalizedTreatments = filterValidTreatments(
          data.treatments,
          currentVisitsId,
        );

        // --- create treatments ---
        if (finalizedTreatments.length > 0) {
          const treatmentsRes = await createTreatments(finalizedTreatments);
          validateResponse(treatmentsRes);
        }

        toast.success(
          isEditVisit ? "Data berhasil diperbarui" : "Data berhasil disimpan",
        );
        setIsOpen(false);
        reset();
        router.refresh();
      } catch (error: any) {
        toast.error(
          error.message || "Terjadi kesalahan sistem saat menyimpan data.",
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditVisit ? "Edit Kunjungan" : "Registrasi Kunjungan Baru"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Data Patient */}
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(handleSubmitVisit)}
              className="flex flex-col gap-4"
            >
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Patient Data
                </h3>
              </div>

              <PatientFormSection
                patientList={patientList}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                newPatient={newPatient}
                setNewPatient={setNewPatient}
                isEditPatient={isEditPatient}
                setIsEditPatient={setIsEditPatient}
                generateMRNumber={generateMRNumber}
              />

              {/* Visits */}
              <VisitFormSection />

              {/* Treatments */}
              <TreatmentFormSelection
                treatmentsList={treatmentsList}
                staffList={staffList}
              />

              <DialogFooter>
                <div className="mr-auto font-bold">
                  <NumericFormat
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp. "
                    placeholder="Rp. 0"
                    value={watch("total_amount")}
                  />
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Menyimpan..."
                    : isEditVisit
                      ? "Perbarui Kunjungan"
                      : "Simpan Kunjungan"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
