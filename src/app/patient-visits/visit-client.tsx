"use client";

import React, { useState, useMemo } from "react";
import { CalendarIcon, ClipboardList } from "lucide-react";
import { SectionHeader } from "@/components/section/section-header";
import { VisitFormDialog } from "./_componenets/visit-from-dialog";
import { VisitListDesktop } from "./_componenets/visit-list-desktop";
import { Field } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { endOfDay, format, isWithinInterval, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { DeleteConfirmDialog } from "./_componenets/delete-confirm-dialog";
import { VisitListMobile } from "./_componenets/visit-list-mobile";

export default function VisitClient({
  patientList,
  staffList,
  treatments,
  visitsList,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditVisit, setIsEditVisit] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);

  const handleOpenEdit = (row: any) => {
    setIsEditVisit(row);
    setIsOpen(true);
  };

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const filteredVisits = useMemo(() => {
    if (!date?.from) return visitsList;
    return visitsList.filter((visit: any) => {
      const visitDate = new Date(visit.date);
      if (date.from && date.to) {
        return isWithinInterval(visitDate, {
          start: startOfDay(date.from),
          end: endOfDay(date.to),
        });
      }
      if (date.from) {
        return visitDate.toDateString() === date.from.toDateString();
      }
      return true;
    });
  }, [date, visitsList]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4 md:p-10">
      <SectionHeader
        title="Operasional Klinik"
        description="Data kunjungan dan transaksi hari ini."
        icon={ClipboardList}
        actionLabel="Registrasi Pasien"
        onAction={() => {
          setIsEditVisit(null);
          setIsOpen(true);
        }}
      />

      <Field className="mx-auto w-60">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd MMMM yyyy", { locale: id })} -{" "}
                    {format(date.to, "dd MMMM yyyy", { locale: id })}
                  </>
                ) : (
                  format(date.from, "dd MMMM yyyy", { locale: id })
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </Field>

      {/* Main Table Section */}
      <div className="flex-1 min-h-0">
        {/* Mobile Card View */}
        <VisitListMobile
          visitsList={visitsList}
          handleOpenEdit={handleOpenEdit}
          setDeleteTarget={setDeleteTarget}
          setIsAlertDeleteOpen={setIsAlertDeleteOpen}
        />

        {/* Desktop View */}
        <VisitListDesktop
          visitsList={filteredVisits}
          handleOpenEdit={handleOpenEdit}
          setDeleteTarget={setDeleteTarget}
          setIsAlertDeleteOpen={setIsAlertDeleteOpen}
        />
      </div>

      <VisitFormDialog
        patientList={patientList}
        staffList={staffList}
        treatmentsList={treatments}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isEditVisit={isEditVisit}
      />

      <DeleteConfirmDialog
        isAlertDeleteOpen={isAlertDeleteOpen}
        setIsAlertDeleteOpen={setIsAlertDeleteOpen}
        deleteTarget={deleteTarget}
      />
    </div>
  );
}
