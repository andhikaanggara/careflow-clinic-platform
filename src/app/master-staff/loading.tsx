"use client";

import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/section/section-header";

// utils & types
import { SectionTable, TableColumn } from "@/components/section/section-table";

const TABLE_COLUMNS = [
  {
    header: "Staff Name",
    accessor: "staff_name",
  },
  {
    header: "Role",
    accessor: () => ([]),
  },
  {
    header: "Status",
    accessor: () => ([]),
  },
];

export default function StaffClient() {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
      <SectionHeader
        title="Staff Management"
        description="Manage the list of clinic staff."
        icon={Users}
        actionLabel="Add staff"
      />

      <section className="relative md:w-70">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="text" className="pl-9 pr-4 w-full" />
      </section>

      <SectionTable data={[]} header={TABLE_COLUMNS} mobileRender={() => []} />
    </div>
  );
}
