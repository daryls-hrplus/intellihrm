import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CalendarCheck,
  CalendarClock
} from "lucide-react";

interface LeaveBalanceSummaryProps {
  leaveTypeName: string;
  leaveTypeColor?: string;
  accrualUnit: string;
  openingBalance: number;
  entitlement: number;
  earnedYTD: number;
  takenYTD: number;
  currentBalance: number;
  bookedPending: number;
}

export function LeaveBalanceSummary({
  leaveTypeName,
  leaveTypeColor = "#3B82F6",
  accrualUnit,
  openingBalance,
  entitlement,
  earnedYTD,
  takenYTD,
  currentBalance,
  bookedPending,
}: LeaveBalanceSummaryProps) {
  const availableAfterBooked = useMemo(() => {
    return Math.max(0, currentBalance - bookedPending);
  }, [currentBalance, bookedPending]);

  const items = [
    {
      label: "Opening Balance",
      sublabel: "Start of Year",
      value: openingBalance,
      icon: Calendar,
      color: "text-muted-foreground",
    },
    {
      label: "Annual Entitlement",
      sublabel: "For the Year",
      value: entitlement,
      icon: CalendarCheck,
      color: "text-blue-600",
    },
    {
      label: "Leave Earned",
      sublabel: "Year to Date",
      value: earnedYTD,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Leave Taken",
      sublabel: "Year to Date",
      value: takenYTD,
      icon: TrendingDown,
      color: "text-orange-600",
    },
    {
      label: "Current Balance",
      sublabel: "Available",
      value: currentBalance,
      icon: Clock,
      color: "text-primary",
      highlight: true,
    },
    {
      label: "Leave Booked",
      sublabel: "Pending/Approved",
      value: bookedPending,
      icon: CalendarClock,
      color: "text-amber-600",
    },
  ];

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: leaveTypeColor }} 
          />
          <span className="font-medium text-sm">{leaveTypeName}</span>
          <Badge variant="outline" className="capitalize text-xs">
            {accrualUnit}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {items.map((item) => (
            <div 
              key={item.label}
              className={`text-center p-2 rounded-lg ${item.highlight ? 'bg-primary/10' : 'bg-background/50'}`}
            >
              <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
              <p className="text-[9px] text-muted-foreground/70">{item.sublabel}</p>
            </div>
          ))}
        </div>

        {bookedPending > 0 && (
          <div className="mt-3 pt-2 border-t border-dashed text-center">
            <p className="text-xs text-muted-foreground">
              Available after booked leave: <span className="font-semibold text-foreground">{availableAfterBooked} {accrualUnit}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
