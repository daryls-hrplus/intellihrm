import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, Plus, Check, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { VALUE_TEMPLATES } from "@/hooks/capabilities/useValueAI";

interface ValueQuickStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: typeof VALUE_TEMPLATES[0] | null) => void;
}

export function ValueQuickStartDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: ValueQuickStartDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected === "custom") {
      onSelectTemplate(null);
    } else {
      const template = VALUE_TEMPLATES.find((t) => t.name === selected);
      if (template) {
        onSelectTemplate(template);
      }
    }
    onOpenChange(false);
    setSelected(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Create Company Value
          </DialogTitle>
          <DialogDescription>
            Start from a common template or create a custom value from scratch.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Templates Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Start from Template
            </Label>
            <RadioGroup value={selected || ""} onValueChange={setSelected}>
              <div className="grid grid-cols-2 gap-2">
                {VALUE_TEMPLATES.map((template) => (
                  <div
                    key={template.name}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:border-primary/50",
                      selected === template.name
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    )}
                    onClick={() => setSelected(template.name)}
                  >
                    <RadioGroupItem
                      value={template.name}
                      id={template.name}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {template.name}
                        </span>
                        {template.is_promotion_factor && (
                          <Award className="h-3 w-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {template.description}
                      </p>
                    </div>
                    {selected === template.name && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Custom Option */}
          <div className="pt-2 border-t">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/50",
                selected === "custom"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-dashed border-border"
              )}
              onClick={() => setSelected("custom")}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Create Custom Value</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Start with a blank form and use AI assistance to build your value
                </p>
              </div>
              {selected === "custom" && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
          </div>

          {/* AI Hint */}
          <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">AI-Powered: </span>
              Templates include pre-defined behavioral levels. Custom values get
              AI-generated descriptions and levels based on your value name.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!selected}>
            {selected === "custom" ? (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Use Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
