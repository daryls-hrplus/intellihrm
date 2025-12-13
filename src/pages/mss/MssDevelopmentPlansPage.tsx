import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, User, ChevronRight, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DirectReportIDP {
  employee_id: string;
  employee_name: string;
  idp_count: number;
  active_idps: number;
  avg_progress: number;
  idps: {
    id: string;
    title: string;
    status: string;
    progress: number;
  }[];
}

export default function MssDevelopmentPlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<DirectReportIDP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    // Get direct reports
    const { data: directReports } = await supabase.rpc('get_manager_direct_reports', {
      p_manager_id: user?.id
    });

    if (!directReports?.length) {
      setReports([]);
      setLoading(false);
      return;
    }

    // Get IDPs for each direct report
    const reportsWithIdps = await Promise.all(
      directReports.map(async (dr: any) => {
        const { data: idps } = await (supabase.from('individual_development_plans') as any)
          .select('*')
          .eq('employee_id', dr.employee_id)
          .order('created_at', { ascending: false });

        // Calculate progress for each IDP
        const idpsWithProgress = await Promise.all((idps || []).map(async (idp: any) => {
          const { data: goals } = await (supabase.from('idp_goals') as any)
            .select('progress_percentage')
            .eq('idp_id', idp.id);
          
          const progress = goals?.length 
            ? Math.round(goals.reduce((sum: number, g: any) => sum + g.progress_percentage, 0) / goals.length)
            : 0;

          return {
            id: idp.id,
            title: idp.title,
            status: idp.status,
            progress
          };
        }));

        const activeIdps = idpsWithProgress.filter((i: any) => i.status === 'active');
        const avgProgress = idpsWithProgress.length
          ? Math.round(idpsWithProgress.reduce((sum: number, i: any) => sum + i.progress, 0) / idpsWithProgress.length)
          : 0;

        return {
          employee_id: dr.employee_id,
          employee_name: dr.employee_name,
          idp_count: idpsWithProgress.length,
          active_idps: activeIdps.length,
          avg_progress: avgProgress,
          idps: idpsWithProgress
        };
      })
    );

    setReports(reportsWithIdps);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-destructive/20 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  // Summary stats
  const totalIdps = reports.reduce((sum, r) => sum + r.idp_count, 0);
  const activeIdps = reports.reduce((sum, r) => sum + r.active_idps, 0);
  const avgProgress = reports.length
    ? Math.round(reports.reduce((sum, r) => sum + r.avg_progress, 0) / reports.length)
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-8">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Team Development Plans</h1>
            <p className="text-muted-foreground">View and track your direct reports' development progress</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{reports.length}</div>
              <div className="text-sm text-muted-foreground">Direct Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{totalIdps}</div>
              <div className="text-sm text-muted-foreground">Total IDPs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{activeIdps}</div>
              <div className="text-sm text-muted-foreground">Active IDPs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{avgProgress}%</div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </CardContent>
          </Card>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Direct Reports</h3>
              <p className="text-muted-foreground">You don't have any direct reports assigned.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Direct Reports Development Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center">IDPs</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead>Avg Progress</TableHead>
                    <TableHead>Current Plans</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report.employee_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {report.employee_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{report.idp_count}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{report.active_idps}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={report.avg_progress} className="h-2 flex-1" />
                          <span className="text-sm">{report.avg_progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {report.idps.slice(0, 3).map(idp => (
                            <Badge key={idp.id} className={getStatusColor(idp.status)} title={idp.title}>
                              {idp.title.substring(0, 15)}{idp.title.length > 15 ? '...' : ''}
                            </Badge>
                          ))}
                          {report.idps.length > 3 && (
                            <Badge variant="outline">+{report.idps.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
