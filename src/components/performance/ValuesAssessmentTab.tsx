import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Heart, CheckCircle2 } from 'lucide-react';
import { useValuesAssessment } from '@/hooks/performance/useValuesAssessment';
import { ValueRatingCard } from './ValueRatingCard';
import { CompanyValue, ValueScoreInput } from '@/types/valuesAssessment';

interface ValuesAssessmentTabProps {
  participantId: string;
  companyId: string;
  evaluatorId: string;
  isReadOnly?: boolean;
  onScoresChange?: (scores: ValueScoreInput[]) => void;
}

export function ValuesAssessmentTab({
  participantId,
  companyId,
  evaluatorId,
  isReadOnly = false,
  onScoresChange
}: ValuesAssessmentTabProps) {
  const { 
    values, 
    scores, 
    loading, 
    fetchCompanyValues, 
    fetchValueScores 
  } = useValuesAssessment();
  
  const [localScores, setLocalScores] = useState<Map<string, ValueScoreInput>>(new Map());

  useEffect(() => {
    fetchCompanyValues(companyId);
    fetchValueScores(participantId);
  }, [companyId, participantId, fetchCompanyValues, fetchValueScores]);

  useEffect(() => {
    // Initialize local scores from fetched scores
    const scoreMap = new Map<string, ValueScoreInput>();
    scores.forEach(score => {
      scoreMap.set(score.value_id, {
        value_id: score.value_id,
        rating: score.rating || undefined,
        demonstrated_behaviors: score.demonstrated_behaviors as string[] || [],
        evidence: score.evidence || undefined,
        comments: score.comments || undefined
      });
    });
    setLocalScores(scoreMap);
  }, [scores]);

  const handleScoreChange = (valueId: string, updates: Partial<ValueScoreInput>) => {
    setLocalScores(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(valueId) || { value_id: valueId };
      newMap.set(valueId, { ...existing, ...updates });
      
      // Notify parent of changes
      if (onScoresChange) {
        onScoresChange(Array.from(newMap.values()));
      }
      
      return newMap;
    });
  };

  const assessedCount = Array.from(localScores.values()).filter(s => s.rating !== undefined).length;
  const totalValues = values.length;
  const progressPercent = totalValues > 0 ? (assessedCount / totalValues) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (values.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Company Values Defined</h3>
          <p className="text-muted-foreground mt-2">
            Company values must be configured before they can be assessed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Values & Culture Assessment
            </CardTitle>
            <Badge variant={assessedCount === totalValues ? 'default' : 'secondary'}>
              {assessedCount} / {totalValues} Assessed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Assess how well the employee demonstrates each company value through observable behaviors.
          </p>
        </CardContent>
      </Card>

      {/* Value Cards */}
      <div className="grid gap-4">
        {values.map((value) => {
          const score = localScores.get(value.id);
          return (
            <ValueRatingCard
              key={value.id}
              value={value}
              currentScore={score}
              isReadOnly={isReadOnly}
              onChange={(updates) => handleScoreChange(value.id, updates)}
            />
          );
        })}
      </div>

      {/* Completion Indicator */}
      {assessedCount === totalValues && totalValues > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-medium">All values have been assessed</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
