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

// --- function to add new patient ---
export async function createPatientAndVisit(data: any) {
  // variabel database
  const supabase = await createClient();
  const { isGuest } = await getAuthContext(supabase);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    let patientId = data.patients.id;
    let visitsId = data.visit_id;

    // --- LOGIKA 1: INSERT PASIEN BARU JIKA PERLU ---
    if (data.patients.isNewPatient || !patientId) {
      const { data: newPatient, error: pError } = await supabase
        .from("patients")
        .insert({
          patient_name: data.patients.patient_name,
          mr_number: data.patients.mr_number,
          gender: data.patients.gender,
          birth_date: data.patients.birth_date,
          phone: data.patients.phone,
          address: data.patients.address,
          is_demo: isGuest,
        })
        .select("id") // Mengambil ID yang baru digenerate
        .single();

      if (pError) throw new Error(`Gagal simpan pasien: ${pError.message}`);
      patientId = newPatient.id;
    }

    // --- LOGIKA 2: INSERT KUNJUNGAN ---
    const { data: newVisit, error: vError } = await supabase
      .from("patient_visits")
      .insert({
        date: data.visits.date,
        shift: data.visits.shift,
        patient_id: patientId,
        poly_destination: data.visits.poly_destination,
        recipe_type: data.visits.recipe_type,
        total_amount: data.visits.total_amount,
        payment: data.visits.payment,
        payment_methode: data.visits.payment_methode,
        create_by: user.id,
        is_demo: isGuest,
      })
      .select("id")
      .single();

    if (vError) throw new Error(`Gagal simpan kunjungan: ${vError.message}`);

    visitsId = newVisit.id;

    // --- LOGIKA 3: INSERT TINDAKAN (TREATMENTS) ---
    if (data.treatments && data.treatments.length > 0) {
      const treatmentsToInsert = data.treatments.map((t: any) => ({
        visit_id: visitsId,
        treatment_name_id: t.treatment_name_id,
        operation_staff_id: t.operation_staff_id,
        assistant_staff_id: t.assistant_staff_id || null,
      }));

      const { error: tError } = await supabase
        .from("visit_treatments")
        .insert(treatmentsToInsert);

      if (tError) throw new Error(`Gagal simpan tindakan: ${tError.message}`);
    }

    revalidatePath("/patient-visits");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal" };
  }
}

// funsgi delete absensi
export async function delleteVisits(
  id : string
): Promise<StaffActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("patient_visits")
    .delete()
    .eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/patient_visits");
  return { ok: true };
}
