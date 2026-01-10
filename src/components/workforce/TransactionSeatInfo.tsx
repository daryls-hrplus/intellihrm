import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Armchair, Users, AlertTriangle, ArrowRight, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface TransactionSeatInfoProps {
  positionId?: string;
  employeeId?: string;
  transactionType?: string;
  showAvailableSeats?: boolean;
  showEmployeeFTE?: boolean;
}

interface AvailableSeat {
  id: string;
  seat_code: string;
  is_shared_seat: boolean;
  max_occupants: number;
  current_occupant_count: number;
  status: string;
}

interface EmployeeFTE {
  total_fte: number;
  positions: Array<{
    position_title: string;
    fte_percentage: number;
    seat_code: string;
  }>;
}

export function TransactionSeatInfo({
  positionId,
  employeeId,
  transactionType,
  showAvailableSeats = true,
  showEmployeeFTE = true,
}: TransactionSeatInfoProps) {
  // Fetch available seats for position
  const { data: availableSeats } = useQuery({
    queryKey: ['available-seats', positionId],
    queryFn: async () => {
      if (!positionId) return [];
      
      const { data, error } = await supabase
        .from('seat_occupancy_summary')
        .select('*')
        .eq('position_id', positionId)
        .or('allocation_status.eq.VACANT,allocation_status.eq.UNDER_ALLOCATED');
      
      if (error) throw error;
      return (data || []) as unknown as AvailableSeat[];
    },
    enabled: !!positionId && showAvailableSeats,
  });

  // Fetch employee FTE summary
  const { data: employeeFTE } = useQuery({
    queryKey: ['employee-fte', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('employee_fte_summary')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as EmployeeFTE | null;
    },
    enabled: !!employeeId && showEmployeeFTE,
  });

  // Fetch current seat for employee (for transfers/secondments)
  const { data: currentSeat } = useQuery({
    queryKey: ['current-seat', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('seat_occupants')
        .select(`
          *,
          seat:position_seats(
            seat_code,
            position:positions(title)
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_primary_occupant', true)
        .is('end_date', null)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!employeeId && ['TRANSFER', 'PROMOTION', 'SECONDMENT'].includes(transactionType || ''),
  });

  const totalFTE = employeeFTE?.total_fte || 0;
  const isOverAllocated = totalFTE > 100;
  const willExceedFTE = totalFTE + 100 > 100; // Assuming new position adds 100% FTE

  if (!positionId && !employeeId) return null;

  return (
    <div className="space-y-4">
      {/* Employee FTE Warning */}
      {showEmployeeFTE && employeeFTE && (
        <Card className={isOverAllocated ? 'border-destructive' : willExceedFTE ? 'border-warning' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {isOverAllocated && <AlertTriangle className="h-4 w-4 text-destructive" />}
              Employee FTE Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Total FTE</span>
                <span className={isOverAllocated ? 'text-destructive font-bold' : ''}>
                  {totalFTE.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(totalFTE, 100)} 
                className={isOverAllocated ? '[&>div]:bg-destructive' : ''}
              />
              {isOverAllocated && (
                <p className="text-xs text-destructive">
                  Warning: Employee is over-allocated by {(totalFTE - 100).toFixed(0)}%
                </p>
              )}
              {willExceedFTE && !isOverAllocated && transactionType !== 'TERMINATION' && (
                <p className="text-xs text-warning">
                  Adding this position will exceed 100% FTE allocation
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Seat (for transfers/secondments) */}
      {currentSeat && ['TRANSFER', 'PROMOTION', 'SECONDMENT'].includes(transactionType || '') && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Current Seat Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{(currentSeat.seat as any)?.seat_code}</p>
                <p className="text-xs text-muted-foreground">
                  {(currentSeat.seat as any)?.position?.title}
                </p>
              </div>
              <Badge variant="outline">{currentSeat.fte_percentage}% FTE</Badge>
            </div>
            {transactionType === 'SECONDMENT' && (
              <p className="text-xs text-muted-foreground mt-2">
                Origin seat will be held during secondment
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Seats */}
      {showAvailableSeats && positionId && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Armchair className="h-4 w-4" />
              Available Seats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableSeats && availableSeats.length > 0 ? (
              <div className="space-y-2">
                {availableSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Armchair className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{seat.seat_code}</span>
                      {seat.is_shared_seat && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={seat.status === 'VACANT' ? 'default' : 'secondary'}
                    >
                      {seat.status === 'VACANT' 
                        ? 'Vacant' 
                        : `${seat.current_occupant_count}/${seat.max_occupants}`
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No available seats for this position
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Secondment Info */}
      {transactionType === 'SECONDMENT' && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Secondment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>Employee's original seat will be held during secondment</li>
              <li>Secondment seat will be tracked separately</li>
              <li>Return date will trigger automatic seat restoration</li>
              <li>FTE can be split between origin and secondment positions</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
