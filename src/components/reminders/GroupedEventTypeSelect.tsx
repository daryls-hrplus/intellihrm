import * as React from 'react';
import { Check, ChevronsUpDown, FileText, FileSignature, Shield, Heart, Target, GraduationCap, Calendar, Award, UserCheck, Sparkles, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ReminderEventType } from '@/types/reminders';

// Category configuration with icons - ordered by employee lifecycle
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  custom: { label: 'Custom', icon: Sparkles, description: 'Ad-hoc reminders' },
  onboarding: { label: 'Onboarding & Probation', icon: UserCheck, description: 'New hire and probation events' },
  employment: { label: 'Employment & Contracts', icon: FileSignature, description: 'Contracts and agreements' },
  leave: { label: 'Leave & Attendance', icon: Calendar, description: 'Leave and attendance' },
  performance: { label: 'Performance & Reviews', icon: Target, description: 'Appraisals and reviews' },
  employee_voice: { label: 'Employee Voice', icon: MessageSquare, description: 'Escalations and feedback' },
  training: { label: 'Training & Development', icon: GraduationCap, description: 'Training and skills' },
  benefits: { label: 'Benefits & Wellness', icon: Heart, description: 'Insurance and benefits' },
  document: { label: 'Documents & Certifications', icon: FileText, description: 'Credentials and licenses' },
  compliance: { label: 'Compliance & Legal', icon: Shield, description: 'Visas and legal requirements' },
  milestone: { label: 'Milestones', icon: Award, description: 'Birthdays and anniversaries' },
};

interface GroupedEventTypeSelectProps {
  eventTypes: ReminderEventType[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function GroupedEventTypeSelect({
  eventTypes,
  value,
  onValueChange,
  placeholder = 'Select event type',
  disabled = false,
  className,
}: GroupedEventTypeSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Group event types by category
  const groupedEventTypes = React.useMemo(() => {
    const groups: Record<string, ReminderEventType[]> = {};
    
    eventTypes.forEach((eventType) => {
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
  }, [eventTypes]);

  // Find selected event type
  const selectedEventType = React.useMemo(() => {
    return eventTypes.find((et) => et.id === value);
  }, [eventTypes, value]);

  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG[category] || { 
      label: category.charAt(0).toUpperCase() + category.slice(1), 
      icon: FileText, 
      description: '' 
    };
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
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
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {selectedEventType ? selectedEventType.name : placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && (
              <X
                className="h-3.5 w-3.5 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[340px] p-0 bg-popover border shadow-lg z-50" 
        align="start"
        sideOffset={4}
      >
        <Command className="bg-popover">
          <CommandInput placeholder="Search event types..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No event type found.</CommandEmpty>
            
            {/* Custom Reminder always at top */}
            <CommandGroup>
              <CommandItem
                value="custom-reminder"
                keywords={['custom', 'manual', 'ad-hoc', 'other']}
                onSelect={() => {
                  onValueChange('');
                  setOpen(false);
                }}
                className="flex items-center gap-2 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Custom Reminder</span>
                  <span className="text-xs text-muted-foreground">Create without event type</span>
                </div>
                <Check
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === '' ? 'opacity-100' : 'opacity-0'
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
                      className="pl-6 py-2"
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
