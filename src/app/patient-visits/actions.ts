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

// --- function create patient ---
export async function createPatinet(data: any) {
  const supabase = await createClient();
  const { isGuest } = await getAuthContext(supabase);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const { data: newPatient, error: pError } = await supabase
      .from("patients")
      .insert({
        patient_name: data.patient_name,
        mr_number: data.mr_number,
        gender: data.gender,
        birth_date: data.birth_date,
        phone: data.phone,
        address: data.address,
        is_demo: isGuest,
      })
      .select("id")
      .single();

    if (pError) throw new Error(`Gagal simpan pasien: ${pError.message}`);

    return { ok: true, id: newPatient?.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- function edit patient ---
export async function editPatient(data: any) {
  const supabase = await createClient();
  const { isGuest } = await getAuthContext(supabase);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const { error: pError } = await supabase
      .from("patients")
      .update({
        patient_name: data.patient_name,
        mr_number: data.mr_number,
        gender: data.gender,
        birth_date: data.birth_date,
        phone: data.phone,
        address: data.address,
      })
      .eq("id", data.id);

    if (pError) throw new Error(`Gagal simpan pasien: ${pError.message}`);

    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- function create visits ---
export async function createVisits(data: any) {
  // variabel database
  const supabase = await createClient();
  const { isGuest } = await getAuthContext(supabase);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const { data: newVisits, error: vError } = await supabase
      .from("patient_visits")
      .insert({
        date: data.date,
        shift: data.shift,
        patient_id: data.patient_id,
        poly_destination: data.poly_destination,
        recipe_type: data.recipe_type,
        total_amount: data.total_amount,
        payment: data.payment,
        payment_methode: data.payment_methode,
        create_by: user.id,
        is_demo: isGuest,
      })
      .select("id")
      .single();

    if (vError) throw new Error(`Gagal simpan kunjungan: ${vError.message}`);
    return { ok: true, id: newVisits?.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- function create treatments ---
export async function createTreatments(data: any) {
  // variabel database
  const supabase = await createClient();
  const { isGuest } = await getAuthContext(supabase);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const treatmentsToInsert = data.map((t: any) => ({
      visit_id: t.visit_id,
      treatment_name_id: t.treatment_name_id,
      operation_staff_id: t.operation_staff_id,
      assistant_staff_id: t.assistant_staff_id || null,
      is_demo: isGuest,
    }));

    const { error: tError } = await supabase
      .from("visit_treatments")
      .insert(treatmentsToInsert);

    if (tError) throw new Error(`Gagal simpan tindakan: ${tError.message}`);

    revalidatePath("/patient-visits");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal" };
  }
}

// --- function delete visits ---
export async function deleteVisits(id: string): Promise<StaffActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("patient_visits").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/patient_visits");
  return { ok: true };
}
