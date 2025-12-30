import * as React from 'react';
import { Check, ChevronsUpDown, FileText, FileSignature, Shield, Heart, Target, GraduationCap, Calendar, Award, UserCheck, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ReminderEventType } from '@/types/reminders';

// Category configuration with icons
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  document: { label: 'Documents', icon: FileText },
  contract: { label: 'Contract & Employment', icon: FileSignature },
  compliance: { label: 'Compliance', icon: Shield },
  benefits: { label: 'Benefits', icon: Heart },
  performance: { label: 'Performance', icon: Target },
  training: { label: 'Training', icon: GraduationCap },
  leave: { label: 'Leave', icon: Calendar },
  milestone: { label: 'Milestones', icon: Award },
  probation: { label: 'Probation', icon: UserCheck },
  custom: { label: 'Custom', icon: Sparkles },
};

interface GroupedEventTypeFilterProps {
  eventTypes: ReminderEventType[];
  value: string;
  onValueChange: (value: string) => void;
  categoryFilter?: string;
  placeholder?: string;
  className?: string;
}

export function GroupedEventTypeFilter({
  eventTypes,
  value,
  onValueChange,
  categoryFilter = 'all',
  placeholder = 'All Event Types',
  className,
}: GroupedEventTypeFilterProps) {
  const [open, setOpen] = React.useState(false);

  // Filter event types by category if needed
  const filteredEventTypes = React.useMemo(() => {
    if (categoryFilter === 'all') return eventTypes;
    return eventTypes.filter((et) => et.category === categoryFilter);
  }, [eventTypes, categoryFilter]);

  // Group event types by category
  const groupedEventTypes = React.useMemo(() => {
    const groups: Record<string, ReminderEventType[]> = {};
    
    filteredEventTypes.forEach((eventType) => {
      const category = eventType.category || 'custom';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(eventType);
    });

    // Sort categories by the order defined in CATEGORY_CONFIG
    const orderedCategories = Object.keys(CATEGORY_CONFIG);
    const sortedGroups: { category: string; items: ReminderEventType[] }[] = [];
    
    orderedCategories.forEach((category) => {
      if (groups[category] && groups[category].length > 0) {
        sortedGroups.push({ category, items: groups[category] });
      }
    });

    // Add any remaining categories not in CATEGORY_CONFIG
    Object.keys(groups).forEach((category) => {
      if (!orderedCategories.includes(category)) {
        sortedGroups.push({ category, items: groups[category] });
      }
    });

    return sortedGroups;
  }, [filteredEventTypes]);

  // Find selected event type
  const selectedEventType = React.useMemo(() => {
    return eventTypes.find((et) => et.id === value);
  }, [eventTypes, value]);

  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG[category] || { 
      label: category.charAt(0).toUpperCase() + category.slice(1), 
      icon: FileText
    };
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-[220px] justify-between font-normal bg-background',
            !value || value === 'all' ? 'text-muted-foreground' : '',
            className
          )}
        >
          <span className="truncate">
            {value === 'all' || !value ? placeholder : selectedEventType?.name || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 bg-popover border shadow-lg z-50" 
        align="start"
        sideOffset={4}
      >
        <Command className="bg-popover">
          <CommandInput placeholder="Search event types..." />
          <CommandList className="max-h-[350px]">
            <CommandEmpty>No event type found.</CommandEmpty>
            
            {/* All option */}
            <CommandGroup>
              <CommandItem
                value="all-event-types"
                onSelect={() => {
                  onValueChange('all');
                  setOpen(false);
                }}
                className="flex items-center gap-2 py-2"
              >
                <span className="flex-1">{placeholder}</span>
                <Check
                  className={cn(
                    'ml-2 h-4 w-4',
                    value === 'all' || !value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Grouped event types */}
            {groupedEventTypes.map(({ category, items }) => {
              const config = getCategoryConfig(category);
              const IconComponent = config.icon;

              return (
                <CommandGroup key={category} heading={
                  <div className="flex items-center gap-2 py-1">
                    <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{config.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{items.length}</span>
                  </div>
                }>
                  {items.map((eventType) => (
                    <CommandItem
                      key={eventType.id}
                      value={eventType.name}
                      keywords={[eventType.code, eventType.category, eventType.description || '']}
                      onSelect={() => {
                        onValueChange(eventType.id);
                        setOpen(false);
                      }}
                      className="pl-6 py-1.5"
                    >
                      <span className="flex-1 truncate">{eventType.name}</span>
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4 shrink-0',
                          value === eventType.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
