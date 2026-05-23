import { UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemTitle,
} from "./ui/item";
import { Label } from "./ui/label";

import { useController, Control } from "react-hook-form";
import { useMemo, useState } from "react";

interface FormComboboxProps {
  name: string;
  control: Control<any>;
  label: string;
  items: any[];
  idKey?: string;
  displayKey: string;
  placeholder?: string;
  renderItem?: (item: any) => React.ReactNode;
  appendContent?: React.ReactNode;
  onSelect?: (item: any) => void;
  onBlur?: (item: any) => void;
}

export function FormCombobox({
  name,
  control,
  label,
  items,
  idKey = "id",
  displayKey,
  placeholder,
  renderItem,
  appendContent,
  onSelect,
  onBlur,
}: FormComboboxProps) {
  const { field } = useController({ name, control });

  // STATE UNTUK INPUT YANG DIKETIK USER
  const [searchQuery, setSearchQuery] = useState("");

  // Mencari item yang saat ini terpilih di react-hook-form
  const selectedItem = items.find((item) => item[idKey] === field.value);

  // Menentukan apa yang tampil di kotak input (Jika tidak sedang mengetik, tampilkan nama item terpilih)
  const displayValue =
    searchQuery !== ""
      ? searchQuery
      : selectedItem
        ? selectedItem[displayKey]
        : "";

  // LOGIKA PENCARIAN/FILTER SECARA INTERNAL (Dijalankan otomatis)
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      String(item[displayKey])
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery, displayKey]);

  return (
    <div>
      <Label className="pb-2">{label}</Label>
      <Combobox items={filteredItems} modal={false}>
        <ComboboxInput
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onBlur={onBlur}
        />
        <ComboboxContent>
          <ComboboxList className="max-h-50 overflow-y-auto rounded-md bg-popover">
            <ComboboxGroup>
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem
                    key={item[idKey]}
                    value={item[displayKey]}
                    onClick={() => {
                      field.onChange(item[idKey]);
                      setSearchQuery("");
                      if (onSelect) {
                        onSelect(item);
                      }
                    }}
                  >
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <span>{item[displayKey]}</span>
                    )}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          </ComboboxList>
          <div>{appendContent}</div>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
