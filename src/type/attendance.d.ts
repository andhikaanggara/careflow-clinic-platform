/** Satu baris dari tabel `attendance` (Supabase). */
export interface IAttendanceRow {
  id: string;
  date: string;
  shift: string;
  staff_id: string;
  created_at?: string;
}
