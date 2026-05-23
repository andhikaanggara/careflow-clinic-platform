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
import { FormErrorMessage } from "@/components/ui/form-error";
import { Controller, useFormContext } from "react-hook-form";
import { PatternFormat } from "react-number-format";

export function PatientFormSection({
  patientList = [],
  selectedCard,
  setSelectedCard,
  newPatient,
  setNewPatient,
  setIsEditPatient,
  generateMRNumber,
}: any) {
  const { control, setValue, watch, register, reset } = useFormContext();

  const selectedPatientId = watch("patient_id");
  const currentGender = watch("patients.gender");
  const currentPatientData = patientList.find(
    (p: any) => p.id === selectedPatientId,
  );

  return (
    <section>
      <div className="flex flex-col gap-1">
        <FormCombobox
          name="patient_id"
          control={control}
          label="Cari Pasien"
          items={patientList}
          displayKey="patient_name"
          placeholder="Nama Sesuai KTP"
          onSelect={(item) => {
            setValue("patient_id", item.id);
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
                className=" text-xs cursor-pointer py-2"
              >
                <UserPlus className="w-3 h-3 mr-1" /> Tambah Pasien Baru
              </Button>
            </ComboboxItem>
          }
        />
        <FormErrorMessage name="patient_id" />
      </div>

      {selectedCard && currentPatientData ? (
        <div className="p-4 border border-border bg-background rounded-b-xl shadow-sm space-y-3 flex flex-col gap-2 text-xm">
          <div className="flex justify-between items-center">
            <span className="font-medium truncate">
              {currentPatientData.gender}
            </span>
            <span className="font-medium truncate">
              {formatDateIndo(currentPatientData.birth_date)}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
              {currentPatientData.mr_number}
            </span>
            <Button
              variant={"outline"}
              size="sm"
              onClick={() => {
                setSelectedCard(false);
                setNewPatient(true);
                setIsEditPatient(true);
                setValue("patients.mr_number", currentPatientData.mr_number);
                setValue("patients.gender", currentPatientData.gender);
                setValue("patients.birth_date", currentPatientData.birth_date);
                setValue("patients.address", currentPatientData.address);
                setValue("patients.phone", currentPatientData.phone);
              }}
            >
              <Edit3 />
            </Button>
          </div>
          <div className="flex flex-col">
            <span className="font-medium ">{currentPatientData.address}</span>
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
                  <Input
                    {...register("patients.mr_number")}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  <FormErrorMessage name="patients.mr_number" />
                </div>

                {/* gender */}
                <div className="flex flex-col gap-1">
                  <Label>Jenis Kelamin</Label>
                  <Select
                    value={currentGender}
                    onValueChange={(value) =>
                      setValue("patients.gender", value, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormErrorMessage name="patients.gender" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Birth Date */}
                <div className="flex flex-col gap-1">
                  <Label>Tanggal Lahir</Label>
                  <Input type="date" {...register("patients.birth_date")} />
                  <FormErrorMessage name="patients.birth_date" />
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
                  <FormErrorMessage name="patients.phone" />
                </div>
              </div>

              {/* Alamat */}
              <div className="flex flex-col gap-1 w-full">
                <Label>Alamat</Label>
                <Textarea {...register("patients.address")} />
                <FormErrorMessage name="patients.address" />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
