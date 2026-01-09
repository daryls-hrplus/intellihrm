import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapabilityCategoryProps {
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  children: React.ReactNode;
}

export function CapabilityCategory({
  title,
  icon: Icon,
  accentColor = "text-primary",
  children,
}: CapabilityCategoryProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("h-4 w-4", accentColor)} />}
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <div className="pl-6 space-y-1">{children}</div>
    </div>
  );
}

interface CapabilityItemProps {
  children: React.ReactNode;
  highlight?: boolean;
}

export function CapabilityItem({ children, highlight }: CapabilityItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-2 text-sm text-muted-foreground",
      highlight && "text-foreground font-medium"
    )}>
      <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}
