import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SourcePreviewItem } from '@/hooks/useReminderSourcePreview';
import { format, differenceInDays, parseISO } from 'date-fns';

interface TemplateMessagePreviewProps {
  template: string;
  sampleItems: SourcePreviewItem[];
  eventTypeName?: string;
  loading?: boolean;
}

export function TemplateMessagePreview({ 
  template, 
  sampleItems, 
  eventTypeName = 'Event',
  loading = false 
}: TemplateMessagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get current sample item
  const currentItem = sampleItems[currentIndex];

  // Calculate days until event
  const daysUntil = useMemo(() => {
    if (!currentItem?.event_date) return null;
    try {
      const eventDate = parseISO(currentItem.event_date);
      return differenceInDays(eventDate, new Date());
    } catch {
      return null;
    }
  }, [currentItem?.event_date]);

  // Replace placeholders with actual values
  const renderedMessage = useMemo(() => {
    if (!template || !currentItem) return null;

    const replacements: Record<string, { value: string; label: string }> = {
      '{employee_name}': { 
        value: currentItem.employee_name || 'Employee', 
        label: 'Employee Name' 
      },
      '{item_name}': { 
        value: currentItem.name || 'Item', 
        label: 'Item Name' 
      },
      '{event_date}': { 
        value: currentItem.event_date 
          ? format(parseISO(currentItem.event_date), 'MMMM d, yyyy')
          : 'Date', 
        label: 'Event Date' 
      },
      '{days_until}': { 
        value: daysUntil !== null ? String(daysUntil) : '0', 
        label: 'Days Until' 
      },
      '{event_type}': { 
        value: eventTypeName, 
        label: 'Event Type' 
      },
      '{manager_name}': { 
        value: 'Manager Name', 
        label: 'Manager Name' 
      },
      '{department}': { 
        value: 'Department', 
        label: 'Department' 
      },
    };

    // Split template by placeholders and rebuild with highlighted values
    const parts: { text: string; isPlaceholder: boolean; label?: string }[] = [];
    let lastIndex = 0;
    const placeholderRegex = /\{(employee_name|item_name|event_date|days_until|event_type|manager_name|department)\}/g;
    
    let match;
    while ((match = placeholderRegex.exec(template)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        parts.push({ text: template.slice(lastIndex, match.index), isPlaceholder: false });
      }
      // Add placeholder replacement
      const replacement = replacements[match[0]];
      if (replacement) {
        parts.push({ text: replacement.value, isPlaceholder: true, label: replacement.label });
      }
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < template.length) {
      parts.push({ text: template.slice(lastIndex), isPlaceholder: false });
    }

    return parts;
  }, [template, currentItem, daysUntil, eventTypeName]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sampleItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < sampleItems.length - 1 ? prev + 1 : 0));
  };

  // Don't render if no template or no sample items
  if (!template.trim()) {
    return null;
  }

  if (sampleItems.length === 0 || loading) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Eye className="h-4 w-4" />
          <span>Message Preview</span>
        </div>
        <p className="text-sm text-muted-foreground italic">
          {loading ? 'Loading sample data...' : 'Select an event type to preview with sample employee data'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4 text-primary" />
          <span>Message Preview</span>
          <Badge variant="outline" className="text-xs font-normal">
            <Users className="h-3 w-3 mr-1" />
            Sample Data
          </Badge>
        </div>
        
        {/* Navigation */}
        {sampleItems.length > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              {currentIndex + 1} of {sampleItems.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleNext}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Current employee info */}
      <div className="px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground">
        <span className="font-medium">{currentItem?.employee_name}</span>
        {currentItem?.name && (
          <>
            {' · '}
            <span>{currentItem.name}</span>
          </>
        )}
        {currentItem?.event_date && (
          <>
            {' · '}
            <span>
              {format(parseISO(currentItem.event_date), 'MMM d, yyyy')}
              {daysUntil !== null && (
                <span className={cn(
                  'ml-1',
                  daysUntil <= 7 ? 'text-destructive' : 
                  daysUntil <= 30 ? 'text-amber-600' : ''
                )}>
                  ({daysUntil} days)
                </span>
              )}
            </span>
          </>
        )}
      </div>

      {/* Rendered message */}
      <div className="p-4">
        <div className="text-sm leading-relaxed">
          {renderedMessage?.map((part, idx) => (
            <span
              key={idx}
              className={cn(
                part.isPlaceholder && 'bg-primary/15 text-primary font-medium px-1 py-0.5 rounded mx-0.5'
              )}
              title={part.isPlaceholder ? part.label : undefined}
            >
              {part.text}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t bg-muted/10 text-xs text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="bg-primary/15 text-primary px-1 rounded text-[10px]">highlighted</span>
          = replaced placeholder
        </span>
      </div>
    </div>
  );
}
