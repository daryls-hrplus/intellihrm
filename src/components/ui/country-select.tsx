import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries, getCountryName } from "@/lib/countries";

export interface CountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Whether to use ISO code or full name as the value */
  valueType?: "code" | "name";
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country...",
  disabled = false,
  className,
  valueType = "code",
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const displayValue = React.useMemo(() => {
    if (!value) return "";
    if (valueType === "code") {
      return getCountryName(value);
    }
    return value;
  }, [value, valueType]);

  const handleSelect = (selectedValue: string) => {
    const country = countries.find(
      c => c.name.toLowerCase() === selectedValue.toLowerCase()
    );
    if (country && onChange) {
      onChange(valueType === "code" ? country.code : country.name);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-50 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {countries.map((country) => {
                const isSelected = valueType === "code" 
                  ? value === country.code 
                  : value === country.name;
                return (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2 text-muted-foreground">{country.code}</span>
                    {country.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
