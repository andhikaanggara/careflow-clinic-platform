import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// component
import StaffClient from "./_components/client-staff";
import { DataErrorState } from "@/components/feedback/data-error-state";

// type
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";

// fetching data staff
export default async function StaffPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [staffRes, roleRes] = await Promise.all([
    supabase
      .from("staff")
      .select("id, staff_name, role_id, is_active, roles(role_name)")
      .order("roles(role_name)", { ascending: true })
      .order("staff_name", { ascending: true }),
    supabase
      .from("roles")
      .select("role_name, id")
      .order("role_name", { ascending: true }),
  ]);

  // return message error
  if (staffRes.error) {
    return (
      <DataErrorState
        title="Manajement Petugas"
        message={staffRes.error.message}
        tableName="staff"
        columns={["id", "staff_name", "role_id", "is_active"]}
      />
    );
  }

  if (roleRes.error) {
    return (
      <DataErrorState
        title="Manajement Peran"
        message={roleRes.error.message}
        tableName="roles"
        columns={["role_name"]}
      />
    );
  }

  const staff = ((staffRes.data as any) ?? []) as IStaff[];
  const roles = (roleRes.data ?? []) as IRole[];

  return <StaffClient initialStaff={staff} initialRoles={roles} />;
}
