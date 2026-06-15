export interface IStaff {
  id: string;
  staff_name: string;
  role_id: string;
  is_active: boolean;
  roles?: { role_name: string } | null
}