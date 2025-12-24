import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Package, Code } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FeaturePreviewItem {
  code: string;
  name: string;
  description: string;
  moduleName: string;
  groupName: string;
  icon: string;
  routePath: string;
}

interface FeaturePreviewCardProps {
  feature: FeaturePreviewItem;
  isSelected: boolean;
  onToggle: (code: string) => void;
  showDetails?: boolean;
}

export function FeaturePreviewCard({
  feature,
  isSelected,
  onToggle,
  showDetails = false,
}: FeaturePreviewCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        isSelected
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/30 border-transparent hover:bg-muted/50"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(feature.code)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{feature.name}</p>
          <Badge variant="outline" className="text-xs shrink-0">
            {feature.code}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {feature.moduleName} → {feature.groupName}
        </p>

        {showDetails && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 mt-1 text-xs text-muted-foreground"
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                Details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1.5">
              {feature.description && (
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Code className="h-3 w-3" />
                <span className="font-mono">{feature.routePath || "N/A"}</span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

interface FeatureModuleGroupProps {
  moduleName: string;
  features: FeaturePreviewItem[];
  selectedFeatures: Set<string>;
  onToggle: (code: string) => void;
  onToggleAll: (codes: string[], selected: boolean) => void;
}

export function FeatureModuleGroup({
  moduleName,
  features,
  selectedFeatures,
  onToggle,
  onToggleAll,
}: FeatureModuleGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const allSelected = features.every((f) => selectedFeatures.has(f.code));
  const someSelected = features.some((f) => selectedFeatures.has(f.code));
  const featureCodes = features.map((f) => f.code);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onToggleAll(featureCodes, !!checked)}
          className={cn(someSelected && !allSelected && "data-[state=checked]:bg-primary/50")}
        />
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 h-auto p-1">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Package className="h-4 w-4 text-primary" />
            <span className="font-medium">{moduleName}</span>
            <Badge variant="secondary" className="ml-auto">
              {features.filter((f) => selectedFeatures.has(f.code)).length}/{features.length}
            </Badge>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="pl-6 space-y-1">
        {features.map((feature) => (
          <FeaturePreviewCard
            key={feature.code}
            feature={feature}
            isSelected={selectedFeatures.has(feature.code)}
            onToggle={onToggle}
            showDetails
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
