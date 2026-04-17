import supabase from "../../lib/db";
import type { IStaff } from "@/type/staff";
import type { IRole } from "@/type/role";
import StaffClient from "./staff-client";

export const dynamic = "force-dynamic";

// fetching data staff
export default async function StaffPage() {
  const [staffRes, roleRes] = await Promise.all([
    supabase
      .from("staff")
      .select("id, full_name, role, is_active")
      .order("role", { ascending: true })
      .order("full_name", { ascending: true }),
    supabase.from("roles").select("role").order("role", { ascending: true }),
  ]);

  /** Jika ada error saat mengambil data petugas, tampilkan pesan kesalahan. */
  if (staffRes.error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-lg font-medium">Manajemen petugas</h1>
        <p className="text-destructive mt-2 text-sm">
          Gagal memuat data dari Supabase: {staffRes.error.message}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Pastikan tabel <code className="rounded bg-muted px-1">staff</code>{" "}
          ada dengan kolom <code className="rounded bg-muted px-1">id</code>,{" "}
          <code className="rounded bg-muted px-1">name</code>,{" "}
          <code className="rounded bg-muted px-1">role</code>,{" "}
          <code className="rounded bg-muted px-1">is_active</code>, dan serta
          RLS yang sesuai.
        </p>
      </div>
    );
  }

  if (roleRes.error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-lg font-medium">Manajemen Peran</h1>
        <p className="text-destructive mt-2 text-sm">
          Gagal memuat data dari Supabase: {roleRes.error.message}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Pastikan tabel <code className="rounded bg-muted px-1">roles</code>{" "}
          ada dengan kolom <code className="rounded bg-muted px-1">id</code>,{" "}
          <code className="rounded bg-muted px-1">role</code>, yang sesuai.
        </p>
      </div>
    );
  }

  const staff = (staffRes.data ?? []) as IStaff[];
  const roles = (roleRes.data ?? []) as IRole[];

  return <StaffClient initialStaff={staff} initialRoles={roles} />;
}
