import { Star, CheckCircle2, MinusCircle, AlertCircle, XCircle, LucideIcon } from "lucide-react";

export interface ResponsibilityLevel {
  value: number;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  description: string;
}

export const RESPONSIBILITY_LEVELS: ResponsibilityLevel[] = [
  {
    value: 1,
    label: "Not Met",
    icon: XCircle,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10 border-destructive/30 hover:bg-destructive/20",
    description: "Fails to meet basic requirements of the responsibility",
  },
  {
    value: 2,
    label: "Improvement Needed",
    icon: AlertCircle,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20",
    description: "Below expectations, requires significant improvement",
  },
  {
    value: 3,
    label: "Partially Met",
    icon: MinusCircle,
    colorClass: "text-muted-foreground",
    bgClass: "bg-secondary border-border hover:bg-secondary/80",
    description: "Meets most requirements with some notable gaps",
  },
  {
    value: 4,
    label: "Met",
    icon: CheckCircle2,
    colorClass: "text-green-600",
    bgClass: "bg-green-500/10 border-green-500/30 hover:bg-green-500/20",
    description: "Fully meets all requirements consistently",
  },
  {
    value: 5,
    label: "Exceeded",
    icon: Star,
    colorClass: "text-primary",
    bgClass: "bg-primary/10 border-primary/30 hover:bg-primary/20",
    description: "Consistently surpasses expectations",
  },
];

export const getResponsibilityLevel = (value: number): ResponsibilityLevel | undefined => {
  return RESPONSIBILITY_LEVELS.find(level => level.value === value);
};

export const requiresComment = (value: number): boolean => {
  return value <= 2;
};
