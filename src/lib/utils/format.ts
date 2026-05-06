import { format } from "date-fns";
import { id } from "date-fns/locale";

export const formatDateIndo = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
  } catch {
    return dateStr;
  }
};