import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuestionAnchors } from "@/hooks/useBehavioralAnchors";
import { Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BARSRatingScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  anchors?: QuestionAnchors;
  displayMode?: 'tooltip' | 'inline' | 'popup';
  scaleMax?: number;
  disabled?: boolean;
  showLabels?: boolean;
}

export function BARSRatingScale({
  value,
  onChange,
  anchors,
  displayMode = 'tooltip',
  scaleMax = 5,
  disabled = false,
  showLabels = true,
}: BARSRatingScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const getButtonVariant = (scaleValue: number): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (value === scaleValue) return 'default';
    if (hoveredValue === scaleValue) return 'secondary';
    return 'outline';
  };

  const getScaleColor = (scaleValue: number): string => {
    if (scaleValue <= 2) return 'border-destructive/50 hover:border-destructive';
    if (scaleValue === 3) return 'border-warning/50 hover:border-warning';
    return 'border-success/50 hover:border-success';
  };

  const getSelectedColor = (scaleValue: number): string => {
    if (scaleValue <= 2) return 'bg-destructive text-destructive-foreground';
    if (scaleValue === 3) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const handleClick = (scaleValue: number) => {
    if (!disabled) {
      onChange(scaleValue);
    }
  };

  const renderRatingButton = (scaleValue: number) => {
    const anchor = anchors?.[scaleValue.toString()];
    const isSelected = value === scaleValue;
    const isHovered = hoveredValue === scaleValue;

    const button = (
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleClick(scaleValue)}
        onMouseEnter={() => setHoveredValue(scaleValue)}
        onMouseLeave={() => setHoveredValue(null)}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 transition-all",
          "min-w-[48px] min-h-[48px] p-2",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          isSelected ? getSelectedColor(scaleValue) : getScaleColor(scaleValue),
          isHovered && !isSelected && "bg-muted"
        )}
      >
        <span className="text-lg font-semibold">{scaleValue}</span>
        {isSelected && (
          <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4" />
        )}
      </button>
    );

    if (displayMode === 'tooltip' && anchor) {
      return (
        <TooltipProvider key={scaleValue}>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold">{anchor.label}</div>
                <div className="text-xs">{anchor.description}</div>
                {anchor.examples?.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Examples: </span>
                    {anchor.examples.slice(0, 2).join('; ')}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  if (displayMode === 'popup') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {Array.from({ length: scaleMax }, (_, i) => i + 1).map(scaleValue => (
              <div key={scaleValue}>
                {renderRatingButton(scaleValue)}
              </div>
            ))}
          </div>
          {anchors && (
            <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Rating Scale Guide</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {Array.from({ length: scaleMax }, (_, i) => i + 1).map(scaleValue => {
                    const anchor = anchors[scaleValue.toString()];
                    return (
                      <div 
                        key={scaleValue} 
                        className={cn(
                          "flex items-start gap-3 p-2 rounded-lg border",
                          value === scaleValue && "bg-muted border-primary"
                        )}
                      >
                        <Badge 
                          variant={scaleValue >= 4 ? 'default' : scaleValue <= 2 ? 'destructive' : 'secondary'}
                          className="min-w-[28px] justify-center"
                        >
                          {scaleValue}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {anchor?.label || `Level ${scaleValue}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {anchor?.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {showLabels && value && anchors?.[value.toString()] && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{anchors[value.toString()].label}</span>
          </div>
        )}
      </div>
    );
  }

  // Inline display mode
  if (displayMode === 'inline') {
    return (
      <div className="space-y-3">
        {Array.from({ length: scaleMax }, (_, i) => i + 1).map(scaleValue => {
          const anchor = anchors?.[scaleValue.toString()];
          const isSelected = value === scaleValue;

          return (
            <button
              key={scaleValue}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(scaleValue)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <Badge 
                variant={isSelected ? 'default' : 'outline'}
                className="min-w-[28px] justify-center shrink-0"
              >
                {scaleValue}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {anchor?.label || `Level ${scaleValue}`}
                </div>
                {anchor?.description && (
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {anchor.description}
                  </div>
                )}
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default tooltip mode
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {Array.from({ length: scaleMax }, (_, i) => i + 1).map(scaleValue => (
          <div key={scaleValue}>
            {renderRatingButton(scaleValue)}
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{anchors?.['1']?.label || 'Needs Development'}</span>
          <span>{anchors?.[scaleMax.toString()]?.label || 'Exceptional'}</span>
        </div>
      )}
    </div>
  );
}
