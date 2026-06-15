"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Edit3, Search, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { SectionHeader } from "@/components/section/section-header";
import { SectionTable, TableColumn } from "@/components/section/section-table";
import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";
import { PatientForm } from "@/app/master-patients/_components/patient-form";
import { deletePatient } from "@/app/master-patients/action";

import { formatDateIndo } from "@/lib/utils/format";
import { Patient } from "@/type/patient";

const header: TableColumn<Patient>[] = [
  {
    header: "Patient Name",
    accessor: "patient_name",
  },
  { header: "MR Number", accessor: "mr_number" },
  { header: "Gender", accessor: "gender" },
  {
    header: "Birth Date",
    accessor: (patient) => formatDateIndo(patient.birth_date),
  },
  { header: "Phone", accessor: "phone" },
  { header: "Address", accessor: "address" },
];

export default function PatientsClient({
  initialPatients,
}: {
  initialPatients: Patient[];
}) {
  // Hooks & System State
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Component States
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(
    undefined,
  );
  const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  // DERIVED STATES & FILTERING
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return initialPatients;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return initialPatients.filter(
      (patient) =>
        patient.patient_name.toLowerCase().includes(lowerCaseQuery) ||
        patient.mr_number.toLowerCase().includes(lowerCaseQuery),
    );
  }, [searchQuery, initialPatients]);

  // Even Handlers
  const handleOpenCreate = () => {
    setSelectedPatient(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (patient: Patient) => {
    setDeleteTarget(patient);
    setIsAlertDeleteOpen(true);
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsAlertDeleteOpen(false);
    startTransition(async () => {
      const result = await deletePatient(deleteTarget.id);
      if (result.error) {
        toast.error(
          `Gagal menghapus pasien "${deleteTarget.patient_name}": ${result.error}`,
          { duration: 8000 },
        );
      } else {
        setIsAlertDeleteOpen(false);
        setDeleteTarget(null);
        router.refresh();
        toast.success(
          `Pasien "${deleteTarget.patient_name}" berhasil dihapus`,
          { duration: 8000 },
        );
      }
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
      <SectionHeader
        title="Patients"
        description="Manage your patients"
        icon={Users}
        actionLabel="Create Patient"
        onAction={handleOpenCreate}
      />

      <div className="relative md:w-70">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 w-full"
        />
      </div>

      <SectionTable
        data={filteredPatients}
        header={header}
        emptyMessage={
          searchQuery
            ? `Tidak ditemukan pasien dengan kata kunci "${searchQuery}"`
            : "Belum ada pasien. Tambahkan dari tombol di atas."
        }
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTrigger}
        mobileRender={(patient) => (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center pb-2">
              <h4 className="font-bold text-lg">{patient.patient_name}</h4>
              <Badge variant="outline">{patient.mr_number}</Badge>
            </div>
            <div className="grid grid-cols-3 w-full">
              <p>{patient.gender}</p>
              <p>{patient.birth_date}</p>
              <p>{patient.phone}</p>
            </div>
            <div>{patient.address}</div>
            <div className="flex gap-2 mt-2">
              <Button
                className="w-1/2"
                variant="outline"
                onClick={() => handleOpenEdit(patient)}
              >
                Edit
              </Button>
              <Button
                className="w-1/2"
                variant="destructive"
                onClick={() => handleDeleteTrigger(patient)}
              >
                Hapus
              </Button>
            </div>
          </div>
        )}
      />

      <PatientForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        data={initialPatients}
        editData={selectedPatient}
      />

      <ConfirmDeleteDialog
        isOpen={isAlertDeleteOpen}
        onOpenChange={setIsAlertDeleteOpen}
        entityName="Pasien"
        itemName={deleteTarget?.patient_name ?? ""}
        onConfirm={onConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}
