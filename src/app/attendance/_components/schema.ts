import * as z from "zod";

export const attendanceSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  shift: z.string(),
  staff_id: z.string(),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;
