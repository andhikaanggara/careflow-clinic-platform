"use client";

import React from "react";
import { DateRange } from "react-day-picker";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Field } from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function RangePicker() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  return (
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
  );
}
