"use client";

import { useState, useEffect } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface FormComboboxProps<T, TFormValues extends FieldValues> {
  control: Control<TFormValues>;
  name: FieldPath<TFormValues>;
  label: string;
  placeholder?: string;
  items: T[];
  itemValueKey: keyof T;
  itemDisplayKey: keyof T;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function InputCombobox<T, TFormValues extends FieldValues>({
  control,
  name,
  label,
  items,
  itemValueKey,
  itemDisplayKey,
  showAddButton = false,
  onAddClick,
}: FormComboboxProps<T, TFormValues>) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        useEffect(() => {
          if (field.value) {
            const initialItem = items.find(
              (item) => String(item[itemValueKey]) === String(field.value),
            );
            if (initialItem) {
              setSearchQuery(String(initialItem[itemDisplayKey]));
            }
          } else {
            setSearchQuery("");
          }
        }, [field.value, items, itemValueKey, itemDisplayKey]);

        const filteredItems = items.filter((item) =>
          String(item[itemDisplayKey])
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        );

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div
              className={showAddButton ? "grid grid-cols-8 gap-2" : "w-full"}
            >
              <Combobox
                items={filteredItems}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);

                  const selected = items.find(
                    (item) => String(item[itemValueKey]) === String(val),
                  );
                  if (selected) {
                    setSearchQuery(String(selected[itemDisplayKey]));
                  }
                }}
              >
                <ComboboxInput
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="col-span-7"
                />
                <ComboboxContent>
                  <ComboboxEmpty>{`No ${label} found`}</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => {
                      const val = String(item[itemValueKey]);
                      const lbl = String(item[itemDisplayKey]);
                      return (
                        <ComboboxItem key={val} value={val}>
                          {lbl}
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {showAddButton && (
                <Button type="button" onClick={onAddClick}>
                  <Plus />
                </Button>
              )}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
