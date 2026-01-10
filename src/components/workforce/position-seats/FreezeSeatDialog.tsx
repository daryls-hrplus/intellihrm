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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Snowflake, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { PositionSeat } from './types';

interface FreezeSeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seat: PositionSeat | null;
  onConfirm: (reason: string, approvedBy: string) => Promise<void>;
}

export function FreezeSeatDialog({ 
  open, 
  onOpenChange, 
  seat,
  onConfirm 
}: FreezeSeatDialogProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onConfirm(reason.trim(), currentUserId);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!seat) return null;

  const hasEmployee = !!seat.current_employee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-cyan-600" />
            Freeze Seat
          </DialogTitle>
          <DialogDescription>
            Freezing seat <span className="font-mono font-medium">{seat.seat_code}</span> will 
            prevent it from being filled or counted as available headcount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasEmployee && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Seat is currently occupied
                </p>
                <p className="text-amber-700 dark:text-amber-500 mt-1">
                  <strong>{seat.current_employee?.full_name}</strong> is assigned to this seat. 
                  Freezing will not remove the employee but will flag this seat for review.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="freeze-reason">Freeze Reason *</Label>
            <Textarea
              id="freeze-reason"
              placeholder="e.g., Budget constraints, restructuring, hiring freeze..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be logged for audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!reason.trim() || isProcessing}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Freezing...
              </>
            ) : (
              <>
                <Snowflake className="h-4 w-4 mr-2" />
                Freeze Seat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
