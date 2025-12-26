import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Sparkles } from "lucide-react";
import { 
  CalibrationEmployee, 
  NineBoxPosition, 
  NINE_BOX_LABELS, 
  NINE_BOX_COLORS,
  getBoxCoordinates 
} from "@/types/calibration";
import { cn } from "@/lib/utils";

interface CalibrationNineBoxProps {
  employees: CalibrationEmployee[];
  onEmployeeClick: (employee: CalibrationEmployee) => void;
  onPositionChange: (employeeId: string, newPosition: NineBoxPosition) => void;
  selectedEmployeeId?: string;
}

const GRID_POSITIONS: NineBoxPosition[][] = [
  ['high_potential_low_performer', 'high_potential_solid_performer', 'high_potential_high_performer'],
  ['moderate_potential_low_performer', 'moderate_potential_solid_performer', 'moderate_potential_high_performer'],
  ['low_potential_low_performer', 'low_potential_solid_performer', 'low_potential_high_performer'],
];

export function CalibrationNineBox({ 
  employees, 
  onEmployeeClick, 
  onPositionChange,
  selectedEmployeeId 
}: CalibrationNineBoxProps) {
  
  const employeesByPosition = useMemo(() => {
    const grouped = new Map<NineBoxPosition, CalibrationEmployee[]>();
    
    GRID_POSITIONS.flat().forEach(pos => {
      grouped.set(pos, []);
    });

    employees.forEach(emp => {
      const current = grouped.get(emp.boxPosition) || [];
      grouped.set(emp.boxPosition, [...current, emp]);
    });

    return grouped;
  }, [employees]);

  const handleDrop = (e: React.DragEvent, targetPosition: NineBoxPosition) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData("employeeId");
    if (employeeId) {
      onPositionChange(employeeId, targetPosition);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, employeeId: string) => {
    e.dataTransfer.setData("employeeId", employeeId);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">9-Box Calibration Grid</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag employees between boxes to adjust their position
        </p>
      </CardHeader>
      <CardContent>
        {/* Y-Axis Label */}
        <div className="flex">
          <div className="w-8 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground -rotate-90 whitespace-nowrap">
              Potential →
            </span>
          </div>
          
          <div className="flex-1">
            {/* Grid */}
            <div className="grid grid-cols-3 gap-2">
              {GRID_POSITIONS.map((row, rowIdx) => (
                row.map((position, colIdx) => {
                  const boxEmployees = employeesByPosition.get(position) || [];
                  const label = NINE_BOX_LABELS[position];
                  const colorClass = NINE_BOX_COLORS[position];

                  return (
                    <div
                      key={position}
                      className={cn(
                        "min-h-[140px] rounded-lg border-2 border-dashed p-2 transition-colors",
                        "hover:border-primary/50"
                      )}
                      onDrop={(e) => handleDrop(e, position)}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className={cn("text-xs text-white", colorClass)}>
                          {label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {boxEmployees.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <TooltipProvider>
                          {boxEmployees.slice(0, 8).map(emp => (
                            <Tooltip key={emp.employeeId}>
                              <TooltipTrigger asChild>
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, emp.employeeId)}
                                  onClick={() => onEmployeeClick(emp)}
                                  className={cn(
                                    "relative cursor-pointer transition-transform hover:scale-110",
                                    selectedEmployeeId === emp.employeeId && "ring-2 ring-primary ring-offset-2 rounded-full"
                                  )}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={emp.avatarUrl} />
                                    <AvatarFallback className="text-xs">
                                      {emp.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {emp.hasAnomalies && (
                                    <AlertTriangle className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                                  )}
                                  {emp.aiSuggestion && (
                                    <Sparkles className="absolute -bottom-1 -right-1 h-3 w-3 text-purple-500" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium">{emp.employeeName}</p>
                                  <p className="text-muted-foreground">{emp.department}</p>
                                  <p>Score: {emp.currentScore.toFixed(2)}</p>
                                  {emp.hasAnomalies && (
                                    <p className="text-yellow-600">⚠️ Rating anomaly detected</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {boxEmployees.length > 8 && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                              +{boxEmployees.length - 8}
                            </div>
                          )}
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })
              ))}
            </div>

            {/* X-Axis Label */}
            <div className="text-center mt-2">
              <span className="text-xs font-medium text-muted-foreground">
                Performance →
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
