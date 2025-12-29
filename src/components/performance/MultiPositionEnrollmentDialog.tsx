import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Star, AlertCircle, CheckCircle } from "lucide-react";
import { ConcurrentPosition } from "@/hooks/useConcurrentPositionDetection";

export type MultiPositionHandlingMode = "aggregate" | "separate" | "primary_only";

interface MultiPositionEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  positions: ConcurrentPosition[];
  cycleMode: "aggregate" | "separate";
  onConfirm: (mode: MultiPositionHandlingMode, weights: Record<string, number>) => void;
  onCancel: () => void;
}

export function MultiPositionEnrollmentDialog({
  open,
  onOpenChange,
  employeeName,
  positions,
  cycleMode,
  onConfirm,
  onCancel,
}: MultiPositionEnrollmentDialogProps) {
  const [selectedMode, setSelectedMode] = useState<MultiPositionHandlingMode>(cycleMode);
  const [weights, setWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize weights based on FTE percentages
    const totalFTE = positions.reduce((sum, p) => sum + p.fte_percentage, 0);
    const initialWeights: Record<string, number> = {};
    
    positions.forEach(pos => {
      initialWeights[pos.position_id] = Math.round((pos.fte_percentage / totalFTE) * 100);
    });

    // Ensure weights sum to 100
    const sum = Object.values(initialWeights).reduce((a, b) => a + b, 0);
    if (sum !== 100 && positions.length > 0) {
      const primaryPos = positions.find(p => p.is_primary);
      const adjustKey = primaryPos?.position_id || positions[0].position_id;
      initialWeights[adjustKey] += (100 - sum);
    }

    setWeights(initialWeights);
  }, [positions]);

  const handleWeightChange = (positionId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setWeights(prev => ({ ...prev, [positionId]: numValue }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValidWeight = totalWeight === 100;

  const handleConfirm = () => {
    if (selectedMode === "primary_only") {
      const primaryPosition = positions.find(p => p.is_primary) || positions[0];
      onConfirm(selectedMode, { [primaryPosition.position_id]: 100 });
    } else {
      onConfirm(selectedMode, weights);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Multi-Position Employee Detected
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{employeeName}</span> holds multiple concurrent positions.
            Configure how they should be evaluated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Positions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Positions</Label>
            <div className="space-y-2">
              {positions.map((position) => (
                <Card key={position.position_id} className="border-border/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          {position.position_title}
                          {position.is_primary && (
                            <Star className="h-3 w-3 text-warning fill-warning" />
                          )}
                        </p>
                        {position.job_name && (
                          <p className="text-xs text-muted-foreground">{position.job_name}</p>
                        )}
                        {position.department_name && (
                          <p className="text-xs text-muted-foreground">{position.department_name}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{position.fte_percentage}% FTE</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Handling Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Evaluation Approach</Label>
            <RadioGroup
              value={selectedMode}
              onValueChange={(value) => setSelectedMode(value as MultiPositionHandlingMode)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="aggregate" id="aggregate" />
                <Label htmlFor="aggregate" className="flex-1 cursor-pointer">
                  <span className="font-medium">Weighted Average</span>
                  <p className="text-xs text-muted-foreground">
                    Combine scores from all positions into a single weighted evaluation
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="separate" id="separate" />
                <Label htmlFor="separate" className="flex-1 cursor-pointer">
                  <span className="font-medium">Separate Evaluations</span>
                  <p className="text-xs text-muted-foreground">
                    Evaluate each position independently with separate scores
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="primary_only" id="primary_only" />
                <Label htmlFor="primary_only" className="flex-1 cursor-pointer">
                  <span className="font-medium">Primary Position Only</span>
                  <p className="text-xs text-muted-foreground">
                    Evaluate based on primary role only, ignore secondary positions
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Weight Configuration (only for aggregate mode) */}
          {selectedMode === "aggregate" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Contribution Weights</Label>
              <div className="space-y-2">
                {positions.map((position) => (
                  <div key={position.position_id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm">{position.position_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={weights[position.position_id] || 0}
                        onChange={(e) => handleWeightChange(position.position_id, e.target.value)}
                        className="w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight Validation */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                {isValidWeight ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">Weights sum to 100%</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Weights must sum to 100% (currently {totalWeight}%)
                    </span>
                  </>
                )}
              </div>

              {/* Weight Visualization */}
              <div className="space-y-1">
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted">
                  {positions.map((position, idx) => (
                    <div
                      key={position.position_id}
                      className="h-full transition-all"
                      style={{
                        width: `${weights[position.position_id] || 0}%`,
                        backgroundColor: idx === 0 ? 'hsl(var(--primary))' : 
                          idx === 1 ? 'hsl(var(--info))' : 'hsl(var(--warning))'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedMode === "aggregate" && !isValidWeight}
          >
            Confirm & Add Participant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
