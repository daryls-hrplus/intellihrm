import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Heart,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ValuesPromotionCheckProps {
  employeeId: string;
  companyId: string;
  compact?: boolean;
}

interface ValueScore {
  valueId: string;
  valueName: string;
  isPromotionFactor: boolean;
  rating: number | null;
  meetsCriteria: boolean;
}

interface PromotionReadiness {
  isReady: boolean;
  promotionFactorsMet: number;
  promotionFactorsTotal: number;
  averageRating: number | null;
  valueScores: ValueScore[];
}

export function ValuesPromotionCheck({ 
  employeeId, 
  companyId,
  compact = false 
}: ValuesPromotionCheckProps) {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<PromotionReadiness | null>(null);

  useEffect(() => {
    fetchValuesAssessment();
  }, [employeeId, companyId]);

  const fetchValuesAssessment = async () => {
    setLoading(true);
    try {
      // Get company values
      const { data: values } = await supabase
        .from('company_values')
        .select('id, name, is_promotion_factor')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (!values || values.length === 0) {
        setReadiness(null);
        return;
      }

      // Get latest appraisal participant for this employee
      const { data: participant } = await supabase
        .from('appraisal_participants')
        .select('id')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!participant) {
        setReadiness({
          isReady: false,
          promotionFactorsMet: 0,
          promotionFactorsTotal: values.filter(v => v.is_promotion_factor).length,
          averageRating: null,
          valueScores: values.map(v => ({
            valueId: v.id,
            valueName: v.name,
            isPromotionFactor: v.is_promotion_factor,
            rating: null,
            meetsCriteria: false
          }))
        });
        return;
      }

      // Get value scores for this participant
      const { data: scores } = await supabase
        .from('appraisal_value_scores')
        .select('value_id, rating')
        .eq('participant_id', participant.id);

      const scoreMap = new Map(scores?.map(s => [s.value_id, s.rating]) || []);

      const valueScores: ValueScore[] = values.map(v => {
        const rating = scoreMap.get(v.id) || null;
        return {
          valueId: v.id,
          valueName: v.name,
          isPromotionFactor: v.is_promotion_factor,
          rating,
          meetsCriteria: rating !== null && rating >= 3
        };
      });

      const promotionFactors = valueScores.filter(v => v.isPromotionFactor);
      const promotionFactorsMet = promotionFactors.filter(v => v.meetsCriteria).length;
      
      const ratingsWithValues = valueScores.filter(v => v.rating !== null);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, v) => sum + (v.rating || 0), 0) / ratingsWithValues.length
        : null;

      setReadiness({
        isReady: promotionFactors.length === 0 || promotionFactorsMet === promotionFactors.length,
        promotionFactorsMet,
        promotionFactorsTotal: promotionFactors.length,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        valueScores
      });
    } catch (error) {
      console.error('Error fetching values assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking values...</span>
      </div>
    );
  }

  if (!readiness) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Heart className="h-4 w-4" />
        <span className="text-sm">No values configured</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {readiness.isReady ? (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Values OK
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {readiness.promotionFactorsMet}/{readiness.promotionFactorsTotal} Values
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Values & Culture Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promotion Readiness */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          readiness.isReady 
            ? "bg-emerald-50 dark:bg-emerald-950" 
            : "bg-amber-50 dark:bg-amber-950"
        )}>
          {readiness.isReady ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
          <div className="flex-1">
            <p className={cn(
              "font-medium text-sm",
              readiness.isReady ? "text-emerald-700" : "text-amber-700"
            )}>
              {readiness.isReady 
                ? "Meets Values Requirements for Promotion" 
                : "Values Criteria Not Fully Met"}
            </p>
            <p className="text-xs text-muted-foreground">
              {readiness.promotionFactorsMet} of {readiness.promotionFactorsTotal} promotion factors met
            </p>
          </div>
        </div>

        {/* Average Rating */}
        {readiness.averageRating !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average Values Rating</span>
              <span className="font-medium">{readiness.averageRating}/5</span>
            </div>
            <Progress value={(readiness.averageRating / 5) * 100} className="h-2" />
          </div>
        )}

        {/* Individual Values */}
        <div className="space-y-2">
          {readiness.valueScores
            .filter(v => v.isPromotionFactor)
            .map((value) => (
              <div key={value.valueId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {value.meetsCriteria ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : value.rating !== null ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>{value.valueName}</span>
                </div>
                <span className={cn(
                  "font-medium",
                  value.meetsCriteria && "text-emerald-600",
                  !value.meetsCriteria && value.rating !== null && "text-destructive"
                )}>
                  {value.rating !== null ? `${value.rating}/5` : 'Not Assessed'}
                </span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
