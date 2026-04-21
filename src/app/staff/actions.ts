"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export type StaffActionState = { error?: string; ok?: true };

// helper for auth check and guest user detection
async function getAuthContext(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthenticated");
  return {
    user,
    isGuest: user.email === "guest@rahayumedika.com",
  };
}

// function to add new staff
export async function createStaff(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstak data
  try {
    // variabel database
    const supabase = await createClient();
    const { isGuest } = await getAuthContext(supabase);
    const data = {
      full_name: String(formData.get("name") ?? "").trim(),
      role: String(formData.get("role") ?? ""),
      is_active: String(formData.get("is_active") ?? "true") !== "false",
      is_demo: isGuest,
    };

    // validasi data
    if (!data.full_name) return { error: "Nama wajib diisi." };
    if (!data.role) return { error: "Peran wajib dipilih." };

    // inset data
    const { error: dbError } = await supabase.from("staff").insert(data);

    // error handling
    if (dbError) return { error: dbError.message };

    // revalidasi cache
    revalidatePath("/staff");
    return { ok: true };
  } catch (err: any) {
    console.error("Unexpected Error:", err);
    return {
      error: `Terjadi kesalahan tak terduga. Silakan coba lagi. ${err.message}`,
    };
  }
}

// function to add new role
export async function createRole(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstak data
  try {
    const supabase = await createClient();
    const { isGuest } = await getAuthContext(supabase);
    const data = {
      role: String(formData.get("role") ?? "").trim(),
      is_demo: isGuest,
    };

    // validasi data
    if (!data.role) return { error: "Peran wajib diisi." };

    // inset data
    const { error: dbError } = await supabase.from("roles").insert(data);

    // error handling
    if (dbError) return { error: dbError.message };

    // revalidasi cache
    revalidatePath("/staff");
    return { ok: true };
  } catch (err: any) {
    return {
      error: `Terjadi kesalahan tak terduga. Silakan coba lagi. ${err.message}`,
    };
  }
}

// function to update staff data
export async function updateStaff(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstak database
  try {
    const supabase = await createClient();
    const { isGuest } = await getAuthContext(supabase);

    const id = formData.get("id");
    const data = {
      full_name: String(formData.get("name") ?? "").trim(),
      role: String(formData.get("role") ?? ""),
      is_active: formData.get("is_active") === "true",
      is_demo: isGuest,
    };

    // validasi data
    if (id === null || id === "") return { error: "ID petugas tidak valid." };
    if (!data.full_name) return { error: "Nama wajib diisi." };
    if (!data.role) return { error: "Peran wajib dipilih." };

    // update data di database
    const { error: dbError } = await supabase
      .from("staff")
      .update(data)
      .eq("id", id);

    // error handling
    if (dbError) return { error: dbError.message };

    // revaldasi cache
    revalidatePath("/staff");
    return { ok: true };
  } catch (err: any) {
    return {
      error: `Terjadi kesalahan tak terduga. Silakan coba lagi. ${err.message}`,
    };
  }
}

// fungsi delete staff
export async function deleteStaff(id: string): Promise<StaffActionState> {
  const supabase = await createClient();
  await getAuthContext(supabase);
  
  try {
    // execution delete query
    const { error: dbError } = await supabase
      .from("staff")
      .delete()
      .eq("id", id);

    // error handling
    if (dbError) return { error: dbError.message };

    // revaldasi cache
    revalidatePath("/staff");
    return { ok: true };
  } catch (err: any) {
    console.error("Unexpected Error:", err);
    return {
      error: `Terjadi kesalahan tak terduga. Silakan coba lagi. ${err.message}`,
    };
  }
}
