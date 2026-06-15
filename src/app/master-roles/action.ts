"use server";

import { revalidatePath } from "next/cache";
import { authAction } from "@/utils/action";
import { RoleSchema } from "./schema";

const PATH = "/master-roles";

// --- new create role
export async function createRole(formData: RoleSchema) {
  return authAction(async ({ supabase, isGuest }) => {
    if (!formData.role_name?.trim()) throw new Error("Peran wajib diisi.");

    const { error } = await supabase.from("roles").insert({
      role_name: String(formData.role_name).trim(),
      is_active: String(formData.is_active ?? "true") !== "false",
      is_demo: isGuest,
    });

    if (error) throw new Error(`Failed to create role: ${error.message}`);

    revalidatePath(PATH);
    return { ok: true };
  });
}

// --- update role ---
export async function updateRole(data: RoleSchema) {
  return authAction(async ({ supabase }) => {
    if (!data.role_name?.trim()) throw new Error("Nama Role Wajib diisi.");

    const { error } = await supabase
      .from("roles")
      .update({ role_name: data.role_name.trim(), is_active: data.is_active })
      .eq("id", data.id);

    if (error) throw new Error(`Failed to update role: ${error.message}`);

    revalidatePath(PATH);
    return { ok: true };
  });
}

// --- delete role ---
export async function deleteRole(id: string) {
  return authAction(async ({ supabase }) => {
    if (!id) throw new Error("ID tidak ditemukan.");

    const { error } = await supabase.from("roles").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete role: ${error.message}`);

    revalidatePath(PATH);
    return { ok: true };
  });
}
