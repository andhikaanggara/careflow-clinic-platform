import { FormCombobox } from "@/components/form-combobox";
import { Button } from "@/components/ui/button";
import { ComboboxItem } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateIndo } from "@/lib/utils/format";
import { Edit3, UserPlus } from "lucide-react";
import { Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

export function PatientFormSection({
  patientList,
  selectedCard,
  setSelectedCard,
  watch,
  setValue,
  register,
  control,
  reset,
  newPatient,
  setNewPatient,
  setIsEditPatient,
  generateMRNumber,
}: any) {
  return (
    <section>
      <FormCombobox
        name="visits.patient_id"
        control={control}
        label="Cari Pasien"
        items={patientList}
        displayKey="patient_name"
        placeholder="Nama Sesuai KTP"
        onSelect={(item) => {
          setValue("visits.patient_id", item.id);
          setValue("patients.id", item.id);
          setNewPatient(false);
          setSelectedCard(true);
        }}
        onBlur={(e) => setValue("patients.patient_name", e.target.value)}
        renderItem={(item) => (
          <Item size="xs" className="p-0 cursor-pointer">
            <ItemContent>
              <ItemTitle>{item.patient_name}</ItemTitle>
              <ItemDescription>
                {formatDateIndo(item.birth_date)}
              </ItemDescription>
              <ItemDescription className="line-clamp-1">
                {item.address}
              </ItemDescription>
            </ItemContent>
          </Item>
        )}
        appendContent={
          <ComboboxItem className="p-0 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewPatient(true);
                setIsEditPatient(false);
                setSelectedCard(false);
                reset();
                setValue("patients.mr_number", generateMRNumber());
              }}
              className="w-full text-xs cursor-pointer py-2"
            >
              <UserPlus className="w-3 h-3 mr-1" /> Tambah Pasien Baru
            </Button>
          </ComboboxItem>
        }
      />
      {selectedCard ? (
        <div className="p-4 border border-border bg-background rounded-b-xl shadow-sm space-y-3 flex flex-col gap-2 text-xm">
          <div className="flex justify-between items-center">
            <span className="font-medium truncate">
              {
                patientList.find(
                  (p: any) => p.id === watch("visits.patient_id"),
                )?.gender
              }
            </span>
            <span className="font-medium truncate">
              {formatDateIndo(
                patientList.find(
                  (p: any) => p.id === watch("visits.patient_id"),
                )?.birth_date,
              )}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
              {
                patientList.find(
                  (p: any) => p.id === watch("visits.patient_id"),
                )?.mr_number
              }
            </span>
            <Button
              variant={"outline"}
              size="sm"
              onClick={(data: any) => {
                setSelectedCard(false);
                setNewPatient(true); // reset form
                setIsEditPatient(true);
                patientList.find((p: any) => {
                  if (p.id === watch("visits.patient_id")) {
                    setValue("patients.mr_number", p.mr_number);
                    setValue("patients.gender", p.gender);
                    setValue("patients.birth_date", p.birth_date);
                    setValue("patients.address", p.address);
                    setValue("patients.phone", p.phone);
                  }
                });
              }}
            >
              <Edit3 />
            </Button>
          </div>
          <div className="flex flex-col">
            <span className="font-medium ">
              {
                patientList.find(
                  (p: any) => p.id === watch("visits.patient_id"),
                )?.address
              }
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {/* input patient */}
          {newPatient && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-2 ">
                {/* MR Number */}
                <div className="flex flex-col gap-1">
                  <Label>Nomor RM</Label>
                  <Input {...register("patients.mr_number")} readOnly />
                </div>

                {/* gender */}
                <div className="flex flex-col gap-1">
                  <Label>Jenis Kelamin</Label>
                  <Controller
                    control={control}
                    name="patients.gender"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Birth Date */}
                <div className="flex flex-col gap-1">
                  <Label>Tanggal Lahir</Label>
                  <Input
                    type="date"
                    {...register("patients.birth_date", {
                      required: true,
                    })}
                  />
                </div>

                {/* No telf */}
                <div className="flex flex-col gap-1">
                  <Label>Nomor HP</Label>
                  <Controller
                    control={control}
                    name="patients.phone"
                    render={({ field }) => (
                      <PatternFormat
                        customInput={Input}
                        mask=""
                        format="#### #### ####"
                        placeholder="08..."
                        onValueChange={(v) => {
                          field.onChange(v.value);
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="flex flex-col gap-1 w-full">
                <Label>Alamat</Label>
                <Textarea required {...register("patients.address")} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
