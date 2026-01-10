import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, User } from 'lucide-react';
import { useEmployeeFTESummary } from './hooks/useMultiOccupancy';
import type { AssignmentType } from './types';
import { ASSIGNMENT_TYPE_CONFIG } from './types';

interface AddOccupantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    employee_id: string;
    fte_percentage: number;
    assignment_type: AssignmentType;
    is_primary_occupant: boolean;
    budget_percentage: number;
    start_date: string;
    end_date: string | null;
    notes: string;
  }) => Promise<boolean>;
  employees: Array<{ id: string; full_name: string; email: string }>;
  seatCode: string;
}

export function AddOccupantDialog({ open, onOpenChange, onConfirm, employees, seatCode }: AddOccupantDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [ftePercentage, setFtePercentage] = useState(100);
  const [budgetPercentage, setBudgetPercentage] = useState(100);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('primary');
  const [isPrimary, setIsPrimary] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { summary: employeeFTE } = useEmployeeFTESummary(selectedEmployeeId || undefined);
  const projectedTotalFTE = (employeeFTE?.total_fte_percentage || 0) + ftePercentage;
  const willOverAllocate = projectedTotalFTE > 100;

  const handleSubmit = async () => {
    if (!selectedEmployeeId) return;
    setIsSubmitting(true);
    const success = await onConfirm({
      employee_id: selectedEmployeeId,
      fte_percentage: ftePercentage,
      assignment_type: assignmentType,
      is_primary_occupant: isPrimary,
      budget_percentage: budgetPercentage,
      start_date: startDate,
      end_date: endDate || null,
      notes,
    });
    setIsSubmitting(false);
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployeeId('');
    setFtePercentage(100);
    setBudgetPercentage(100);
    setAssignmentType('primary');
    setIsPrimary(false);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add Occupant to {seatCode}
          </DialogTitle>
          <DialogDescription>
            Assign an employee to this seat with FTE and budget allocation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FTE Warning */}
          {selectedEmployeeId && employeeFTE && (
            <div className="text-sm">
              <p className="text-muted-foreground">
                Current FTE: <span className="font-medium">{employeeFTE.total_fte_percentage}%</span>
                {employeeFTE.active_seat_count > 0 && (
                  <span> across {employeeFTE.active_seat_count} position(s)</span>
                )}
              </p>
            </div>
          )}

          {willOverAllocate && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will result in {projectedTotalFTE}% total FTE allocation (exceeds 100%)
              </AlertDescription>
            </Alert>
          )}

          {/* Assignment Type */}
          <div className="space-y-2">
            <Label>Assignment Type</Label>
            <Select value={assignmentType} onValueChange={(v) => setAssignmentType(v as AssignmentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASSIGNMENT_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={config.color}>{config.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FTE Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>FTE Percentage</Label>
              <Badge variant="secondary">{ftePercentage}%</Badge>
            </div>
            <Slider
              value={[ftePercentage]}
              onValueChange={([v]) => setFtePercentage(v)}
              min={5}
              max={100}
              step={5}
            />
          </div>

          {/* Budget Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Budget Allocation</Label>
              <Badge variant="outline">{budgetPercentage}%</Badge>
            </div>
            <Slider
              value={[budgetPercentage]}
              onValueChange={([v]) => setBudgetPercentage(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Primary Occupant */}
          <div className="flex items-center justify-between">
            <Label>Primary Occupant</Label>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedEmployeeId || isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Occupant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}