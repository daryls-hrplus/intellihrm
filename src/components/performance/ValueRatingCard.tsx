import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, Star, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanyValue, ValueScoreInput } from '@/types/valuesAssessment';

interface ValueRatingCardProps {
  value: CompanyValue;
  currentScore?: ValueScoreInput;
  isReadOnly?: boolean;
  onChange: (updates: Partial<ValueScoreInput>) => void;
}

const RATING_LABELS = [
  { value: 1, label: 'Does Not Meet', color: 'text-destructive' },
  { value: 2, label: 'Needs Improvement', color: 'text-orange-500' },
  { value: 3, label: 'Meets Expectations', color: 'text-yellow-500' },
  { value: 4, label: 'Exceeds Expectations', color: 'text-emerald-500' },
  { value: 5, label: 'Exemplary', color: 'text-primary' },
];

export function ValueRatingCard({
  value,
  currentScore,
  isReadOnly = false,
  onChange
}: ValueRatingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedRating = currentScore?.rating;
  const selectedBehaviors = currentScore?.demonstrated_behaviors || [];

  const handleRatingClick = (rating: number) => {
    if (isReadOnly) return;
    onChange({ rating: rating === selectedRating ? undefined : rating });
  };

  const handleBehaviorToggle = (behavior: string) => {
    if (isReadOnly) return;
    const current = [...selectedBehaviors];
    const index = current.indexOf(behavior);
    
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(behavior);
    }
    
    onChange({ demonstrated_behaviors: current });
  };

  const ratingLabel = selectedRating 
    ? RATING_LABELS.find(r => r.value === selectedRating)
    : null;

  return (
    <Card className={cn(
      "transition-all",
      selectedRating && "border-primary/30"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{value.name}</CardTitle>
                {value.is_promotion_factor && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Promotion Factor
                  </Badge>
                )}
              </div>
              {value.description && (
                <p className="text-sm text-muted-foreground">{value.description}</p>
              )}
            </div>
            
            {/* Rating Display */}
            {ratingLabel && (
              <Badge variant="secondary" className={ratingLabel.color}>
                {ratingLabel.label}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="ghost"
                  size="sm"
                  disabled={isReadOnly}
                  className={cn(
                    "p-1 h-auto",
                    selectedRating && rating <= selectedRating
                      ? "text-yellow-500"
                      : "text-muted-foreground hover:text-yellow-500"
                  )}
                  onClick={() => handleRatingClick(rating)}
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      selectedRating && rating <= selectedRating && "fill-current"
                    )}
                  />
                </Button>
              ))}
              {selectedRating && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {RATING_LABELS[selectedRating - 1]?.label}
                </span>
              )}
            </div>
          </div>

          {/* Behavioral Indicators */}
          {value.behavioral_indicators.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Behavioral Indicators ({selectedBehaviors.length} selected)</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent className="space-y-4">
            {/* Behavioral Checkboxes */}
            {value.behavioral_indicators.length > 0 && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <Label className="text-sm font-medium">
                  Select observed behaviors
                </Label>
                {value.behavioral_indicators.map((indicator, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="shrink-0">
                        Level {indicator.level}
                      </Badge>
                      <div className="flex items-start gap-2 flex-1">
                        <Checkbox
                          id={`${value.id}-${idx}`}
                          checked={selectedBehaviors.includes(indicator.description)}
                          onCheckedChange={() => handleBehaviorToggle(indicator.description)}
                          disabled={isReadOnly}
                        />
                        <Label 
                          htmlFor={`${value.id}-${idx}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {indicator.description}
                        </Label>
                      </div>
                    </div>
                    {indicator.examples && indicator.examples.length > 0 && (
                      <ul className="ml-6 text-xs text-muted-foreground list-disc list-inside">
                        {indicator.examples.map((ex, exIdx) => (
                          <li key={exIdx}>{ex}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Evidence */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Evidence / Examples</Label>
              <Textarea
                placeholder="Provide specific examples of how this value was demonstrated..."
                value={currentScore?.evidence || ''}
                onChange={(e) => onChange({ evidence: e.target.value })}
                disabled={isReadOnly}
                rows={3}
              />
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Comments</Label>
              <Textarea
                placeholder="Any additional observations or notes..."
                value={currentScore?.comments || ''}
                onChange={(e) => onChange({ comments: e.target.value })}
                disabled={isReadOnly}
                rows={2}
              />
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
