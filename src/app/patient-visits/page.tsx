import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// component
import { DataErrorState } from "@/components/feedback/data-error-state";

//  type
import type { IStaff } from "@/type/staff";
import { IVisits } from "@/type/visits";
import PatientVisitsClient from "./visit-client";

export const dynamic = "force-dynamic";

// fetching data attendance, staff, and role
export default async function PatientVisitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [staffRes, patientRes, treatmentRes, visitsRes] = await Promise.all([
    supabase
      .from("staff")
      .select("id, full_name, role, is_active")
      .order("full_name", { ascending: true }),
    supabase
      .from("patients")
      .select("id, patient_name, gender, mr_number, address, birth_date")
      .order("patient_name", { ascending: true }),
    supabase
      .from("treatments")
      .select("id, treatment_name")
      .order("treatment_name", { ascending: true }),
    supabase
      .from("patient_visits")
      .select(
        "id, date, shift, patient_id, poly_destination, recipe_type, total_amount, payment, payment_methode, create_by, patients(patient_name, mr_number, gender, birth_date, address))",
      )
      .returns<IVisits[]>(),
  ]);

  // return message error

  if (staffRes.error) {
    return (
      <DataErrorState
        title="Manajement Petugas"
        message={staffRes.error.message}
        tableName="staff"
        columns={["id", "full_name", "role", "is_active"]}
      />
    );
  }

  const staff = (staffRes.data ?? []) as IStaff[];
  const patients = patientRes.data ?? [];
  const treatments = treatmentRes.data ?? [];
  const visits = (visitsRes.data ?? []) as IVisits[];

  return (
    <PatientVisitsClient
      staffList={staff}
      patientList={patients}
      treatments={treatments}
      visitsList={visits}
    />
  );
}
