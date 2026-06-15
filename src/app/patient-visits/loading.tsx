"use client";

import { ClipboardList, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { SectionHeader } from "@/components/section/section-header";

export default function VisitClientLoading({
  patientList,
  staffList,
  treatments,
}: any) {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-6">
      <SectionHeader
        title="Operasional Klinik"
        description="Data kunjungan dan transaksi hari ini."
        icon={ClipboardList}
        actionLabel="Registrasi Pasien"
      />
      {/* Tabel Kunjungan (Gunakan shell yang sama dengan Attendance) */}
      <div className="border rounded-xl overflow-hidden bg-background">
        {/* Render Map initialVisits di sini seperti di AttendanceClient */}
      </div>
    </div>
  );
}
