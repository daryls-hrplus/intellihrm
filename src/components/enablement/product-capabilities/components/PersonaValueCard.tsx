import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonaValueCardProps {
  icon: LucideIcon;
  persona: string;
  benefit: string;
  outcomes: string[];
  accentColor?: string;
}

export function PersonaValueCard({
  icon: Icon,
  persona,
  benefit,
  outcomes,
  accentColor = "text-primary bg-primary/10",
}: PersonaValueCardProps) {
  const [textColor, bgColor] = accentColor.split(" ");
  
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-colors">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", bgColor || "bg-primary/10")}>
          <Icon className={cn("h-5 w-5", textColor || "text-primary")} />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-sm text-foreground">{persona}</h5>
          <p className="text-xs text-muted-foreground mt-0.5 italic">"{benefit}"</p>
        </div>
      </div>
      
      <ul className="mt-3 space-y-1.5">
        {outcomes.map((outcome, index) => (
          <li 
            key={index} 
            className="flex items-start gap-2 text-xs text-muted-foreground"
          >
            <span className={cn("mt-1.5 h-1 w-1 rounded-full flex-shrink-0", bgColor || "bg-primary")} />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PersonaGridProps {
  children: React.ReactNode;
}

export function PersonaGrid({ children }: PersonaGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Who Benefits
        </span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}
