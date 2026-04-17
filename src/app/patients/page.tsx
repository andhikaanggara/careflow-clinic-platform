// "use server";

// import React, { useState } from "react";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   User,
//   Stethoscope,
//   Receipt,
//   CreditCard,
//   Search,
//   CalendarDays,
//   MoreVertical,
//   Loader2,
// } from "lucide-react";
// import { createClient } from "../../lib/utils"; // Sesuaikan dengan path utilitas Supabase Anda
// import { useRouter } from "next/navigation";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";

// // Server Actions (Simulated inside component or imported)
// // Note: In a real app, these would be in a separate file with 'use server'
// async function savePatient(data: any) {
//   const supabase = createClient();
//   if (data.id) {
//     const { error } = await supabase
//       .from("patients")
//       .update(data)
//       .eq("id", data.id);
//     if (error) throw error;
//   } else {
//     const { error } = await supabase.from("patients").insert([data]);
//     if (error) throw error;
//   }
// }

// async function deletePatient(id: string) {
//   const supabase = createClient();
//   const { error } = await supabase.from("patients").delete().eq("id", id);
//   if (error) throw error;
// }

// export default async function PatientManagementPage() {
//   const [patients, setPatients] = React.useState<any[]>([]);
//   const [attendances, setAttendances] = React.useState<any[]>([]);
//   const [isLoading, setIsLoading] = React.useState(true);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState<any>(null);

//   const router = useRouter();
//   const supabase = createClient();

//   const fetchData = async () => {
//     setIsLoading(true);
//     const { data: pData } = await supabase
//       .from("patients")
//       .select("*, attendance:attendance_id(date, shift, staff_name)")
//       .order("created_at", { ascending: false });

//     const { data: aData } = await supabase
//       .from("attendance")
//       .select("id, date, shift, staff_name");

//     if (pData) setPatients(pData);
//     if (aData) setAttendances(aData);
//     setIsLoading(false);
//   };

//   React.useEffect(() => {
//     fetchData();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     const formData = new FormData(e.currentTarget);

//     const payload = {
//       nama_pasien: formData.get("nama_pasien"),
//       poli_tujuan: formData.get("poli_tujuan"),
//       attendance_id: formData.get("attendance_id"),
//       tindakan_medis: formData.get("tindakan_medis"),
//       tipe_resep: formData.get("tipe_resep"),
//       jumlah_bayar: Number(formData.get("jumlah_bayar")),
//       metode_bayar: formData.get("metode_bayar"),
//       ...(selectedPatient?.id && { id: selectedPatient.id }),
//     };

//     try {
//       await savePatient(payload);
//       toast.success(
//         selectedPatient ? "Data berhasil diperbarui" : "Data berhasil disimpan",
//       );
//       setIsOpen(false);
//       setSelectedPatient(null);
//       fetchData();
//     } catch (error: any) {
//       toast.error(error.message || "Terjadi kesalahan");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
//     try {
//       await deletePatient(id);
//       toast.success("Data berhasil dihapus");
//       fetchData();
//     } catch (error: any) {
//       toast.error(error.message || "Gagal menghapus data");
//     }
//   };

//   const openEdit = (patient: any) => {
//     setSelectedPatient(patient);
//     setIsOpen(true);
//   };

//   return (
//     <div className="container mx-auto py-6 px-4 space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Data Transaksi Pasien
//           </h1>
//           <p className="text-muted-foreground">
//             Kelola antrean dan administrasi pembayaran pasien.
//           </p>
//         </div>

//         <Dialog
//           open={isOpen}
//           onOpenChange={(val) => {
//             setIsOpen(val);
//             if (!val) setSelectedPatient(null);
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button className="w-full md:w-auto">
//               <Plus className="mr-2 h-4 w-4" /> Tambah Pasien
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>
//                 {selectedPatient ? "Edit Data Pasien" : "Input Pasien Baru"}
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <Label htmlFor="nama_pasien">Nama Pasien</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="nama_pasien"
//                     name="nama_pasien"
//                     defaultValue={selectedPatient?.nama_pasien}
//                     className="pl-9"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Poli Tujuan</Label>
//                   <Select
//                     name="poli_tujuan"
//                     defaultValue={selectedPatient?.poli_tujuan || "Umum"}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Pilih Poli" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {[
//                         "Umum",
//                         "Umum BPJS",
//                         "Gigi",
//                         "Gigi BPJS",
//                         "Apotek",
//                         "Lab",
//                       ].map((p) => (
//                         <SelectItem key={p} value={p}>
//                           {p}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Petugas Jaga</Label>
//                   <Select
//                     name="attendance_id"
//                     defaultValue={selectedPatient?.attendance_id}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Pilih Petugas" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {attendances.map((att) => (
//                         <SelectItem key={att.id} value={att.id}>
//                           {att.staff_name} ({att.date} - {att.shift})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="tindakan_medis">Tindakan Medis</Label>
//                 <Textarea
//                   id="tindakan_medis"
//                   name="tindakan_medis"
//                   defaultValue={selectedPatient?.tindakan_medis}
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Tipe Resep</Label>
//                   <Select
//                     name="tipe_resep"
//                     defaultValue={selectedPatient?.tipe_resep || "Tidak ada"}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {[
//                         "Tidak ada",
//                         "Racikan",
//                         "Non-Racikan",
//                         "Suket",
//                         "Rujukan",
//                         "Copy Resep",
//                       ].map((t) => (
//                         <SelectItem key={t} value={t}>
//                           {t}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Metode Bayar</Label>
//                   <Select
//                     name="metode_bayar"
//                     defaultValue={selectedPatient?.metode_bayar || "Cash"}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {["Cash", "QRIS", "Transfer", "BPJS"].map((m) => (
//                         <SelectItem key={m} value={m}>
//                           {m}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="jumlah_bayar">Jumlah Bayar (Rp)</Label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-2.5 text-sm font-medium text-muted-foreground">
//                     Rp
//                   </span>
//                   <Input
//                     type="number"
//                     id="jumlah_bayar"
//                     name="jumlah_bayar"
//                     defaultValue={selectedPatient?.jumlah_bayar}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>

//               <DialogFooter className="pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Batal
//                 </Button>
//                 <Button type="submit" disabled={isSubmitting}>
//                   {isSubmitting && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   Simpan Data
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-lg font-medium">Daftar Pasien</CardTitle>
//             <div className="relative w-full max-w-sm">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input placeholder="Cari pasien..." className="pl-8 h-9" />
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border overflow-hidden">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader className="bg-muted/50">
//                   <TableRow>
//                     <TableHead>Nama Pasien</TableHead>
//                     <TableHead>Poli</TableHead>
//                     <TableHead>Petugas Jaga</TableHead>
//                     <TableHead>Total Bayar</TableHead>
//                     <TableHead className="text-right">Aksi</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoading ? (
//                     <TableRow>
//                       <TableCell colSpan={5} className="h-24 text-center">
//                         <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
//                       </TableCell>
//                     </TableRow>
//                   ) : patients.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={5}
//                         className="h-24 text-center text-muted-foreground"
//                       >
//                         Belum ada data pasien hari ini.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     patients.map((patient) => (
//                       <TableRow key={patient.id}>
//                         <TableCell className="font-medium">
//                           <div className="flex items-center gap-2">
//                             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
//                               <User className="h-4 w-4 text-primary" />
//                             </div>
//                             {patient.nama_pasien}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                             {patient.poli_tujuan}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           <div className="flex flex-col">
//                             <span>{patient.attendance?.staff_name || "-"}</span>
//                             <span className="text-xs text-muted-foreground">
//                               {patient.attendance?.shift}
//                             </span>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex flex-col">
//                             <span className="font-semibold">
//                               Rp {patient.jumlah_bayar?.toLocaleString("id-ID")}
//                             </span>
//                             <span className="text-[10px] uppercase text-muted-foreground">
//                               {patient.metode_bayar}
//                             </span>
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2">
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => openEdit(patient)}
//                             >
//                               <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleDelete(patient.id)}
//                             >
//                               <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
