"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js"

export type StaffActionState = { error?: string; ok?: true };

// helper aut check and guest user detection
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

export async function createVisit(formData: FormData) {
  const supabase = await createClient();
  
  const patient_id = formData.get("patient_id") as string;
  const poly = formData.get("poly_destination") as string;
  const treatments = JSON.parse(formData.get("treatments") as string);
  const total_amount = treatments.reduce((acc: number, curr: any) => acc + Number(curr.price), 0);

  // 1. Insert ke patient_visits
  const { data: visit, error: vError } = await supabase
    .from("patient_visits")
    .insert([{ 
      patient_id, 
      poly_destination: poly, 
      amount_paid: total_amount,
      payment_status: 'unpaid' 
    }])
    .select()
    .single();

  if (vError) return { error: vError.message };

  // 2. Insert detail tindakan
  const treatmentRows = treatments.map((t: any) => ({
    visit_id: visit.id,
    treatment_name: t.name,
    price: t.price,
    main_staff_id: t.staff_id
  }));

  const { error: tError } = await supabase.from("visit_treatments").insert(treatmentRows);
  
  if (tError) return { error: tError.message };

  revalidatePath("/patient-visits");
  return { success: true };
}

// Tambahkan getDailyVisits, getPatients, dll sesuai kebutuhan database kamu

// function add patient name
export async function createPatient(
  formData: FormData,
): Promise<StaffActionState> {
  // ekstak data
  try {
    const supabase = await createClient();
    const { isGuest } = await getAuthContext(supabase);
    const data = {
      patient_name: String(formData.get("patienr_name") ?? "").trim(),
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