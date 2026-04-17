"use server";

import { revalidatePath } from "next/cache";

import supabase from "@/lib/db";

/** Balikan standar untuk aksi server: sukses atau pesan error. */
export type AttendanceActionState = { error?: string; ok?: true };

const SHIFTS = ["Pagi", "Sore", "Malam"] as const;

/**
 * Memvalidasi string shift terhadap daftar yang diizinkan (sama dengan opsi di form).
 */
function isValidShift(shift: string): shift is (typeof SHIFTS)[number] {
  return (SHIFTS as readonly string[]).includes(shift);
}

// fungsi input absensi baru
export async function createAttendance(
  formData: FormData,
): Promise<AttendanceActionState> {
  const date = String(formData.get("date") ?? "").trim();
  const shift = String(formData.get("shift") ?? "").trim();
  const staffId = (formData.getAll("staff_id") ?? []) as string[];

  if (!date) {
    return { error: "Tanggal wajib diisi." };
  }
  if (!shift || !isValidShift(shift)) {
    return { error: "Shift tidak valid." };
  }

  const payload = staffId
    .filter((id) => id && id !== "null" && id !== "undefined")
    .map((id) => ({ date, shift, staff_id: String(id) }));

  const { error } = await supabase.from("attendance").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/attendance");
  return { ok: true };
}

// fungsi update absensi
export async function updateAttendance(
  oldDate: string,
  oldShift: string,
  formData: FormData,
): Promise<AttendanceActionState> {
  const newDate = String(formData.get("date") ?? "").trim();
  const newShift = String(formData.get("shift") ?? "").trim();
  const staffIds = (formData.getAll("staff_id") ?? []) as string[];

  if (!newDate || !newShift || !isValidShift(newShift)) {
    return { error: "Tanggal dan shift baru wajib diisi dengan benar." };
  }

  const { error: deleteError } = await supabase
    .from("attendance")
    .delete()
    .match({ date: oldDate, shift: oldShift });

  if (deleteError) return { error: deleteError.message };

  const payload = staffIds
    .filter((id) => id && id !== "null" && id !== "undefined")
    .map((id) => ({ date: newDate, shift: newShift, staff_id: id }));

  const { error: insertError } = await supabase
    .from("attendance")
    .insert(payload);

  if (insertError) return { error: insertError.message };
  revalidatePath("/attendance");
  return { ok: true };
}

// funsgi delete absensi
export async function delleteAttendance(
  date: string,
  shift: string,
): Promise<AttendanceActionState> {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .match({ date, shift });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/attendance");
  return { ok: true };
}
