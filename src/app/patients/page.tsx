import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DataErrorState } from "@/components/feedback/data-error-state";
import PatientsClient from "./patients-client";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [patientsRes] = await Promise.all([
    supabase
      .from("patients")
      .select("id, patient_name, mr_number, gender, birth_date, phone, address")
      .order("patient_name", { ascending: true }),
  ]);

  if (patientsRes.error) {
    return (
      <DataErrorState
        title="Error fetching patients"
        message={patientsRes.error.message}
        tableName="patients"
        columns={[
          "id",
          "patient_name",
          "mr_number",
          "gender",
          "birth_date",
          "phone",
          "address",
        ]}
      />
    );
  }

  const patients = patientsRes.data ?? [];

  return <PatientsClient initialPatients={patients} />;
}
