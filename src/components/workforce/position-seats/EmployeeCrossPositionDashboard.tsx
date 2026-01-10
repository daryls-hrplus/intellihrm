import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployeeFTESummary } from './hooks/useMultiOccupancy';
import { FTEValidationAlert } from './FTEValidationAlert';
import { FTE_STATUS_CONFIG, ASSIGNMENT_TYPE_CONFIG } from './types';
import type { FTEStatus, AssignmentType } from './types';

export function EmployeeCrossPositionDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const { allSummaries, overAllocatedEmployees, isLoading } = useEmployeeFTESummary();

  const filteredSummaries = allSummaries.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const multiPositionEmployees = filteredSummaries.filter(e => e.active_seat_count > 1);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Employee FTE Dashboard
            </CardTitle>
            <CardDescription>
              Cross-position allocation overview
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredSummaries.length} employees</Badge>
            {multiPositionEmployees.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                {multiPositionEmployees.length} multi-position
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FTEValidationAlert overAllocatedEmployees={overAllocatedEmployees} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filteredSummaries.length})</TabsTrigger>
            <TabsTrigger value="multi">Multi-Position ({multiPositionEmployees.length})</TabsTrigger>
            <TabsTrigger value="over">Over-Allocated ({overAllocatedEmployees.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <EmployeeList employees={filteredSummaries} />
          </TabsContent>

          <TabsContent value="multi" className="mt-4">
            <EmployeeList employees={multiPositionEmployees} />
          </TabsContent>

          <TabsContent value="over" className="mt-4">
            <EmployeeList employees={overAllocatedEmployees} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function EmployeeList({ employees }: { employees: Array<{
  employee_id: string;
  full_name: string;
  email: string;
  total_fte_percentage: number;
  active_seat_count: number;
  fte_status: FTEStatus;
  assignment_types: AssignmentType[] | null;
}> }) {
  if (employees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No employees found.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {employees.map((emp) => {
        const config = FTE_STATUS_CONFIG[emp.fte_status];
        const isOverAllocated = emp.fte_status === 'OVER_ALLOCATED';
        const isMultiPosition = emp.active_seat_count > 1;

        return (
          <div 
            key={emp.employee_id}
            className={cn(
              "p-3 rounded-lg border hover:bg-muted/50 transition-colors",
              isOverAllocated && "border-destructive/50 bg-destructive/5"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {emp.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{emp.full_name}</p>
                  <p className="text-xs text-muted-foreground">{emp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOverAllocated && <AlertTriangle className="h-4 w-4 text-destructive" />}
                {emp.fte_status === 'FULLY_ALLOCATED' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {emp.fte_status === 'PARTIALLY_ALLOCATED' && <Clock className="h-4 w-4 text-amber-500" />}
                <Badge className={cn("text-xs", config?.bgColor, config?.color)}>
                  {emp.total_fte_percentage}% FTE
                </Badge>
              </div>
            </div>

            <div className="mb-2">
              <Progress 
                value={Math.min(emp.total_fte_percentage, 100)} 
                className={cn("h-1.5", isOverAllocated && "[&>div]:bg-destructive")}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isMultiPosition && (
                  <Badge variant="outline" className="text-xs">
                    {emp.active_seat_count} positions
                  </Badge>
                )}
                {emp.assignment_types?.map((type) => {
                  const typeConfig = ASSIGNMENT_TYPE_CONFIG[type];
                  return (
                    <span key={type} className={cn("text-xs", typeConfig?.color)}>
                      {typeConfig?.label}
                    </span>
                  );
                })}
              </div>
              <span className={cn("text-xs font-medium", config?.color)}>
                {config?.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}