"use server";

import { revalidatePath } from "next/cache";
import { authAction } from "@/utils/action";

const PATH_STAFF = "/master-staff";

// --- create staff ---
export async function createStaff(formData: {
  staff_name: string;
  role_id: string;
  is_active: boolean;
}) {
  return authAction(async ({ supabase, isGuest }) => {
    const { error } = await supabase.from("staff").insert({
      staff_name: String(formData.staff_name ?? "").trim(),
      role_id: String(formData.role_id ?? ""),
      is_active: String(formData.is_active ?? "true") !== "false",
      is_demo: isGuest,
    });

    if (error) throw new Error(`Failed to create staff: ${error.message}`);

    revalidatePath(PATH_STAFF);
    return { ok: true };
  });
}

// --- update staff ---
export async function updateStaff(data: {
  id: string;
  staff_name: string;
  role_id: string;
  is_active: boolean;
}) {
  return authAction(async ({ supabase }) => {
    if (!data.id) throw new Error("ID petugas tidak valid.");
    if (!data.staff_name?.trim()) throw new Error("Nama wajib diisi.");
    if (!data.role_id) throw new Error("Peran wajib dipilih.");

    const { error } = await supabase
      .from("staff")
      .update({
        staff_name: data.staff_name.trim(),
        role_id: data.role_id,
        is_active: data.is_active,
      })
      .eq("id", data.id);

    if (error) throw new Error(`Failed to update staff: ${error.message}`);

    revalidatePath(PATH_STAFF);
    return { ok: true };
  });
}

// --- delete staff ---
export async function deleteStaff(id: string) {
  return authAction(async ({ supabase }) => {
    if (!id) throw new Error("ID tidak ditemukan.");

    const { error } = await supabase.from("staff").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete staff: ${error.message}`);

    revalidatePath(PATH_STAFF);
    return { ok: true };
  });
}