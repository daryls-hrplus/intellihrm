import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { CalibrationSession, STATUS_CONFIG } from "@/types/calibration";
import { format } from "date-fns";

interface CalibrationHeaderProps {
  session: CalibrationSession;
  hasPendingChanges: boolean;
  adjustmentStats: {
    total: number;
    pending: number;
    applied: number;
    reverted: number;
  };
  onBack: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export function CalibrationHeader({
  session,
  hasPendingChanges,
  adjustmentStats,
  onBack,
  onSave,
  onDiscard,
  onRunAnalysis,
  isAnalyzing,
}: CalibrationHeaderProps) {
  const statusConfig = STATUS_CONFIG[session.status];

  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="border-l h-6" />
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{session.name}</h1>
              <Badge variant="secondary" className={`${statusConfig.color} text-white`}>
                {statusConfig.label}
              </Badge>
            </div>
            {session.scheduled_date && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(session.scheduled_date), "MMMM d, yyyy")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mr-4">
            <span>Pending: <strong>{adjustmentStats.pending}</strong></span>
            <span>Applied: <strong>{adjustmentStats.applied}</strong></span>
          </div>

          {/* AI Analysis Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Run AI Analysis
          </Button>

          {/* Pending Changes Actions */}
          {hasPendingChanges && (
            <>
              <Button variant="outline" size="sm" onClick={onDiscard}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
