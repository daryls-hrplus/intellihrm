import { Badge } from "@/components/ui/badge";
import { InboxItem, InboxCategory } from "@/hooks/useEssInbox";
import { InboxItemCard } from "./InboxItemCard";
import { 
  Calendar, 
  CreditCard, 
  ClipboardCheck, 
  CheckSquare, 
  FileText, 
  GraduationCap,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const categoryConfig: Record<InboxCategory, { icon: React.ElementType; label: string; color: string }> = {
  time_absence: { icon: Calendar, label: 'Time & Absence', color: 'text-green-600' },
  pay_benefits: { icon: CreditCard, label: 'Pay & Benefits', color: 'text-emerald-600' },
  performance: { icon: ClipboardCheck, label: 'Performance', color: 'text-violet-600' },
  tasks_approvals: { icon: CheckSquare, label: 'Tasks & Approvals', color: 'text-amber-600' },
  documents: { icon: FileText, label: 'Documents', color: 'text-purple-600' },
  learning: { icon: GraduationCap, label: 'Learning & Development', color: 'text-indigo-600' },
};

interface InboxCategorySectionProps {
  category: InboxCategory;
  items: InboxItem[];
  defaultOpen?: boolean;
}

export function InboxCategorySection({ category, items, defaultOpen = true }: InboxCategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = categoryConfig[category];
  const Icon = config.icon;
  
  const responseRequiredCount = items.filter(i => i.urgency === 'response_required').length;

  if (items.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className="font-semibold text-sm">{config.label}</span>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
          {responseRequiredCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {responseRequiredCount} urgent
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2 pt-2">
        {items.map((item) => (
          <InboxItemCard key={item.id} item={item} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
