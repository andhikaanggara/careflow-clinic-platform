"use client";

import { Search, Users } from "lucide-react";

import { SectionHeader } from "@/components/section/section-header";
import { SectionTable } from "@/components/section/section-table";

import { Input } from "@/components/ui/input";

const TABLE_COLUMNS = [
  {
    header: "Role Name",
    accessor: () => [],
  },
  {
    header: "Status",
    accessor: () => [],
  },
];

export default function RolesClient() {
  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] w-full flex-col gap-6 overflow-hidden p-4 md:p-6">
      <SectionHeader
        title="Role Management"
        description="Manage the list of clinic roles."
        icon={Users}
        actionLabel="Add role"
      />

      <section className="relative md:w-70">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search roles..."
          className="w-full pl-9 pr-4"
        />
      </section>

      <SectionTable data={[]} header={TABLE_COLUMNS} mobileRender={() => []} />
    </div>
  );
}
