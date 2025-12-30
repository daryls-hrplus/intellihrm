import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import type { EmployeePerformanceRisk } from '@/types/performanceRisks';
import { formatDistanceToNow } from 'date-fns';

interface SkillsDecayWarningProps {
  risks: EmployeePerformanceRisk[];
  onViewDetails?: (risk: EmployeePerformanceRisk) => void;
}

export function SkillsDecayWarning({ risks, onViewDetails }: SkillsDecayWarningProps) {
  if (risks.length === 0) return null;

  const totalExpiringCerts = risks.reduce(
    (sum, r) => sum + (r.expiring_certifications?.length || 0), 
    0
  );
  const mandatoryCerts = risks.reduce(
    (sum, r) => sum + (r.expiring_certifications?.filter(c => c.is_mandatory).length || 0), 
    0
  );

  return (
    <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
      <Clock className="h-5 w-5 text-purple-600" />
      <AlertTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
        <span>Skills Decay Warning</span>
        <Badge variant="outline" className="border-purple-300 text-purple-700">
          {totalExpiringCerts} certification{totalExpiringCerts > 1 ? 's' : ''} expiring
        </Badge>
        {mandatoryCerts > 0 && (
          <Badge variant="destructive" className="text-xs">
            {mandatoryCerts} mandatory
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
          Employees with expiring certifications that may impact their performance and succession eligibility.
        </p>
        
        <div className="space-y-2">
          {risks.slice(0, 3).map(risk => (
            <div 
              key={risk.id}
              className="flex items-center justify-between p-2 rounded bg-purple-100/50 dark:bg-purple-900/20"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <div>
                  <span className="font-medium text-sm">{risk.employee?.full_name}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {risk.expiring_certifications?.slice(0, 2).map((cert, idx) => (
                      <Badge 
                        key={idx} 
                        variant={cert.is_mandatory ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {cert.name} - expires {formatDistanceToNow(new Date(cert.expiry_date), { addSuffix: true })}
                      </Badge>
                    ))}
                    {(risk.expiring_certifications?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{risk.expiring_certifications!.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {onViewDetails && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails(risk)}
                  className="text-purple-700 hover:text-purple-900"
                >
                  View <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
          {risks.length > 3 && (
            <p className="text-xs text-purple-600 text-center">
              +{risks.length - 3} more employees
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
