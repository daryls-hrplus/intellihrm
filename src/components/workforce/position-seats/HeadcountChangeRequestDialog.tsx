import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Snowflake, 
  Sun,
  AlertTriangle,
  Users,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getTodayString } from '@/utils/dateUtils';
import type { HeadcountRequestType, PositionSeat } from './types';

interface HeadcountChangeRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionId: string;
  positionTitle: string;
  positionCode: string;
  currentHeadcount: number;
  filledCount: number;
  companyId: string;
  onSuccess?: () => void;
}

export function HeadcountChangeRequestDialog({
  open,
  onOpenChange,
  positionId,
  positionTitle,
  positionCode,
  currentHeadcount,
  filledCount,
  companyId,
  onSuccess
}: HeadcountChangeRequestDialogProps) {
  const [requestType, setRequestType] = useState<HeadcountRequestType>('INCREASE');
  const [requestedHeadcount, setRequestedHeadcount] = useState<number>(currentHeadcount + 1);
  const [justification, setJustification] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(getTodayString());
  const [budgetImpact, setBudgetImpact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [affectedSeats, setAffectedSeats] = useState<PositionSeat[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setRequestType('INCREASE');
      setRequestedHeadcount(currentHeadcount + 1);
      setJustification('');
      setEffectiveDate(getTodayString());
      setBudgetImpact('');
      setAffectedSeats([]);
    }
  }, [open, currentHeadcount]);

  // Fetch affected seats when decreasing
  useEffect(() => {
    if (requestType === 'DECREASE' && requestedHeadcount < currentHeadcount) {
      fetchAffectedSeats();
    } else {
      setAffectedSeats([]);
    }
  }, [requestType, requestedHeadcount, currentHeadcount, positionId]);

  const fetchAffectedSeats = async () => {
    const reductionCount = currentHeadcount - requestedHeadcount;
    
    // Get filled seats that would be affected (LIFO - last in, first out)
    const { data } = await supabase
      .from('position_seats')
      .select(`
        *,
        current_employee:profiles!position_seats_current_employee_id_fkey(
          full_name,
          email
        )
      `)
      .eq('position_id', positionId)
      .eq('status', 'FILLED')
      .order('filled_date', { ascending: false })
      .limit(reductionCount);

    if (data) {
      setAffectedSeats(data as unknown as PositionSeat[]);
    }
  };

  const changeAmount = requestedHeadcount - currentHeadcount;
  const vacantCount = currentHeadcount - filledCount;
  const displacementRequired = requestType === 'DECREASE' && 
    (currentHeadcount - requestedHeadcount) > vacantCount;

  const handleSubmit = async () => {
    if (!justification.trim()) {
      toast.error('Business justification is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('headcount_change_requests')
        .insert({
          position_id: positionId,
          company_id: companyId,
          request_type: requestType,
          current_headcount: currentHeadcount,
          requested_headcount: requestedHeadcount,
          change_amount: changeAmount,
          business_justification: justification.trim(),
          budget_impact_amount: budgetImpact ? parseFloat(budgetImpact) : null,
          effective_date: effectiveDate,
          requested_by: user?.id,
          status: 'PENDING',
          displacement_required: displacementRequired,
          affected_seats: affectedSeats.map(s => s.id),
          impact_analysis: {
            affected_employees: displacementRequired ? affectedSeats.length : 0,
            vacant_seats_available: vacantCount,
            requires_displacement: displacementRequired
          }
        });

      if (error) throw error;

      toast.success('Headcount change request submitted');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequestTypeIcon = (type: HeadcountRequestType) => {
    switch (type) {
      case 'INCREASE': return <TrendingUp className="h-4 w-4" />;
      case 'DECREASE': return <TrendingDown className="h-4 w-4" />;
      case 'FREEZE': return <Snowflake className="h-4 w-4" />;
      case 'UNFREEZE': return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Headcount Change</DialogTitle>
          <DialogDescription>
            Submit a request to change the authorized headcount for{' '}
            <span className="font-medium">{positionTitle}</span> ({positionCode})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentHeadcount}</div>
              <div className="text-xs text-muted-foreground">Authorized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filledCount}</div>
              <div className="text-xs text-muted-foreground">Filled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{vacantCount}</div>
              <div className="text-xs text-muted-foreground">Vacant</div>
            </div>
          </div>

          {/* Request Type */}
          <div className="space-y-3">
            <Label>Request Type</Label>
            <RadioGroup
              value={requestType}
              onValueChange={(v) => {
                setRequestType(v as HeadcountRequestType);
                if (v === 'INCREASE') {
                  setRequestedHeadcount(currentHeadcount + 1);
                } else if (v === 'DECREASE') {
                  setRequestedHeadcount(Math.max(filledCount, currentHeadcount - 1));
                }
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="INCREASE" id="increase" />
                <Label htmlFor="increase" className="flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Increase
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="DECREASE" id="decrease" />
                <Label htmlFor="decrease" className="flex items-center gap-2 cursor-pointer">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Decrease
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Requested Headcount */}
          <div className="space-y-2">
            <Label>Requested Headcount</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={requestType === 'DECREASE' ? 0 : currentHeadcount}
                max={requestType === 'INCREASE' ? 999 : currentHeadcount}
                value={requestedHeadcount}
                onChange={(e) => setRequestedHeadcount(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Change:</span>
                <Badge 
                  variant={changeAmount > 0 ? 'default' : changeAmount < 0 ? 'destructive' : 'secondary'}
                  className="text-sm"
                >
                  {changeAmount > 0 ? '+' : ''}{changeAmount}
                </Badge>
              </div>
            </div>
          </div>

          {/* Displacement Warning */}
          {displacementRequired && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Displacement Required:</strong> Reducing headcount by {Math.abs(changeAmount)} 
                will affect {affectedSeats.length} filled seat(s). A displacement workflow will be 
                initiated upon approval.
                {affectedSeats.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Affected employees:</p>
                    {affectedSeats.map(seat => (
                      <div key={seat.id} className="flex items-center gap-2 text-xs">
                        <Users className="h-3 w-3" />
                        {seat.current_employee?.full_name}
                      </div>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Effective Date */}
          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          {/* Budget Impact */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Budget Impact (optional)
            </Label>
            <Input
              type="number"
              placeholder="Annual cost/savings"
              value={budgetImpact}
              onChange={(e) => setBudgetImpact(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {requestType === 'INCREASE' ? 'Estimated annual cost' : 'Estimated annual savings'}
            </p>
          </div>

          {/* Business Justification */}
          <div className="space-y-2">
            <Label>Business Justification *</Label>
            <Textarea
              placeholder="Explain the business need for this headcount change..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!justification.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {getRequestTypeIcon(requestType)}
                <span className="ml-2">Submit Request</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
