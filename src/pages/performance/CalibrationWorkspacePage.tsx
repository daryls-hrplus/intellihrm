import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCalibrationWorkspace } from "@/hooks/useCalibrationWorkspace";
import { useCalibrationAdjustments } from "@/hooks/useCalibrationAdjustments";
import { CalibrationNineBox } from "@/components/calibration/CalibrationNineBox";
import { CalibrationAIPanel } from "@/components/calibration/CalibrationAIPanel";
import { CalibrationHeader } from "@/components/calibration/CalibrationHeader";
import { EmployeeDetailPanel } from "@/components/calibration/EmployeeDetailPanel";
import { RatingDistributionChart } from "@/components/calibration/RatingDistributionChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CalibrationEmployee } from "@/types/calibration";
import { toast } from "sonner";

export default function CalibrationWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const companyId = profile?.company_id || "";

  const [selectedEmployee, setSelectedEmployee] = React.useState<CalibrationEmployee | null>(null);
  const [showAIPanel, setShowAIPanel] = React.useState(true);

  const {
    session,
    employees,
    analysis,
    isLoading,
    isAnalyzing,
    error,
    hasPendingChanges,
    runAIAnalysis,
    updateEmployeePosition,
    updateEmployeeScore,
    saveAdjustments,
    discardChanges,
  } = useCalibrationWorkspace({ sessionId: sessionId || "", companyId });

  const { adjustments, stats: adjustmentStats } = useCalibrationAdjustments({ 
    sessionId: sessionId || "" 
  });

  const handleEmployeeClick = (employee: CalibrationEmployee) => {
    setSelectedEmployee(employee);
  };

  const handleScoreChange = (employeeId: string, newScore: number) => {
    updateEmployeeScore(employeeId, newScore);
  };

  const handleSaveChanges = async () => {
    if (!profile?.id) return;
    
    const result = await saveAdjustments(profile.id, "Manual calibration adjustment");
    if (result?.success) {
      toast.success("Adjustments saved successfully");
    } else {
      toast.error("Failed to save adjustments");
    }
  };

  const handleRunAnalysis = async () => {
    try {
      await runAIAnalysis();
      toast.success("AI analysis completed");
    } catch (err) {
      toast.error("Failed to run AI analysis");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error || "Session not found"}</p>
            <Button onClick={() => navigate("/performance/calibration")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <CalibrationHeader
        session={session}
        hasPendingChanges={hasPendingChanges}
        adjustmentStats={adjustmentStats}
        onBack={() => navigate("/performance/calibration")}
        onSave={handleSaveChanges}
        onDiscard={discardChanges}
        onRunAnalysis={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: 9-Box Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            <CalibrationNineBox
              employees={employees}
              onEmployeeClick={handleEmployeeClick}
              onPositionChange={updateEmployeePosition}
              selectedEmployeeId={selectedEmployee?.employeeId}
            />
            
            <RatingDistributionChart
              employees={employees}
              targetDistribution={session.calibration_rules?.target_distribution}
            />
          </div>
        </div>

        {/* Right: AI Panel */}
        {showAIPanel && (
          <div className="w-80 border-l bg-muted/30 overflow-auto">
            <CalibrationAIPanel
              analysis={analysis}
              employees={employees}
              adjustments={adjustments}
              onClose={() => setShowAIPanel(false)}
              onApplySuggestion={(employeeId, score) => {
                updateEmployeeScore(employeeId, score);
              }}
            />
          </div>
        )}
      </div>

      {/* Employee Detail Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Employee Details</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <EmployeeDetailPanel
              employee={selectedEmployee}
              adjustments={adjustments.filter(a => a.employee_id === selectedEmployee.employeeId)}
              onScoreChange={(newScore) => handleScoreChange(selectedEmployee.employeeId, newScore)}
              onClose={() => setSelectedEmployee(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
