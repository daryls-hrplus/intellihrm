import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { SeatStatusBadge } from './SeatStatusBadge';
import type { PositionSeat, PositionSeatHistory, SeatStatus } from './types';

interface SeatHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seat: PositionSeat | null;
}

export function SeatHistoryDialog({ open, onOpenChange, seat }: SeatHistoryDialogProps) {
  const [history, setHistory] = useState<PositionSeatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && seat) {
      fetchHistory();
    }
  }, [open, seat]);

  const fetchHistory = async () => {
    if (!seat) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('position_seat_history')
        .select('*')
        .eq('seat_id', seat.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data || []) as PositionSeatHistory[]);
    } catch (err) {
      console.error('Error fetching seat history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Seat History
          </DialogTitle>
          <DialogDescription>
            Status changes for seat <span className="font-mono font-medium">{seat.seat_code}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Current Status */}
          <div className="mb-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Current Status</p>
            <SeatStatusBadge status={seat.status} size="lg" />
          </div>

          {/* History Timeline */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.previous_status && (
                          <>
                            <SeatStatusBadge 
                              status={entry.previous_status as SeatStatus} 
                              size="sm"
                            />
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </>
                        )}
                        <SeatStatusBadge 
                          status={entry.new_status as SeatStatus} 
                          size="sm"
                        />
                      </div>
                      
                      {entry.change_reason && (
                        <p className="text-sm text-muted-foreground">
                          {entry.change_reason}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No status changes recorded yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
