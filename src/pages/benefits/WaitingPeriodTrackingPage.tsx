import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WaitingPeriodTrackingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [waitingPeriods, setWaitingPeriods] = useState<any[]>([]);
  const [stats, setStats] = useState({ waiting: 0, eligible: 0, enrolled: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchWaitingPeriods();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchWaitingPeriods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("benefit_waiting_periods")
        .select(`
          *,
          employee:profiles(full_name, email, company_id),
          plan:benefit_plans(name, code, waiting_period_days)
        `)
        .order("eligibility_date", { ascending: true });

      if (error) throw error;

      // Filter by company
      const filtered = (data || []).filter((wp: any) => wp.employee?.company_id === selectedCompany);
      
      // Calculate days remaining and progress
      const today = new Date();
      const enriched = filtered.map((wp: any) => {
        const eligibilityDate = new Date(wp.eligibility_date);
        const hireDate = new Date(wp.hire_date);
        const totalDays = wp.waiting_period_days;
        const daysPassed = Math.ceil((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, Math.ceil((eligibilityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        const progress = totalDays > 0 ? Math.min(100, (daysPassed / totalDays) * 100) : 100;
        const isEligible = daysRemaining <= 0;

        return {
          ...wp,
          daysRemaining,
          progress,
          isEligible
        };
      });

      setWaitingPeriods(enriched);

      // Calculate stats
      const waiting = enriched.filter((wp: any) => wp.enrollment_status === "waiting" && !wp.isEligible).length;
      const eligible = enriched.filter((wp: any) => wp.isEligible && wp.enrollment_status === "waiting").length;
      const enrolled = enriched.filter((wp: any) => wp.enrollment_status === "enrolled").length;
      setStats({ waiting, eligible, enrolled });

    } catch (error) {
      console.error("Error fetching waiting periods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string, isEligible: boolean) => {
    if (status === "enrolled") return "default";
    if (isEligible) return "outline";
    return "secondary";
  };

  const getStatusLabel = (status: string, isEligible: boolean) => {
    if (status === "enrolled") return "Enrolled";
    if (isEligible) return "Eligible";
    return "Waiting";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Waiting Period Tracking" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Waiting Period Tracking</h1>
            <p className="text-muted-foreground">Monitor employee benefit eligibility timelines</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Waiting Period</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waiting}</div>
              <p className="text-xs text-muted-foreground">Employees still waiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Now Eligible</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.eligible}</div>
              <p className="text-xs text-muted-foreground">Ready to enroll</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.enrolled}</div>
              <p className="text-xs text-muted-foreground">Completed enrollment</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Waiting Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Benefit Plan</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Eligibility Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingPeriods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No waiting periods tracked
                    </TableCell>
                  </TableRow>
                ) : (
                  waitingPeriods.map((wp) => (
                    <TableRow key={wp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wp.employee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{wp.employee?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wp.plan?.name}</p>
                          <p className="text-sm text-muted-foreground">{wp.waiting_period_days} day waiting period</p>
                        </div>
                      </TableCell>
                      <TableCell>{wp.hire_date}</TableCell>
                      <TableCell>{wp.eligibility_date}</TableCell>
                      <TableCell className="w-[150px]">
                        <div className="space-y-1">
                          <Progress value={wp.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{Math.round(wp.progress)}% complete</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {wp.isEligible ? (
                          <span className="text-green-600 font-medium">Eligible now</span>
                        ) : (
                          <span>{wp.daysRemaining} days</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(wp.enrollment_status, wp.isEligible)}>
                          {getStatusLabel(wp.enrollment_status, wp.isEligible)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
