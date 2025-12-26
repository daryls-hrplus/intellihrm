import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, AlertTriangle, CheckCircle, X, TrendingUp, TrendingDown } from "lucide-react";
import { CalibrationAIAnalysis, CalibrationEmployee, CalibrationAdjustment } from "@/types/calibration";

interface CalibrationAIPanelProps {
  analysis: CalibrationAIAnalysis | null;
  employees: CalibrationEmployee[];
  adjustments: CalibrationAdjustment[];
  onClose: () => void;
  onApplySuggestion: (employeeId: string, score: number) => void;
}

export function CalibrationAIPanel({
  analysis,
  employees,
  adjustments,
  onClose,
  onApplySuggestion,
}: CalibrationAIPanelProps) {
  const anomalies = analysis?.suggested_adjustments?.anomalies || [];
  const healthScore = analysis?.overall_health_score ? Math.round(analysis.overall_health_score * 100) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Health Score */}
          {healthScore !== null && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Health</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-3 w-3 rounded-full ${
                        healthScore >= 80 ? 'bg-green-500' :
                        healthScore >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} 
                    />
                    <span className="font-bold">{healthScore}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthScore >= 80 ? 'Ratings look well-calibrated' :
                   healthScore >= 50 ? 'Some adjustments may be needed' :
                   'Significant calibration issues detected'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Anomalies Detected */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Anomalies ({anomalies.length})
            </h4>
            
            {anomalies.length === 0 ? (
              <Card>
                <CardContent className="pt-4 text-center text-sm text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  No anomalies detected
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {anomalies.slice(0, 5).map((anomaly: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {anomaly.employeeName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {anomaly.type === 'rating_gap' 
                              ? `Self: ${anomaly.selfRating} vs Manager: ${anomaly.managerRating}`
                              : `Score: ${anomaly.finalScore}`
                            }
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={anomaly.severity === 'high' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Distribution Analysis */}
          {analysis?.distribution_analysis && (
            <div>
              <h4 className="text-sm font-medium mb-2">Distribution Summary</h4>
              <Card>
                <CardContent className="pt-3 pb-3 space-y-2">
                  {Object.entries(analysis.distribution_analysis.percentages || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Adjustments */}
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Adjustments</h4>
            {adjustments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No adjustments made yet</p>
            ) : (
              <div className="space-y-2">
                {adjustments.slice(0, 5).map((adj) => (
                  <Card key={adj.id}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate flex-1">
                          {adj.profiles?.full_name || 'Unknown'}
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          <span>{adj.original_score?.toFixed(1)}</span>
                          {adj.calibrated_score && adj.original_score && adj.calibrated_score > adj.original_score ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span>{adj.calibrated_score?.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
