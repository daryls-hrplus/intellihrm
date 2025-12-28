import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Target, Star, Check } from 'lucide-react';
import { KRAWithRating } from '@/types/responsibilityKRA';

interface KRARatingCardProps {
  kra: KRAWithRating;
  isEmployee: boolean;
  minRating: number;
  maxRating: number;
  onSelfRatingChange: (kraId: string, rating: number, comments?: string) => void;
  onManagerRatingChange: (kraId: string, rating: number, comments?: string) => void;
}

export function KRARatingCard({
  kra,
  isEmployee,
  minRating,
  maxRating,
  onSelfRatingChange,
  onManagerRatingChange,
}: KRARatingCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selfRating, setSelfRating] = useState<number>(kra.rating?.self_rating || minRating);
  const [selfComments, setSelfComments] = useState(kra.rating?.self_comments || '');
  const [managerRating, setManagerRating] = useState<number>(kra.rating?.manager_rating || minRating);
  const [managerComments, setManagerComments] = useState(kra.rating?.manager_comments || '');

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Exceptional';
    if (rating >= 3.5) return 'Exceeds Expectations';
    if (rating >= 2.5) return 'Meets Expectations';
    if (rating >= 1.5) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const hasRating = kra.rating?.self_rating !== null || kra.rating?.manager_rating !== null;

  return (
    <Card className={`transition-all ${hasRating ? 'border-l-4 border-l-green-500' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 mt-1 text-primary shrink-0" />
                <div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {kra.name}
                    {hasRating && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </CardTitle>
                  {kra.target_metric && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target: {kra.target_metric}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="shrink-0">
                  {kra.weight}%
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {kra.description && (
              <p className="text-sm text-muted-foreground">{kra.description}</p>
            )}

            {/* Self Rating Section */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Employee Self-Rating</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getRatingColor(selfRating)}`}>
                    {selfRating.toFixed(1)}
                  </span>
                  <span className={`text-xs ${getRatingColor(selfRating)}`}>
                    {getRatingLabel(selfRating)}
                  </span>
                </div>
              </div>
              
              {isEmployee ? (
                <>
                  <Slider
                    value={[selfRating]}
                    min={minRating}
                    max={maxRating}
                    step={0.5}
                    onValueChange={([value]) => {
                      setSelfRating(value);
                      onSelfRatingChange(kra.id, value, selfComments);
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{minRating} - Poor</span>
                    <span>{maxRating} - Exceptional</span>
                  </div>
                  <Textarea
                    value={selfComments}
                    onChange={(e) => {
                      setSelfComments(e.target.value);
                      onSelfRatingChange(kra.id, selfRating, e.target.value);
                    }}
                    placeholder="Add evidence or comments for your rating..."
                    rows={2}
                    className="text-sm"
                  />
                </>
              ) : (
                <>
                  {kra.rating?.self_rating !== null ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(kra.rating?.self_rating || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      {kra.rating?.self_comments && (
                        <p className="text-sm text-muted-foreground italic">
                          "{kra.rating.self_comments}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not yet rated by employee</p>
                  )}
                </>
              )}
            </div>

            {/* Manager Rating Section */}
            {!isEmployee && (
              <div className="space-y-3 p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Manager Rating</Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getRatingColor(managerRating)}`}>
                      {managerRating.toFixed(1)}
                    </span>
                    <span className={`text-xs ${getRatingColor(managerRating)}`}>
                      {getRatingLabel(managerRating)}
                    </span>
                  </div>
                </div>
                
                <Slider
                  value={[managerRating]}
                  min={minRating}
                  max={maxRating}
                  step={0.5}
                  onValueChange={([value]) => {
                    setManagerRating(value);
                    onManagerRatingChange(kra.id, value, managerComments);
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{minRating} - Poor</span>
                  <span>{maxRating} - Exceptional</span>
                </div>
                <Textarea
                  value={managerComments}
                  onChange={(e) => {
                    setManagerComments(e.target.value);
                    onManagerRatingChange(kra.id, managerRating, e.target.value);
                  }}
                  placeholder="Provide feedback on this KRA..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            )}

            {/* Calculated Score Display */}
            {kra.rating?.final_score !== null && kra.rating?.final_score !== undefined && (
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="text-sm font-medium">Final Score</span>
                <span className="text-lg font-bold text-green-600">
                  {kra.rating.final_score.toFixed(2)} 
                  <span className="text-xs text-muted-foreground ml-1">
                    (weighted: {kra.rating.weight_adjusted_score?.toFixed(2)}%)
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
