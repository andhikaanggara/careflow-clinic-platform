"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { createPatient, createVisit } from "./actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NumericFormat, PatternFormat } from "react-number-format";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export default function VisitClient({ patientList, staffList }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // --- Logic State ---
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const genderList = ["Laki-laki", "Perempuan"];

  // Form State
  const [patient, setPatient] = useState({
    patient_name: "",
    mr_number: "",
    gender: "",
    birth_date: "",
    phone: "",
    address: "",
  });

  const [visits, setVisits] = useState({
    patient_id: "",
    visit_date: "",
    poly_destination: "Umum",
    recipe_type: "Biasa",
    create_by: "",
  });

  const [treatments, setTreatments] = useState([
    {
      treatment_name: "",
      main_staff_id: "",
      assistant_id: "",
    },
  ]);

  const [payment, setPayment] = useState({
    visit_id: "",
    total_amount: "",
    payment: "",
    payment_methode: "Cash",
    id_demo: "",
  });

  const [poly, setPoly] = useState("");

  // --- Handler ---
  const handleSubmitPatient = async () => {
    if (!patient.patient_name) return;
    const fd = new FormData();
    fd.append("role", patient.patient_name);

    startTransition(async () => {
      const result = await createPatient(fd);
      if (result.error)
        toast.error(`Gagal menambahkan pasien: ${result.error}`);
      else {
        setPatient({ ...patient });
        router.refresh();
        toast.success(`Peran "${patient.patient_name}" berhasil ditambahkan`);
      }
    });
  };

  const addTreatmentRow = () =>
    setTreatments([
      ...treatments,
      { treatment_name: "", main_staff_id: "", assistant_id: "" },
    ]);

  const updateTreatment = (index: number, field: string, value: any) => {
    const newTs = [...treatments];
    newTs[index] = { ...newTs[index], [field]: value };
    setTreatments(newTs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("patient_id", selectedPatient?.id);
    fd.append("poly_destination", poly);
    fd.append("treatments", JSON.stringify(treatments));

    startTransition(async () => {
      const res = await createVisit(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Kunjungan berhasil dicatat");
        setIsOpen(false);
        setTreatments([
          { treatment_name: "", main_staff_id: "", assistant_id: "" },
        ]);
      }
    });
  };

  // --- Helper ---
  // const generateMRNumber = (lastSequence = 0) => {
  //   const now = new Date();
  //   const year = now.getFullYear().toString().slice(-2); // 2 digit tahun
  //   const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 2 digit bulan
  //   const nextNumber = (patient.mr_number.length + 1).toString().padStart(3, "0"); // 3 digit urutan

  //   return `${year}${month}${nextNumber}`;
  // };

  // useEffect(() => {
  //   // Anggap '15' adalah jumlah pasien bulan ini dari database
  //   const lastPatientCount = 15;
  //   const newMR = generateMRNumber(lastPatientCount);

  //   setPatient((patient) => ({
  //     ...patient,
  //     mr_number: newMR,
  //   }));
  // }, []);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-10">
      <SectionHeader
        title="Operasional Klinik"
        description="Data kunjungan dan transaksi hari ini."
        icon={ClipboardList}
        actionLabel="Registrasi Pasien"
        onAction={() => setIsOpen(true)}
      />

      {/* Stats Section (Revenue Ringkas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-600 font-medium">Total Pasien</p>
          {/* <p className="text-2xl font-bold">{initialVisits.length}</p> */}
        </div>
        {/* Tambahkan stats lain di sini */}
      </div>

      {/* Tabel Kunjungan (Gunakan shell yang sama dengan Attendance) */}
      <div className="border rounded-xl overflow-hidden bg-background">
        {/* Render Map initialVisits di sini seperti di AttendanceClient */}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrasi Kunjungan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data Patient */}
            <section className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Patient Data
                </h3>
              </div>
              {/* nama pasient */}
              <div className="flex flex-col gap-1 ">
                <label className="text-sm font-medium">Cari Pasien</label>
                <input
                  type="hidden"
                  name="patient_name"
                  value={patient.patient_name}
                />
                <Combobox items={patientList}>
                  <ComboboxInput
                    placeholder="Nama Sesuai KTP"
                    value={patient.patient_name}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        patient_name: e.target.value,
                      })
                    }
                    required
                  />
                  <ComboboxContent>
                    <ComboboxList className="max-h-43 overflow-y-auto border rounded-md shadow-sm bg-popover">
                      {(p: any) => (
                        <ComboboxItem
                          key={p.id}
                          onClick={() =>{
                            setPatient({
                              ...patient,
                              patient_name: p.patient_name,
                            }), setIsNewPatient(false)}
                          }
                        >
                          <Item size="xs" className="p-0 cursor-pointer">
                            <ItemContent>
                              <ItemTitle className="whitespace-nowrap">
                                {p.patient_name}
                              </ItemTitle>
                              <ItemDescription>{p.birth_date}</ItemDescription>
                              <ItemDescription className="whitespace-nowrap">
                                {p.address}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                    <ComboboxList className="w-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsNewPatient(true)}
                        className="text-xs w-full cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3 mr-1" /> Tambah Pasien Baru
                      </Button>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* input patient name & mr Number */}
              {isNewPatient ? (
                <form
                  onSubmit={handleSubmitPatient}
                  className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="grid grid-cols-2 gap-2 ">
                    {/* MR Number */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">Nomor RM</label>
                      <Input
                        value={patient.mr_number} //perbaiki ini dan ambil dari useEffect
                        readOnly
                        required
                      />
                    </div>

                    {/* gender */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">
                        Jenis Kelamin
                      </label>
                      <Select
                        onValueChange={(v) =>
                          setPatient({ ...patient, gender: v })
                        }
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* input gender, no telf, birth date */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Birth Date */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">
                        Tanggal Lahir
                      </label>
                      <Input
                        type="date"
                        onChange={(e) =>
                          setPatient({ ...patient, birth_date: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* No telf */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">Nomor HP</label>
                      <PatternFormat
                        customInput={Input}
                        mask=""
                        format="#### #### ####"
                        placeholder="08..."
                        onChange={(e) =>
                          setPatient({ ...patient, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium">Alamat</label>
                    <Textarea required />
                  </div>
                  <Button type="submit">Tambah Pasien</Button>
                </form>
              ) : (
                ""
              )}
            </section>

            {/* Visits */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Visit Patient
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Poli Tujuan</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Umum">Poli Umum</SelectItem>
                      <SelectItem value="Gigi">Poli Gigi</SelectItem>
                      <SelectItem value="Bidan">Poli Kebidanan</SelectItem>
                      <SelectItem value="Apotek">Apotek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Jenis Resep</Label>
                  <Select>
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
                </div>
              </div>
            </section>

            {/* Treatments */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Tindakan Medis
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTreatmentRow}
                >
                  <Plus className="h-4 w-4 mr-1" /> Tambah
                </Button>
              </div>

              {treatments.map((t, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 items-end border-b pb-4"
                >
                  <Combobox items={staffList} modal={false}>
                    <ComboboxInput
                      placeholder="Operator"
                      value={t.main_staff_id || ""}
                      onChange={(e) =>
                        updateTreatment(idx, "main_staff_id", e.target.value)
                      }
                    />
                    <ComboboxContent className="pointer-events-auto">
                      <ComboboxList className="max-h-43 overflow-y-auto border rounded-md shadow-sm bg-popover">
                        {(item) => (
                          <ComboboxItem
                            key={item.id}
                            value={item.staff_name}
                            onClick={(e) =>
                              updateTreatment(idx, "staff_name", item.id)
                            }
                          >
                            {item.role}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <div className="flex gap-2">
                    <Combobox items={staffList} modal={false}>
                      <ComboboxInput
                        placeholder="Operator"
                        value={t.main_staff_id || ""}
                        onChange={(e) =>
                          updateTreatment(idx, "main_staff_id", e.target.value)
                        }
                      />
                      <ComboboxContent className="pointer-events-auto">
                        <ComboboxList className="max-h-43 overflow-y-auto border rounded-md shadow-sm bg-popover">
                          {(item) => (
                            <ComboboxItem
                              key={item.id}
                              value={item.staff_name}
                              onClick={(e) =>
                                updateTreatment(idx, "staff_name", item.id)
                              }
                            >
                              {item.role}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <Combobox items={staffList} modal={false}>
                      <ComboboxInput
                        placeholder="Asisten"
                        value={t.assistant_id || ""}
                        onChange={(e) =>
                          updateTreatment(idx, "assistant_id", e.target.value)
                        }
                      />
                      <ComboboxContent className="pointer-events-auto">
                        <ComboboxList className="max-h-43 overflow-y-auto border rounded-md shadow-sm bg-popover">
                          {(item) => (
                            <ComboboxItem
                              key={item.id}
                              value={item.staff_name}
                              onClick={(e) =>
                                updateTreatment(idx, "staff_name", item.id)
                              }
                            >
                              {item.role}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTreatments(treatments.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payments */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Total Bayar</Label>
                <NumericFormat
                  customInput={Input}
                  onChange={(e) =>
                    setPayment({ ...payment, total_amount: e.target.value })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp. "
                  placeholder="Rp. 0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Terbayar</Label>
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp. "
                  placeholder="Rp. 0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Metode</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BPJS">BPJS</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Qris">Qris</SelectItem>
                    <SelectItem value="Trasfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <div className="mr-auto text-lg font-bold">
                Total:
                {payment.total_amount}
              </div>
              <Button type="submit" disabled={isPending}>
                Simpan Kunjungan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
