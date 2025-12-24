import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus, ArrowRight, RefreshCw } from "lucide-react";
import { useFeatureRegistrySync } from "@/hooks/useFeatureRegistrySync";
import { cn } from "@/lib/utils";

interface NewFeaturesIndicatorProps {
  onSyncClick: () => void;
  className?: string;
}

export function NewFeaturesIndicator({
  onSyncClick,
  className,
}: NewFeaturesIndicatorProps) {
  const { unsyncedCount, unsyncedFeatures, isCheckingUnsynced } = useFeatureRegistrySync();
  const [open, setOpen] = useState(false);

  if (unsyncedCount === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10",
            className
          )}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">New Features</span>
          <Badge 
            variant="default" 
            className="ml-1 h-5 min-w-5 px-1.5 text-xs font-bold"
          >
            {unsyncedCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">New Features Detected</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {unsyncedCount} feature{unsyncedCount !== 1 ? "s" : ""} in the registry not yet in database
          </p>
        </div>

        <ScrollArea className="max-h-[250px]">
          <div className="p-2 space-y-1">
            {unsyncedFeatures.slice(0, 10).map((feature) => (
              <div
                key={feature.code}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 text-sm"
              >
                <Plus className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{feature.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {feature.moduleName} → {feature.groupName}
                  </p>
                </div>
              </div>
            ))}
            {unsyncedCount > 10 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{unsyncedCount - 10} more features
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              setOpen(false);
              onSyncClick();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Sync Registry
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
