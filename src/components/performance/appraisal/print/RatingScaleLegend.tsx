import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Rating scale definitions with behavioral anchors
export const RATING_SCALE_DEFINITIONS = [
  {
    level: 1,
    label: "Needs Development",
    shortLabel: "ND",
    icon: "🔴",
    color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300",
    description: "Performance is significantly below expectations for the required level.",
    behavioralAnchors: [
      "Rarely demonstrates the expected behaviors",
      "Requires significant improvement and close supervision",
      "Does not meet minimum standards for this competency",
      "Needs immediate development intervention",
    ],
    gapMeaning: "Critical gap requiring urgent development plan",
  },
  {
    level: 2,
    label: "Below Expectations",
    shortLabel: "BE",
    icon: "🟠",
    color: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300",
    description: "Performance is below the level required for the role.",
    behavioralAnchors: [
      "Occasionally demonstrates expected behaviors but inconsistently",
      "Shows some understanding but struggles with application",
      "Requires additional coaching and support",
      "Meets some but not all requirements for the level",
    ],
    gapMeaning: "Notable gap requiring focused development",
  },
  {
    level: 3,
    label: "Meets Expectations",
    shortLabel: "ME",
    icon: "🟢",
    color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300",
    description: "Performance fully meets the expectations for the required level.",
    behavioralAnchors: [
      "Consistently demonstrates expected behaviors",
      "Works independently with minimal supervision",
      "Applies good judgment in most situations",
      "Reliably delivers to the standard required",
    ],
    gapMeaning: "Performing at the level required for the job",
  },
  {
    level: 4,
    label: "Exceeds Expectations",
    shortLabel: "EE",
    icon: "🔵",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
    description: "Performance frequently exceeds the level required for the role.",
    behavioralAnchors: [
      "Frequently exceeds expected behaviors",
      "Handles complex situations beyond normal scope",
      "Actively coaches and supports others",
      "Recognized as a go-to person in the team",
    ],
    gapMeaning: "Performing above the level required - ready for advancement",
  },
  {
    level: 5,
    label: "Exceptional",
    shortLabel: "EX",
    icon: "🏆",
    color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300",
    description: "Performance is outstanding and sets the standard for others.",
    behavioralAnchors: [
      "Consistently exemplifies excellence in all aspects",
      "Role model for the organization",
      "Innovates and sets new standards",
      "Drives significant positive impact",
    ],
    gapMeaning: "Exceptional performance - potential for leadership roles",
  },
];

interface RatingScaleLegendProps {
  minRating?: number;
  maxRating?: number;
  showButton?: boolean;
  className?: string;
}

export function RatingScaleLegend({
  minRating = 1,
  maxRating = 5,
  showButton = true,
  className,
}: RatingScaleLegendProps) {
  const [open, setOpen] = useState(false);

  const filteredLevels = RATING_SCALE_DEFINITIONS.filter(
    (level) => level.level >= minRating && level.level <= maxRating
  );

  const LegendContent = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>How to Use This Scale:</strong> Rate the employee's demonstrated performance 
          against the <span className="text-primary font-medium">required proficiency level</span> for their job.
        </p>
        <p>
          A rating of <strong>3 (Meets Expectations)</strong> means the employee is performing 
          at exactly the level required. Ratings above or below indicate over-performance or 
          development needs relative to job requirements.
        </p>
      </div>

      <div className="space-y-3">
        {filteredLevels.map((level) => (
          <div
            key={level.level}
            className={cn(
              "rounded-lg border p-4 transition-all",
              level.color
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{level.icon}</span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      Level {level.level}: {level.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {level.shortLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {level.level === 3 ? (
                      <Minus className="h-3 w-3" />
                    ) : level.level > 3 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className="opacity-80">vs. Required</span>
                  </div>
                </div>
                <p className="text-sm font-medium">{level.description}</p>
                <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                  {level.behavioralAnchors.map((anchor, i) => (
                    <li key={i}>{anchor}</li>
                  ))}
                </ul>
                <p className="text-xs italic pt-1 border-t border-current/20 mt-2">
                  <strong>Gap Interpretation:</strong> {level.gapMeaning}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <h4 className="font-semibold mb-2">Understanding the Gap</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium">Negative Gap</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Rating below required level = Development needed
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Minus className="h-4 w-4" />
              <span className="font-medium">No Gap</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Rating equals required level = Meeting expectations
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Positive Gap</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Rating above required level = Exceeding/ready for growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!showButton) {
    return <LegendContent />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <HelpCircle className="h-4 w-4" />
          Rating Scale Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Performance Rating Scale
          </DialogTitle>
          <DialogDescription>
            Understanding how to rate performance against job requirements
          </DialogDescription>
        </DialogHeader>
        <LegendContent />
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get rating info
export function getRatingDefinition(level: number) {
  return RATING_SCALE_DEFINITIONS.find((r) => r.level === level);
}

// Inline rating label component for use in tables
interface RatingLabelProps {
  rating: number;
  showIcon?: boolean;
  className?: string;
}

export function RatingLabel({ rating, showIcon = true, className }: RatingLabelProps) {
  const definition = getRatingDefinition(rating);
  if (!definition) return <span>{rating}</span>;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {showIcon && <span className="text-sm">{definition.icon}</span>}
      <span>{definition.label}</span>
    </span>
  );
}
