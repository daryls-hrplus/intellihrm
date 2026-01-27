import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  type ActDefinition,
  getActSectionCount,
} from "@/constants/manualsStructure";
import { ManualCard } from "./ManualCard";

interface ManualsActSectionProps {
  act: ActDefinition;
  isExpanded: boolean;
  onToggle: () => void;
  onManualClick: (manualId: string, manualTitle: string, href: string) => void;
}

export function ManualsActSection({ 
  act, 
  isExpanded, 
  onToggle,
  onManualClick,
}: ManualsActSectionProps) {
  const IconComponent = act.icon;
  const sectionCount = getActSectionCount(act);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={cn(
        "overflow-hidden transition-all",
        isExpanded && "ring-1 ring-primary/20"
      )}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start p-0 h-auto hover:bg-transparent",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          >
            <div className={cn(
              "w-full p-4 md:p-6",
              `bg-gradient-to-r ${act.bgGradient}`
            )}>
              <div className="flex items-start gap-4">
                {/* Act Icon */}
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  `bg-${act.color}-500/20`
                )}>
                  <IconComponent className={cn("h-6 w-6", `text-${act.color}-600 dark:text-${act.color}-400`)} />
                </div>

                {/* Act Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                      {act.actLabel}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {sectionCount} sections
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {act.manuals.length} {act.manuals.length === 1 ? "guide" : "guides"}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {act.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {act.subtitle}
                  </p>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="shrink-0 self-center">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Narrative (visible when collapsed too, but truncated) */}
              <p className={cn(
                "text-sm text-muted-foreground mt-4 leading-relaxed",
                !isExpanded && "line-clamp-2"
              )}>
                {act.narrative}
              </p>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 px-6">
            {/* Themes */}
            <div className="flex flex-wrap gap-2 mb-6 pt-2">
              {act.themes.map((theme, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-xs bg-muted/50 rounded-full px-3 py-1.5"
                >
                  <span className="font-medium">{theme.title}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{theme.description}</span>
                </div>
              ))}
            </div>

            {/* Manual Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {act.manuals.map((manual) => (
                <ManualCard
                  key={manual.id}
                  manual={manual}
                  onClick={() => onManualClick(manual.id, manual.title, manual.href)}
                />
              ))}
            </div>

            {/* Outcomes */}
            {act.outcomes.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Key Outcomes</h4>
                <ul className="grid gap-2 md:grid-cols-3">
                  {act.outcomes.map((outcome, idx) => (
                    <li 
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className={cn(
                        "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                        `bg-${act.color}-500`
                      )} />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
