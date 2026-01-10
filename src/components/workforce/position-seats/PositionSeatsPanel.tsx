import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  MoreVertical, 
  Snowflake, 
  Sun, 
  User,
  Users,
  UserPlus,
  Calendar,
  History,
  AlertTriangle,
  DollarSign,
  ArrowRightLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { usePositionSeats } from './hooks/usePositionSeats';
import { useSeatOccupants, useEmployeeFTESummary } from './hooks/useMultiOccupancy';
import { SeatStatusBadge } from './SeatStatusBadge';
import { FreezeSeatDialog } from './FreezeSeatDialog';
import { SeatHistoryDialog } from './SeatHistoryDialog';
import { AddOccupantDialog } from './AddOccupantDialog';
import { FTEValidationAlert } from './FTEValidationAlert';
import { MultiOccupancySeatCard } from './MultiOccupancySeatCard';
import type { PositionSeat, SeatStatus, SeatOccupant } from './types';
import { ASSIGNMENT_TYPE_CONFIG } from './types';

interface PositionSeatsPanelProps {
  positionId: string;
  positionTitle: string;
  authorizedHeadcount: number;
  onRequestChange?: () => void;
}

export function PositionSeatsPanel({ 
  positionId, 
  positionTitle,
  authorizedHeadcount,
  onRequestChange 
}: PositionSeatsPanelProps) {
  const { seats, isLoading, updateSeatStatus, freezeSeat, unfreezeSeat } = usePositionSeats(positionId);
  const { overAllocatedEmployees } = useEmployeeFTESummary();
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [selectedSeatForFreeze, setSelectedSeatForFreeze] = useState<PositionSeat | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedSeatForHistory, setSelectedSeatForHistory] = useState<PositionSeat | null>(null);
  const [addOccupantDialogOpen, setAddOccupantDialogOpen] = useState(false);
  const [selectedSeatForOccupant, setSelectedSeatForOccupant] = useState<PositionSeat | null>(null);
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string; email: string }>>([]);

  // Fetch employees for add occupant dialog
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      if (data) setEmployees(data);
    };
    fetchEmployees();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filledSeats = seats.filter(s => s.status === 'FILLED').length;
  const vacantSeats = seats.filter(s => s.status === 'VACANT').length;
  const frozenSeats = seats.filter(s => s.status === 'FROZEN').length;
  const sharedSeats = seats.filter(s => s.is_shared_seat).length;
  const activeSeats = seats.filter(s => s.status !== 'ELIMINATED').length;
  const fillRate = activeSeats > 0 ? (filledSeats / activeSeats) * 100 : 0;

  const handleFreeze = (seat: PositionSeat) => {
    setSelectedSeatForFreeze(seat);
    setFreezeDialogOpen(true);
  };

  const handleUnfreeze = async (seat: PositionSeat) => {
    await unfreezeSeat(seat.id);
  };

  const handleViewHistory = (seat: PositionSeat) => {
    setSelectedSeatForHistory(seat);
    setHistoryDialogOpen(true);
  };

  const handleAddOccupant = (seat: PositionSeat) => {
    setSelectedSeatForOccupant(seat);
    setAddOccupantDialogOpen(true);
  };

  const getStatusOrder = (status: SeatStatus): number => {
    const order: Record<SeatStatus, number> = {
      FILLED: 1,
      VACANT: 2,
      APPROVED: 3,
      PLANNED: 4,
      FROZEN: 5,
      ELIMINATED: 6
    };
    return order[status];
  };

  const sortedSeats = [...seats].sort((a, b) => 
    getStatusOrder(a.status) - getStatusOrder(b.status) || a.seat_number - b.seat_number
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{positionTitle} Seats</CardTitle>
            <CardDescription>
              {filledSeats} of {activeSeats} seats filled
              {frozenSeats > 0 && ` • ${frozenSeats} frozen`}
              {sharedSeats > 0 && ` • ${sharedSeats} shared`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold">{filledSeats}/{activeSeats}</div>
              <Progress value={fillRate} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* FTE Validation Alert */}
        <FTEValidationAlert overAllocatedEmployees={overAllocatedEmployees} />

        {/* Seat Status Summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 font-medium">
            {filledSeats} Filled
          </Badge>
          <Badge variant="secondary" className="bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 font-medium">
            {vacantSeats} Vacant
          </Badge>
          {frozenSeats > 0 && (
            <Badge variant="secondary" className="bg-cyan-200 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100 font-medium">
              {frozenSeats} Frozen
            </Badge>
          )}
          {sharedSeats > 0 && (
            <Badge variant="secondary" className="bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100 font-medium">
              <Users className="h-3 w-3 mr-1" />
              {sharedSeats} Shared
            </Badge>
          )}
        </div>

        {/* Seats Grid */}
        <div className="grid gap-2">
          {sortedSeats.map((seat) => (
            <SeatRow 
              key={seat.id} 
              seat={seat}
              onFreeze={handleFreeze}
              onUnfreeze={handleUnfreeze}
              onViewHistory={handleViewHistory}
              onAddOccupant={handleAddOccupant}
            />
          ))}
        </div>

        {seats.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No seats created yet.</p>
            <p className="text-sm mt-1">Seats are auto-generated when positions are created or headcount increases.</p>
          </div>
        )}
      </CardContent>

      {/* Dialogs */}
      <FreezeSeatDialog
        open={freezeDialogOpen}
        onOpenChange={setFreezeDialogOpen}
        seat={selectedSeatForFreeze}
        onConfirm={async (reason: string, approvedBy: string) => {
          if (selectedSeatForFreeze) {
            await freezeSeat(selectedSeatForFreeze.id, reason, approvedBy);
          }
          setFreezeDialogOpen(false);
        }}
      />

      <SeatHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        seat={selectedSeatForHistory}
      />

      {selectedSeatForOccupant && (
        <AddOccupantDialogWrapper
          open={addOccupantDialogOpen}
          onOpenChange={setAddOccupantDialogOpen}
          seatId={selectedSeatForOccupant.id}
          seatCode={selectedSeatForOccupant.seat_code}
          employees={employees}
        />
      )}
    </Card>
  );
}

function AddOccupantDialogWrapper({ 
  open, 
  onOpenChange, 
  seatId, 
  seatCode, 
  employees 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  seatId: string; 
  seatCode: string;
  employees: Array<{ id: string; full_name: string; email: string }>;
}) {
  const { addOccupant } = useSeatOccupants(seatId);

  return (
    <AddOccupantDialog
      open={open}
      onOpenChange={onOpenChange}
      seatCode={seatCode}
      employees={employees}
      onConfirm={addOccupant}
    />
  );
}

interface SeatRowProps {
  seat: PositionSeat;
  onFreeze: (seat: PositionSeat) => void;
  onUnfreeze: (seat: PositionSeat) => void;
  onViewHistory: (seat: PositionSeat) => void;
  onAddOccupant: (seat: PositionSeat) => void;
}

function SeatRow({ seat, onFreeze, onUnfreeze, onViewHistory, onAddOccupant }: SeatRowProps) {
  const isDisplacement = seat.requires_displacement;
  const isShared = seat.is_shared_seat;
  const hasSecondment = seat.secondment_origin_seat_id !== null;
  const hasBudget = seat.budget_allocation_amount && seat.budget_allocation_amount > 0;
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        seat.status === 'ELIMINATED' && "opacity-50",
        seat.status === 'FROZEN' && "border-cyan-500/50 bg-cyan-50/50 dark:bg-cyan-950/20",
        isDisplacement && "border-red-500/50 bg-red-50/50 dark:bg-red-950/20",
        isShared && "border-purple-500/30 bg-purple-50/30 dark:bg-purple-950/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="font-mono text-sm text-muted-foreground w-16">
          {seat.seat_code}
        </div>
        
        <SeatStatusBadge status={seat.status} />

        {isShared && (
          <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
            <Users className="h-3 w-3 mr-1" />
            Shared
          </Badge>
        )}

        {hasSecondment && (
          <Badge variant="outline" className="text-xs text-cyan-600 border-cyan-300">
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            Secondment
          </Badge>
        )}

        {seat.current_employee && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{seat.current_employee.full_name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{seat.current_employee.email}</p>
                {seat.current_employee.employee_id && (
                  <p className="text-xs text-muted-foreground">ID: {seat.current_employee.employee_id}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {seat.status === 'FROZEN' && seat.freeze_reason && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-cyan-800 dark:text-cyan-200 border-cyan-600 dark:border-cyan-400 text-xs font-medium">
                  <Snowflake className="h-3 w-3 mr-1" />
                  Frozen
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Freeze Reason:</p>
                <p className="text-sm">{seat.freeze_reason}</p>
                {seat.frozen_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Since {format(new Date(seat.frozen_date), 'MMM d, yyyy')}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {isDisplacement && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Displacement Required
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This seat requires displacement action due to headcount reduction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasBudget && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: seat.budget_allocation_currency || 'USD',
                    notation: 'compact'
                  }).format(seat.budget_allocation_amount || 0)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Budget: {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: seat.budget_allocation_currency || 'USD'
                }).format(seat.budget_allocation_amount || 0)}</p>
                {seat.budget_funding_source && <p>Source: {seat.budget_funding_source}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {seat.filled_date && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(seat.filled_date), 'MMM yyyy')}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filled on {format(new Date(seat.filled_date), 'MMMM d, yyyy')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddOccupant(seat)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Occupant
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewHistory(seat)}>
              <History className="h-4 w-4 mr-2" />
              View History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {seat.status === 'FROZEN' ? (
              <DropdownMenuItem onClick={() => onUnfreeze(seat)}>
                <Sun className="h-4 w-4 mr-2" />
                Unfreeze Seat
              </DropdownMenuItem>
            ) : seat.status !== 'ELIMINATED' && (
              <DropdownMenuItem onClick={() => onFreeze(seat)}>
                <Snowflake className="h-4 w-4 mr-2" />
                Freeze Seat
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
