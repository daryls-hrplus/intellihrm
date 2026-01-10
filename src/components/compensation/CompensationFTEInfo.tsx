import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info, Users, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import type { AssignmentType } from '@/components/workforce/position-seats/types';

interface SeatAllocation {
  seat_id: string;
  position_id: string;
  position_title: string | null;
  fte_percentage: number;
  assignment_type: AssignmentType;
}

interface CompensationFTEInfoProps {
  employeeId: string;
  positionId: string;
}

export function CompensationFTEInfo({ employeeId, positionId }: CompensationFTEInfoProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [totalFTE, setTotalFTE] = useState(0);
  const [seatAllocations, setSeatAllocations] = useState<SeatAllocation[]>([]);
  const [currentPositionFTE, setCurrentPositionFTE] = useState<number | null>(null);

  useEffect(() => {
    if (employeeId && positionId) {
      loadFTEData();
    }
  }, [employeeId, positionId]);

  const loadFTEData = async () => {
    setLoading(true);
    try {
      // Fetch all active seat occupancies for this employee
      const { data: occupancies, error } = await supabase
        .from('seat_occupants')
        .select(`
          seat_id,
          fte_percentage,
          assignment_type,
          seat:position_seats!inner(
            position_id,
            position:positions(title)
          )
        `)
        .eq('employee_id', employeeId)
        .or('end_date.is.null,end_date.gt.now()')
        .lte('start_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      if (occupancies) {
        const allocations: SeatAllocation[] = occupancies.map((occ: any) => ({
          seat_id: occ.seat_id,
          position_id: occ.seat?.position_id,
          position_title: occ.seat?.position?.title || null,
          fte_percentage: occ.fte_percentage,
          assignment_type: occ.assignment_type as AssignmentType,
        }));

        setSeatAllocations(allocations);
        
        const total = allocations.reduce((sum, a) => sum + (a.fte_percentage || 0), 0);
        setTotalFTE(total);

        // Find current position's FTE
        const currentAlloc = allocations.find(a => a.position_id === positionId);
        setCurrentPositionFTE(currentAlloc?.fte_percentage || null);
      }
    } catch (error) {
      console.error('Error loading FTE data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  const isOverAllocated = totalFTE > 100;
  const hasMultiplePositions = seatAllocations.length > 1;

  return (
    <div className="space-y-3">
      {/* FTE Summary Panel */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t('compensation.fteInfo.title', 'FTE Allocation Context')}
            </span>
          </div>
          <Badge 
            variant={isOverAllocated ? 'destructive' : 'secondary'}
            className={isOverAllocated ? '' : totalFTE === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
          >
            {totalFTE.toFixed(0)}% {t('compensation.fteInfo.totalFTE', 'Total FTE')}
          </Badge>
        </div>

        {/* Current Position FTE */}
        {currentPositionFTE !== null && (
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {t('compensation.fteInfo.thisPosition', 'This position FTE')}:
            </span>
            <span className="font-medium">{currentPositionFTE}%</span>
          </div>
        )}

        {/* Other Positions */}
        {hasMultiplePositions && (
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Users className="h-3 w-3" />
              {t('compensation.fteInfo.otherPositions', 'Other positions')}:
            </div>
            <div className="space-y-1">
              {seatAllocations
                .filter(a => a.position_id !== positionId)
                .map((alloc) => (
                  <div 
                    key={alloc.seat_id}
                    className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {alloc.position_title || t('common.unknown', 'Unknown')}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {alloc.assignment_type}
                      </Badge>
                    </div>
                    <span className="font-medium">{alloc.fte_percentage}%</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Warning if over 100% */}
      {isOverAllocated && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">
            {t('compensation.fteInfo.overAllocatedTitle', 'FTE Over-Allocation Warning')}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t('compensation.fteInfo.overAllocatedDescription', 
              'This employee\'s total FTE allocation ({{total}}%) exceeds 100%. Review seat assignments before adding compensation.',
              { total: totalFTE.toFixed(0) }
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
