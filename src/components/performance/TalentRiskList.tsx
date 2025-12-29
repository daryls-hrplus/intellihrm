import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

interface TalentRiskListProps {
  risks: any[];
  isLoading: boolean;
  onSelectRisk: (risk: any) => void;
  getRiskColor: (level: string) => string;
  getRiskIcon: (category: string) => React.ReactNode;
  getTrendIcon: (direction: string) => React.ReactNode;
}

export function TalentRiskList({
  risks,
  isLoading,
  onSelectRisk,
  getRiskColor,
  getRiskIcon,
  getTrendIcon
}: TalentRiskListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!risks || risks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            No risk assessments available. Click "Run AI Analysis" to analyze your workforce.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">At-Risk Employees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onSelectRisk(risk)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${getRiskColor(risk.risk_level)}`}>
                  {getRiskIcon(risk.risk_category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {risk.profiles?.first_name} {risk.profiles?.last_name}
                    </p>
                    {getTrendIcon(risk.trend_direction)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {risk.profiles?.departments?.name || 'No department'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge className={getRiskColor(risk.risk_level)}>
                    {risk.risk_level?.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Score: {risk.risk_score}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {formatCategory(risk.risk_category)}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
