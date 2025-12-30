import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, AlertTriangle, ArrowRight } from 'lucide-react';
import type { EmployeePerformanceRisk } from '@/types/performanceRisks';

interface ToxicHighPerformerAlertProps {
  risks: EmployeePerformanceRisk[];
  onViewDetails?: (risk: EmployeePerformanceRisk) => void;
}

export function ToxicHighPerformerAlert({ risks, onViewDetails }: ToxicHighPerformerAlertProps) {
  if (risks.length === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <Award className="h-5 w-5 text-amber-600" />
      <AlertTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <span>Toxic High Performer Detection</span>
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          {risks.length} employee{risks.length > 1 ? 's' : ''}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
          These employees achieve high goal scores but show concerning behavioral or competency gaps. 
          Coaching is recommended before promotion consideration.
        </p>
        
        <div className="space-y-2">
          {risks.slice(0, 3).map(risk => (
            <div 
              key={risk.id}
              className="flex items-center justify-between p-2 rounded bg-amber-100/50 dark:bg-amber-900/20"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div>
                  <span className="font-medium text-sm">{risk.employee?.full_name}</span>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <span>Goal: {risk.goal_score?.toFixed(1)}</span>
                    <span>|</span>
                    <span>Competency: {risk.competency_score?.toFixed(1)}</span>
                    <span>|</span>
                    <span>Gap: {risk.goal_vs_behavior_gap?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              {onViewDetails && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails(risk)}
                  className="text-amber-700 hover:text-amber-900"
                >
                  View <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
          {risks.length > 3 && (
            <p className="text-xs text-amber-600 text-center">
              +{risks.length - 3} more employees
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
