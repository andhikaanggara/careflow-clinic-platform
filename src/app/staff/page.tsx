import supabase from "../../lib/db";
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";
import StaffClient from "./staff-client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface IErrorDisplay {
  title: string;
  message: string;
  tableName: string;
  columns: string[];
}

export const dynamic = "force-dynamic";

const ErrorDisplay = ({
  title,
  message,
  tableName,
  columns,
}: IErrorDisplay) => (
  <div className="mx-auto max-w-4xl p-6">
    <h1 className="text-lg font-medium">{title}</h1>
    <p className="text-destructive mt-2 text-sm">
      Gagal memuat data : {message}
    </p>
    <p className="text-muted-foreground mt-2 text-sm">
      Pastikan tabel{" "}
      <code className="rounded bg-muted px-1"> {tableName} </code> ada dengan
      kolom{" "}
      {columns.map((col, i) => (
        <span key={col}>
          <code className="rounded bg-muted px-1">{col}</code>
          {i < columns.length - 1 ? ", " : ""}
        </span>
      ))}{" "}
      dan serta RLS yang sesuai.
    </p>
  </div>
);

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
      <ErrorDisplay
        title="Manajement Petugas"
        message={staffRes.error.message}
        tableName="staff"
        columns={["id", "full_name", "role", "is_active"]}
      />
    );
  }

  if (roleRes.error) {
    return (
      <ErrorDisplay
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
