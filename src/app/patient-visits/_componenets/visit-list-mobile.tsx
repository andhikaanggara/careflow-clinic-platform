import { IVisits } from "@/type/visits";
import { formatDateIndo } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Stethoscope, Receipt, Wallet } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { Badge } from "@/components/ui/badge";

interface IProps {
  visitsList: IVisits[];
  handleOpenEdit: (row: any) => void;
  setDeleteTarget: (row: any) => void;
  setIsAlertDeleteOpen: (open: boolean) => void;
}

export function VisitListMobile({
  visitsList,
  handleOpenEdit,
  setDeleteTarget,
  setIsAlertDeleteOpen,
}: IProps) {
  
  // Tampilan jika data kunjungan kosong
  if (visitsList.length === 0) {
    return (
      <div className="block md:hidden text-center p-8 bg-background border rounded-xl text-muted-foreground shadow-sm">
        Belum ada data presensi.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-4 px-1 pb-6">
      {visitsList.map((row) => (
        <div 
          key={row.id} 
          className="bg-background border border-border/80 rounded-xl p-4 shadow-sm space-y-4 hover:border-primary/30 transition-all"
        >
          {/* 1. BAGIAN ATAS: Informasi Utama & Status */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-bold text-base text-card-foreground tracking-tight line-clamp-1">
                {row.patients.patient_name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateIndo(row.date)} • <span className="font-medium text-foreground">{row.shift}</span>
              </p>
            </div>
            
            {/* Badge Metode Pembayaran */}
            <Badge variant={row.payment_methode === "BPJS" ? "secondary" : "outline"} className="text-xs px-2 py-0.5 font-semibold">
              {row.payment_methode}
            </Badge>
          </div>

          {/* 2. BAGIAN TENGAH: Detail Kunjungan */}
          <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0">
              <Stethoscope className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="truncate text-foreground font-medium">Poli {row.poly_destination}</span>
            </div>
            
            <div className="flex items-center gap-1.5 min-w-0">
              <Receipt className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate text-foreground font-medium">Resep {row.recipe_type}</span>
            </div>
          </div>

          {/* 3. BAGIAN BAWAH: Nominal & Tombol Aksi */}
          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Wallet className="h-3 w-3" /> Total Biaya
              </span>
              <span className="text-sm font-extrabold text-foreground mt-0.5">
                <NumericFormat
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp. "
                  displayType="text"
                  value={row.total_amount}
                />
              </span>
            </div>

            {/* Kelompok Akses Kontrol */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(row)}
                className="cursor-pointer h-8 w-8 p-0 border-border/80 hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteTarget(row);
                  setIsAlertDeleteOpen(true);
                }}
                className="cursor-pointer h-8 w-8 p-0 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Hapus</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
