import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getCategoryLabel, getCategoryIcon } from './competencyCategoryConfig';

interface CompetencyCategoryFilterProps {
  categories: Array<[string, number]>; // [normalizedKey, count]
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
}

export function CompetencyCategoryFilter({
  categories,
  value,
  onValueChange,
  placeholder = 'All Categories',
  totalCount,
}: CompetencyCategoryFilterProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = value === 'all' 
    ? placeholder 
    : getCategoryLabel(value);

  const SelectedIcon = value === 'all' ? Layers : getCategoryIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-background hover:bg-accent"
        >
          <div className="flex items-center gap-2 truncate">
            <SelectedIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedLabel}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 bg-popover border shadow-lg z-50" 
        align="start"
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search categories..." 
              className="h-9 border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {/* All Categories option */}
              <CommandItem
                value="all"
                onSelect={() => {
                  onValueChange('all');
                  setOpen(false);
                }}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span>{placeholder}</span>
                </div>
                <div className="flex items-center gap-2">
                  {totalCount !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {totalCount}
                    </Badge>
                  )}
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === 'all' ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              </CommandItem>

              {/* Category options */}
              {categories.map(([categoryKey, count]) => {
                const Icon = getCategoryIcon(categoryKey);
                const label = getCategoryLabel(categoryKey);
                
                return (
                  <CommandItem
                    key={categoryKey}
                    value={label}
                    onSelect={() => {
                      onValueChange(categoryKey);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === categoryKey ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
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
