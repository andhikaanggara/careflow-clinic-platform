// import component
import AttendanceClient from "@/app/attendance/attendance-client";

// import data fetching
import { createClient } from "@/utils/supabase/server";

// import library
import { redirect } from "next/navigation";

// import type
import type { IStaff } from "@/type/staff";
import type { IAttendanceRow } from "@/type/attendance";
import type { IRole } from "@/type/role";


export const dynamic = "force-dynamic";

// fetching data attendance, staff, and role
export default async function AttendancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const [attendanceRes, staffRes, roleRes] = await Promise.all([
    supabase
      .from("attendance")
      .select("id, date, shift, staff_id, created_at")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("staff")
      .select("id, full_name, role, is_active")
      .order("full_name", { ascending: true }),
    supabase.from("roles").select("role").order("role", { ascending: true }),
  ]);

  if (attendanceRes.error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-destructive text-sm">
          Gagal memuat presensi: {attendanceRes.error.message}
        </p>
      </div>
    );
  }

  /** Jika ada error saat mengambil data petugas, tampilkan pesan kesalahan. */
  if (staffRes.error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-destructive text-sm">
          Gagal memuat petugas: {staffRes.error.message}
        </p>
      </div>
    );
  }

  /**
   * Menggabungkan data presensi dan petugas untuk dikirim ke komponen klien.
   * `attendanceRes.data` dan `staffRes.data` sudah terurut berdasarkan `date` dan `role`.
   */
  const rows = (attendanceRes.data ?? []) as IAttendanceRow[];
  const staff = (staffRes.data ?? []) as IStaff[];
  const roles = (roleRes.data ?? []) as IRole[];

  /**
   * Menampilkan komponen klien dengan data presensi dan petugas yang sudah siap.
   * Komponen klien akan menampilkan tabel presensi dengan nama petugas yang sesuai.
   */
  return (
    <AttendanceClient
      initialAttendance={rows}
      staffList={staff}
      roles={roles}
    />
  );
}

// NEXT : BUAT FIVOT DARI STAF KE ABSENSI
