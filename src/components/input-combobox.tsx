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
import { Plus, X } from "lucide-react";

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
        const selectedItem = items.find(
          (item) => String(item[itemValueKey]) === String(field.value),
        );

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div
              className={showAddButton ? "grid grid-cols-8 gap-2" : "w-full"}
            >
              <Combobox items={items} modal={false}>
                <div className="relative flex items-cente col-span-7">
                  <ComboboxInput
                    id={field.name}
                    value={
                      selectedItem ? String(selectedItem[itemDisplayKey]) : ""
                    }
                    aria-invalid={fieldState.invalid}
                    className="col-span-7 w-full"
                  />
                  {field.value && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        field.onChange(""); // Paksa React Hook Form mengosongkan state field ini
                      }}
                      className="absolute right-2 top-1.5 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mr-6"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <ComboboxContent>
                  <ComboboxEmpty>{`No ${label} found`}</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => {
                      const val = String(item[itemValueKey]);
                      const lbl = String(item[itemDisplayKey]);

                      return (
                        <ComboboxItem
                          key={val}
                          value={lbl}
                          onClick={() => {
                            field.onChange(val);
                          }}
                        >
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
