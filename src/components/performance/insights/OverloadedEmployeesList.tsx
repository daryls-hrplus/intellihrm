import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, Download, Mail } from "lucide-react";
import { useEmployeeWorkload } from "@/hooks/performance/useEmployeeWorkload";
import { Skeleton } from "@/components/ui/skeleton";

interface OverloadedEmployeesListProps {
  companyId: string | undefined;
  departmentId?: string;
}

export function OverloadedEmployeesList({ companyId, departmentId }: OverloadedEmployeesListProps) {
  const { data: metrics, isLoading } = useEmployeeWorkload(companyId, departmentId);

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  if (!metrics) return null;

  const overloadedEmployees = metrics.employees.filter(
    e => e.status === 'critical' || e.status === 'warning'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Overloaded Employees
            </CardTitle>
            <CardDescription>
              Employees with workload score above 100 or total weighting exceeding 100%
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Notify Managers
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {overloadedEmployees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">No overloaded employees</p>
            <p className="text-sm">All employees have manageable workloads</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>At Risk</TableHead>
                <TableHead>Workload Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overloadedEmployees.map((employee) => (
                <TableRow key={employee.employeeId}>
                  <TableCell className="font-medium">{employee.employeeName}</TableCell>
                  <TableCell>{employee.departmentName}</TableCell>
                  <TableCell>{employee.activeGoalCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={employee.totalWeighting > 100 ? 'text-destructive font-medium' : ''}>
                        {employee.totalWeighting}%
                      </span>
                      <Progress 
                        value={Math.min(100, (employee.totalWeighting / 150) * 100)} 
                        className="w-16 h-2" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.overdueCount > 0 ? (
                      <Badge variant="destructive">{employee.overdueCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.atRiskCount > 0 ? (
                      <Badge variant="secondary">{employee.atRiskCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{employee.workloadScore}</span>
                      <Progress 
                        value={Math.min(100, (employee.workloadScore / 200) * 100)} 
                        className="w-16 h-2" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={employee.status === 'critical' ? 'destructive' : 'secondary'}
                    >
                      {employee.status === 'critical' ? 'Critical' : 'Warning'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Review <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-destructive">{metrics.overloadedCount}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{metrics.warningCount}</p>
            <p className="text-sm text-muted-foreground">Warning</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{metrics.healthyCount}</p>
            <p className="text-sm text-muted-foreground">Healthy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
