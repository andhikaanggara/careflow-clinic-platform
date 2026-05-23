import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { FormErrorMessage } from "@/components/ui/form-error";

export function VisitFormSection() {
  const { setValue, watch } = useFormContext();

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Visit Patient
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {/* poly destination */}
        <div className="flex flex-col gap-1">
          <Label>Poli Tujuan</Label>
          <Select
            defaultValue="Umum"
            value={watch("poly_destination")|| "Umum"}
            onValueChange={(val) =>
              setValue("poly_destination", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Umum">Umum</SelectItem>
              <SelectItem value="Gigi">Gigi</SelectItem>
              <SelectItem value="Bidan">Kebidanan</SelectItem>
              <SelectItem value="Apotek">Apotek</SelectItem>
            </SelectContent>
          </Select>
          <FormErrorMessage name="poly_destination" />
        </div>

        {/* recipe type */}
        <div className="flex flex-col gap-1">
          <Label>Jenis Resep</Label>
          <Select
            defaultValue="Biasa"
            value={watch("recipe_type") || "Biasa"}
            onValueChange={(val) =>
              setValue("recipe_type", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tidak_Ada">Tidak Ada</SelectItem>
              <SelectItem value="Biasa">Biasa</SelectItem>
              <SelectItem value="Racikan">Racikan</SelectItem>
              <SelectItem value="Rujuakan">Rujukan</SelectItem>
            </SelectContent>
          </Select>
          <FormErrorMessage name="recipe_type" />
        </div>
      </div>

      {/* Payment Amount */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <Label>Total Bayar</Label>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp. "
            placeholder="Rp. 0"
            onValueChange={(val) => {
              setValue("total_amount", val.value, { shouldValidate: true });
            }}
            value={watch("total_amount")}
          />
          <FormErrorMessage name="total_amount" />
        </div>

        {/* Payment */}
        <div className="flex flex-col gap-1">
          <Label>Terbayar</Label>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp. "
            placeholder="Rp. 0"
            onValueChange={(val) => {
              setValue("payment", val.value, { shouldValidate: true });
            }}
            value={watch("payment")}
          />
          <FormErrorMessage name="payment" />
        </div>

        {/* Methode */}
        <div className="flex flex-col gap-1">
          <Label>Metode</Label>
          <Select
            value={watch("payment_methode")||"Cash"}
            onValueChange={(val) =>
              setValue("payment_methode", val, { shouldValidate: true })
            }
            defaultValue="Cash"
          >
            <SelectTrigger className="w-full">
              <SelectValue defaultValue="Cash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BPJS">BPJS</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Qris">Qris</SelectItem>
              <SelectItem value="Trasfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <FormErrorMessage name="payment_methode" />
        </div>
      </div>
    </section>
  );
}
