import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RolesClient from "./_components/client-roles";
import { IRole } from "@/type/role";
import { DataErrorState } from "@/components/feedback/data-error-state";

export default async function RolesPage() {
  const supabase = await createClient();

  // auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // fetch data
  const { data, error } = await supabase
    .from("roles")
    .select("id, role_name, is_active")
    .order("role_name", { ascending: true });

  if (error) {
    console.error("[RolesPage] fetching error:", error.message);
    <DataErrorState
      title="Roles Page"
      message={error.message}
      tableName="roles"
      columns={["id", "role_name", "is_active"]}
    />;
  }

  const roles: IRole[] = data ?? [];

  return <RolesClient initialRoles={roles} />;
}
