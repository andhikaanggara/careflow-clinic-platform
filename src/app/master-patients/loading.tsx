"use client";

import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/section/section-header";
import { SectionTable, TableColumn } from "@/components/section/section-table";

const header = [
  {
    header: "Patient Name",
    accessor: "patient_name",
  },
  { header: "MR Number", accessor: "mr_number" },
  { header: "Gender", accessor: "gender" },
  {
    header: "Birth Date",
    accessor: () => [],
  },
  { header: "Phone", accessor: "phone" },
  { header: "Address", accessor: "address" },
];

export default function PatientsClient() {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
      <SectionHeader
        title="Patients"
        description="Manage your patients"
        icon={Users}
        actionLabel="Create Patient"
      />

      <div className="relative md:w-70">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="text" className="pl-9 pr-4 w-full" />
      </div>

      <SectionTable data={[]} header={header} mobileRender={() => []} />
    </div>
  );
}
