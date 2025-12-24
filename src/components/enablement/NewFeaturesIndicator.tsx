import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus, ArrowRight, RefreshCw, Database, ExternalLink } from "lucide-react";
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
  const navigate = useNavigate();
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
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">New Features in Code Registry</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {unsyncedCount} feature{unsyncedCount !== 1 ? "s" : ""} defined in code but not yet synced to the database
          </p>
        </div>

        <ScrollArea className="max-h-[350px]">
          <div className="p-2 space-y-1">
            {unsyncedFeatures.map((feature) => (
              <div
                key={feature.code}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 text-sm"
              >
                <Plus className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{feature.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {feature.moduleName} → {feature.groupName}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {feature.code}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-2 border-t space-y-2">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              setOpen(false);
              onSyncClick();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Sync to Database
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              setOpen(false);
              navigate("/enablement/feature-database");
            }}
          >
            <Database className="h-4 w-4" />
            View All Features in Database
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
