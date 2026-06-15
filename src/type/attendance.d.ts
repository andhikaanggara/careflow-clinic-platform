import { string } from "zod";

export interface IAttendanceRow {
  id: string;
  date: string;
  shift: string;
  staff_id: string;
  staff?: { staff_name: string };
}
