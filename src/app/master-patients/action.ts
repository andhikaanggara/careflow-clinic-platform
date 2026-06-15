"use server";

import { revalidatePath } from "next/cache";
import { authAction } from "@/utils/action";

const PATH_PATIENT = "/master-patient";

// --- create patient ---
export async function createPatient(data: any) {
  return authAction(async ({ supabase, isGuest }) => {
    const { error: pError } = await supabase.from("patients").insert({
      patient_name: data.patient_name,
      mr_number: data.mr_number,
      gender: data.gender,
      birth_date: data.birth_date,
      phone: data.phone,
      address: data.address,
      is_demo: isGuest,
    });
    if (pError) throw new Error(`Failed to create patient: ${pError.message}`);
    revalidatePath(PATH_PATIENT);
    return { ok: true };
  });
}

// --- update patient ---
export async function editPatient(data: any) {
  return authAction(async ({ supabase }) => {
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
    if (pError) throw new Error(`Failed to edit patient: ${pError.message}`);
    revalidatePath(PATH_PATIENT);
    return { ok: true };
  });
}

// --- delete patient ---
export async function deletePatient(id: string) {
  return authAction(async ({ supabase }) => {
    const { error: pError } = await supabase
      .from("patients")
      .delete()
      .eq("id", id);
    if (pError) throw new Error(`Failed to delete patient: ${pError.message}`);
    revalidatePath(PATH_PATIENT);
    return { ok: true };
  });
}
