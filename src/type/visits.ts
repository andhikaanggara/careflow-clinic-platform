export interface IVisits {
  id: string;
  date: string;
  shift: string;
  patient_id: string;
  poly_destination: string;
  recipe_type: string;
  total_amount: number;
  payment: number;
  payment_methode: string;
  create_by: string;
  patients: { patient_name: string };
}
