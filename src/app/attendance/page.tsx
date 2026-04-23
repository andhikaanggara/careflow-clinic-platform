import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// component
import AttendanceClient from "@/app/attendance/attendance-client";
import { DataErrorState } from "@/components/data-error-state";

//  type
import type { IRole } from "@/type/role";
import type { IStaff } from "@/type/staff";
import type { IAttendanceRow } from "@/type/attendance";

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

  // return message error
  if (staffRes.error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-destructive text-sm">
          Gagal memuat petugas: {staffRes.error.message}
        </p>
      </div>
    );
  }

  if (attendanceRes.error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-destructive text-sm">
          Gagal memuat presensi: {attendanceRes.error.message}
        </p>
      </div>
    );
  }

  const roles = (roleRes.data ?? []) as IRole[];
  const staff = (staffRes.data ?? []) as IStaff[];
  const rows = (attendanceRes.data ?? []) as IAttendanceRow[];

  return (
    <AttendanceClient
      initialAttendance={rows}
      staffList={staff}
      roles={roles}
    />
  );
}
