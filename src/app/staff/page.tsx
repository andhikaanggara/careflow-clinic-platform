import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// component
import StaffClient from "./staff-client";
import { DataErrorState } from "@/components/data-error-state";

// type
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";

interface IErrorDisplay {
  title: string;
  message: string;
  tableName: string;
  columns: string[];
}

export const dynamic = "force-dynamic";

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
      .select("id, full_name, role, is_active")
      .order("role", { ascending: true })
      .order("full_name", { ascending: true }),
    supabase.from("roles").select("role").order("role", { ascending: true }),
  ]);

  // return message error
  if (staffRes.error) {
    return (
      <DataErrorState
        title="Manajement Petugas"
        message={staffRes.error.message}
        tableName="staff"
        columns={["id", "full_name", "role", "is_active"]}
      />
    );
  }

  if (roleRes.error) {
    return (
      <DataErrorState
        title="Manajement Peran"
        message={roleRes.error.message}
        tableName="roles"
        columns={["role"]}
      />
    );
  }

  const staff = (staffRes.data ?? []) as IStaff[];
  const roles = (roleRes.data ?? []) as IRole[];

  return <StaffClient initialStaff={staff} initialRoles={roles} />;
}
