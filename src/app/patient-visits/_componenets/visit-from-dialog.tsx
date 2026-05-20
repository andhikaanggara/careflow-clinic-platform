"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { NumericFormat } from "react-number-format";
import { useRouter } from "next/navigation";

// UI Component
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Action
import {
  createPatinet,
  createTreatments,
  createVisits,
  editPatient,
} from "../actions";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { PatientFormSection } from "./form-section/patient-form-section";
import { VisitFormSection } from "./form-section/visit-form-section";
import { TreatmentFormSelection } from "./form-section/treatment-form-section";
import { toast } from "sonner";

export function VisitFormDialog({
  patientList,
  staffList,
  treatmentsList,
  setIsOpen,
  isOpen,
  editVisit,
}: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // --- State ---
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patients: {
        id: "",
        patient_name: "",
        mr_number: "",
        gender: "",
        birth_date: "",
        phone: "",
        address: "",
      },
      // visits
      visits: {
        id: "",
        date: "",
        shift: "",
        patient_id: "",
        poly_destination: "Umum",
        recipe_type: "Biasa",
        total_amount: "",
        payment: "",
        payment_methode: "Cash",
        create_by: "",
      },
      // treatment
      treatments: [],
    },
  });

  const [selectedCard, setSelectedCard] = useState(false);
  const [newPatient, setNewPatient] = useState(true);
  const [isEditPatient, setIsEditPatient] = useState(false);

  const getShiftDefault = () => {
    const h = new Date().getHours();
    if (h >= 7 && h < 14) return "Pagi";
    if (h >= 14 && h < 21) return "Sore";
    return "Malam";
  };

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
      setNewPatient(true);
      setIsEditPatient(false);
      setSelectedCard(false);
      reset();
      setValue("visits.date", format(new Date(), "yyyy-MM-dd"));
      setValue("visits.shift", getShiftDefault());
      setValue("patients.mr_number", generateMRNumber());
    }
  }, [isOpen]);

  useEffect(() => {
    if (editVisit) {
    }
  }, [editVisit]);

  const handleSubmitPatient = async (data: any) => {
    console.log("Data yang akan disubmit:", data);
    startTransition(async () => {
      try {
        let currentPatientId = data.visits.patient_id;
        let currentVisitsId = data.visits.id;
        // --- handle create patient ---
        if (!currentPatientId) {
          const patientRes = await createPatinet(data.patients);
          if (patientRes.error) {
            toast.error(patientRes.error);
            return;
          }
          // inset patient id to visits
          currentPatientId = patientRes?.id;
          setValue("patients.id", currentPatientId);
          setValue("visits.patient_id", currentPatientId);
        }

        // --- handle edit patient ---
        if (editPatient) {
          const editPatientRes = await editPatient(data.patients);
          if (editPatientRes.error) {
            toast.error(editPatientRes.error);
            return;
          }
        }

        // --- handle create visits ---
        const visitPayload = {
          ...data.visits,
          patient_id: currentPatientId,
        };
        const visitsRes = await createVisits(visitPayload);

        if (visitsRes?.error) {
          toast.error(visitsRes?.error);
          return;
        }
        // inset visit id to treatments
        currentVisitsId = visitsRes?.id;
        if (currentVisitsId) {
          setValue("visits.id", currentVisitsId);
        }

        // --- handle create treatments ---
        // clear empty treatments
        const validTreatments =
          data.treatments?.filter(
            (t: any) =>
              t &&
              t.treatment_name_id !== "" &&
              t.treatment_name_id !== undefined,
          ) || [];

        if (validTreatments.length > 0) {
          // map tretment with visit_id
          const finalizedTreatments = validTreatments.map((t: any) => ({
            ...t,
            visit_id: currentVisitsId,
          }));

          const treatmentsRes = await createTreatments(finalizedTreatments);
          if (treatmentsRes?.error) {
            toast.error(treatmentsRes.error);
            return;
          }
        }
        toast.success(
          editVisit ? "Data berhasil diperbarui" : "Data berhasil disimpan",
        );
        setIsOpen(false);
        reset();
        router.refresh();
      } catch (error) {
        console.error("Submit Error:", error);
        toast.error("Terjadi kesalahan sistem saat menyimpan data.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editVisit ? "Edit Kunjungan" : "Registrasi Kunjungan Baru"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Data Patient */}
          <form
            onSubmit={handleSubmit(handleSubmitPatient)}
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
              reset={reset}
              watch={watch}
              setValue={setValue}
              register={register}
              control={control}
              newPatient={newPatient}
              setNewPatient={setNewPatient}
              isEditPatient={isEditPatient}
              setIsEditPatient={setIsEditPatient}
              generateMRNumber={generateMRNumber}
            />

            {/* Visits */}
            <VisitFormSection
              control={control}
              setValue={setValue}
              watch={watch}
            />

            {/* Treatments */}
            <TreatmentFormSelection
              treatmentsList={treatmentsList}
              staffList={staffList}
              control={control}
              setValue={setValue}
              watch={watch}
            />

            <DialogFooter>
              <div className="mr-auto font-bold">
                <NumericFormat
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp. "
                  placeholder="Rp. 0"
                  value={watch("visits.total_amount")}
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Menyimpan..."
                  : editVisit
                    ? "Perbarui Kunjungan"
                    : "Simpan Kunjungan"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
