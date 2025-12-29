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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Save, Briefcase, Star } from "lucide-react";

interface Position {
  id: string;
  position_id: string;
  position_title: string;
  job_id: string | null;
  job_title: string | null;
  weight_percentage: number;
  is_primary: boolean;
}

interface MultiPositionWeightsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  employeeName: string;
  onSuccess: () => void;
}

export function MultiPositionWeightsManager({
  open,
  onOpenChange,
  participantId,
  employeeName,
  onSuccess,
}: MultiPositionWeightsManagerProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && participantId) {
      fetchPositionWeights();
    }
  }, [open, participantId]);

  const fetchPositionWeights = async () => {
    setLoading(true);
    try {
      // Fetch existing position weights
      const { data: weights } = await (supabase
        .from("appraisal_position_weights" as any)
        .select(`
          id,
          position_id,
          job_id,
          weight_percentage,
          is_primary,
          positions:position_id (title, job_id, jobs:job_id (title))
        `)
        .eq("participant_id", participantId) as any);

      if (weights && weights.length > 0) {
        setPositions(
          weights.map((w: any) => ({
            id: w.id,
            position_id: w.position_id,
            position_title: w.positions?.title || "Unknown Position",
            job_id: w.job_id || w.positions?.job_id,
            job_title: w.positions?.jobs?.title || null,
            weight_percentage: w.weight_percentage,
            is_primary: w.is_primary,
          }))
        );
      } else {
        // Fetch employee's active positions if no weights exist yet
        const { data: participant } = await supabase
          .from("appraisal_participants")
          .select("employee_id")
          .eq("id", participantId)
          .single();

        if (participant) {
          const { data: empPositions } = await supabase
            .from("employee_positions")
            .select(`
              position_id,
              is_primary,
              positions:position_id (id, title, job_id, jobs:job_id (title))
            `)
            .eq("employee_id", participant.employee_id)
            .eq("is_active", true);

          if (empPositions && empPositions.length > 0) {
            const equalWeight = Math.floor(100 / empPositions.length);
            const remainder = 100 - equalWeight * empPositions.length;

            setPositions(
              empPositions.map((ep: any, idx: number) => ({
                id: `new-${idx}`,
                position_id: ep.position_id,
                position_title: ep.positions?.title || "Unknown Position",
                job_id: ep.positions?.job_id,
                job_title: ep.positions?.jobs?.title || null,
                weight_percentage: equalWeight + (idx === 0 ? remainder : 0),
                is_primary: ep.is_primary || false,
              }))
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching position weights:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = positions.reduce((sum, p) => sum + p.weight_percentage, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.01;

  const handleWeightChange = (positionId: string, value: number) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.position_id === positionId ? { ...p, weight_percentage: value } : p
      )
    );
  };

  const handlePrimaryChange = (positionId: string, checked: boolean) => {
    setPositions((prev) =>
      prev.map((p) => ({
        ...p,
        is_primary: p.position_id === positionId ? checked : checked ? false : p.is_primary,
      }))
    );
  };

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Weights must total 100%");
      return;
    }

    setSaving(true);
    try {
      // Delete existing weights
      await (supabase
        .from("appraisal_position_weights" as any)
        .delete()
        .eq("participant_id", participantId) as any);

      // Insert new weights
      const records = positions.map((p) => ({
        participant_id: participantId,
        position_id: p.position_id,
        job_id: p.job_id,
        weight_percentage: p.weight_percentage,
        is_primary: p.is_primary,
      }));

      const { error } = await (supabase
        .from("appraisal_position_weights" as any)
        .insert(records) as any);

      if (error) throw error;

      toast.success("Position weights saved successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving weights:", error);
      toast.error(error.message || "Failed to save weights");
    } finally {
      setSaving(false);
    }
  };

  const distributeEvenly = () => {
    const count = positions.length;
    if (count === 0) return;

    const equalWeight = Math.floor(100 / count);
    const remainder = 100 - equalWeight * count;

    setPositions((prev) =>
      prev.map((p, idx) => ({
        ...p,
        weight_percentage: equalWeight + (idx === 0 ? remainder : 0),
      }))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Configure Position Weights
          </DialogTitle>
          <DialogDescription>
            Set the weight percentage for each position held by {employeeName}.
            Scores will be aggregated based on these weights.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading positions...
          </div>
        ) : positions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No active positions found for this employee.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={distributeEvenly}>
                Distribute Evenly
              </Button>
            </div>

            <div className="space-y-3">
              {positions.map((position) => (
                <Card key={position.position_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{position.position_title}</p>
                          {position.is_primary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        {position.job_title && (
                          <p className="text-sm text-muted-foreground">
                            {position.job_title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Checkbox
                            id={`primary-${position.position_id}`}
                            checked={position.is_primary}
                            onCheckedChange={(checked) =>
                              handlePrimaryChange(position.position_id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`primary-${position.position_id}`}
                            className="text-xs text-muted-foreground cursor-pointer"
                          >
                            Set as primary position
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={position.weight_percentage}
                          onChange={(e) =>
                            handleWeightChange(
                              position.position_id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 text-right"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total Validation */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                isValid ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              <span className="text-sm font-medium">Total</span>
              <span
                className={`text-lg font-bold ${
                  isValid ? "text-success" : "text-destructive"
                }`}
              >
                {totalWeight.toFixed(0)}%
              </span>
            </div>

            {!isValid && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Weights must total exactly 100%
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isValid || positions.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Weights
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
