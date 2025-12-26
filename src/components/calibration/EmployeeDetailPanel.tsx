import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CalibrationEmployee, CalibrationAdjustment, NINE_BOX_LABELS } from "@/types/calibration";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface EmployeeDetailPanelProps {
  employee: CalibrationEmployee;
  adjustments: CalibrationAdjustment[];
  onScoreChange: (newScore: number) => void;
  onClose: () => void;
}

export function EmployeeDetailPanel({
  employee,
  adjustments,
  onScoreChange,
  onClose,
}: EmployeeDetailPanelProps) {
  const [newScore, setNewScore] = useState(employee.currentScore.toString());

  const handleScoreUpdate = () => {
    const score = parseFloat(newScore);
    if (!isNaN(score) && score >= 0 && score <= 5) {
      onScoreChange(score);
    }
  };

  const scoreDiff = employee.currentScore - employee.originalScore;

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="py-4 space-y-6">
        {/* Employee Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.avatarUrl} />
            <AvatarFallback className="text-lg">
              {employee.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{employee.employeeName}</h3>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
            <Badge variant="outline" className="mt-1">
              {NINE_BOX_LABELS[employee.boxPosition]}
            </Badge>
          </div>
        </div>

        {/* Anomaly Warning */}
        {employee.hasAnomalies && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Rating Anomaly Detected</span>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
              Large gap between self-rating and manager rating
            </p>
          </div>
        )}

        <Separator />

        {/* Ratings Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Ratings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Self Rating</p>
              <p className="text-xl font-bold">{employee.selfRating.toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Manager Rating</p>
              <p className="text-xl font-bold">{employee.managerRating.toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Original Score</p>
              <p className="text-xl font-bold">{employee.originalScore.toFixed(2)}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Current Score</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{employee.currentScore.toFixed(2)}</p>
                {scoreDiff !== 0 && (
                  <div className={`flex items-center ${scoreDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {scoreDiff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-xs">{scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Adjust Score */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Adjust Score</h4>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="newScore" className="text-xs">New Score (0-5)</Label>
              <Input
                id="newScore"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
            </div>
            <Button onClick={handleScoreUpdate}>Apply</Button>
          </div>
        </div>

        {/* AI Suggestion */}
        {employee.aiSuggestion && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <span className="text-purple-500">✨</span> AI Suggestion
              </h4>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Suggested Score</span>
                  <span className="font-bold">{employee.aiSuggestion.score.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {employee.aiSuggestion.reasoning}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                  Confidence: {(employee.aiSuggestion.confidence * 100).toFixed(0)}%
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => onScoreChange(employee.aiSuggestion!.score)}
                >
                  Apply AI Suggestion
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Adjustment History */}
        {adjustments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Adjustment History</h4>
              <div className="space-y-2">
                {adjustments.map((adj) => (
                  <div key={adj.id} className="text-xs bg-muted rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span>
                        {adj.original_score?.toFixed(2)} → {adj.calibrated_score?.toFixed(2)}
                      </span>
                      <Badge variant={adj.status === 'applied' ? 'default' : 'secondary'} className="text-xs">
                        {adj.status}
                      </Badge>
                    </div>
                    {adj.adjustment_reason && (
                      <p className="text-muted-foreground mt-1">{adj.adjustment_reason}</p>
                    )}
                    <p className="text-muted-foreground mt-1">
                      {format(new Date(adj.adjusted_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
