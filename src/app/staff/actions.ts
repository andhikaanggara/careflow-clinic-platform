"use server";

import { revalidatePath } from "next/cache";

import supabase from "@/lib/db";

/** Bentuk balikan umum untuk aksi server: berhasil (`ok`) atau gagal dengan `error`. */
export type StaffActionState = { error?: string; ok?: true };

// fungsi tambah staff (ok)
export async function createStaff(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstak data
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const isActiveRaw = String(formData.get("is_active") ?? "true");
  const is_active = isActiveRaw !== "false";

  console.log(role);

  // validasi data
  if (!name) return { error: "Nama wajib diisi." };
  if (!role) return { error: "Peran wajib dipilih." };

  // inset data
  const { error } = await supabase
    .from("staff")
    .insert({ full_name: name, role, is_active });

  // error handling
  if (error) return { error: error.message };

  // revalidasi cache
  revalidatePath("/staff");
  return { ok: true };
}

// Fungsi tambah role baru (ok)
export async function createRole(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstak data
  const role = String(formData.get("role") ?? "").trim();

  // validasi data
  if (!role) return { error: "Peran wajib diisi." };

  // inset data
  const { error } = await supabase.from("roles").insert({ role });

  // error handling
  if (error) return { error: error.message };

  // revalidasi cache
  revalidatePath("/staff");
  return { ok: true };
}

// fungsi update staff
export async function updateStaff(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstrak data dari form
  const id = formData.get("id");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const isActiveRaw = String(formData.get("is_active") ?? "true");
  const is_active = isActiveRaw !== "false";

  // validasi data
  if (id === null || id === "") return { error: "ID petugas tidak valid." };
  if (!name) return { error: "Nama wajib diisi." };

  // update data di database
  const { error } = await supabase
    .from("staff")
    .update({ full_name: name, role, is_active })
    .eq("id", id);

  // error handling
  if (error) return { error: error.message };

  // revaldasi cache
  revalidatePath("/staff");
  return { ok: true };
}

// fungsi delete staff
export async function deleteStaff(id: string): Promise<StaffActionState> {
  // delete data di supabase
  const { error } = await supabase.from("staff").delete().eq("id", id);

  // error handling
  if (error) return { error: error.message };

  // revaldasi cache
  revalidatePath("/staff");
  return { ok: true };
}
