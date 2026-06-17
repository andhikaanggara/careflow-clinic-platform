"use client";

import { Calendar} from "lucide-react";

// UI Components
import { SectionHeader } from "@/components/section/section-header";
import { SectionTable } from "@/components/section/section-table";

export default function AttendanceClient({}) {
  const HEADER = [
    {
      header: "Date",
      accessor: () => [],
    },
    {
      header: "Shift",
      accessor: () => [],
    },
  ];

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
      <SectionHeader
        title="Staff Attendance"
        description="Manage daily clinic attendance."
        icon={Calendar}
        actionLabel="Add attendance"
      />

      <SectionTable data={[]} header={HEADER} mobileRender={() => []} />
    </div>
  );
}
