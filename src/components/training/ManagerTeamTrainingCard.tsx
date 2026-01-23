import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, AlertTriangle, Award, BookOpen, 
  TrendingUp, Clock, ChevronRight, Calendar
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ManagerTeamTrainingCardProps {
  managerId: string;
  companyId: string;
}

interface TeamMember {
  id: string;
  full_name: string;
}

interface EnrollmentSummary {
  employeeId: string;
  employeeName: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}

interface ExpiringCertification {
  id: string;
  employeeId: string;
  employeeName: string;
  certName: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface OverdueTraining {
  id: string;
  employeeId: string;
  employeeName: string;
  courseName: string;
  dueDate: string;
  daysOverdue: number;
}

export function ManagerTeamTrainingCard({ managerId, companyId }: ManagerTeamTrainingCardProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [enrollmentSummaries, setEnrollmentSummaries] = useState<EnrollmentSummary[]>([]);
  const [expiringCerts, setExpiringCerts] = useState<ExpiringCertification[]>([]);
  const [overdueTraining, setOverdueTraining] = useState<OverdueTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (managerId && companyId) {
      loadData();
    }
  }, [managerId, companyId]);

  const loadData = async () => {
    setLoading(true);
    
    // Get team members (direct reports)
    // Cast supabase to any to avoid deep type instantiation with complex schemas
    const client = supabase as any;
    const teamResult = await client
      .from('profiles')
      .select('id, full_name')
      .eq('manager_id', managerId)
      .eq('is_active', true);
    
    const team = (teamResult.data || []) as TeamMember[];
    
    if (team.length === 0) {
      setLoading(false);
      return;
    }
    
    setTeamMembers(team);
    const teamIds = team.map(t => t.id);
    
    // Get enrollments for team
    const enrollmentsResult = await client
      .from('lms_enrollments')
      .select(`
        id, user_id, status, due_date,
        course:lms_courses(title, is_mandatory)
      `)
      .in('user_id', teamIds);
    
    const enrollments = (enrollmentsResult.data || []) as any[];
    
    // Get expiring certifications (next 60 days)
    const today = new Date();
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    
    const certsResult = await client
      .from('employee_recertifications')
      .select(`
        id, employee_id, expiry_date,
        requirement:recertification_requirements(name),
        employee:profiles!employee_recertifications_employee_id_fkey(full_name)
      `)
      .in('employee_id', teamIds)
      .eq('status', 'active')
      .gte('expiry_date', today.toISOString().split('T')[0])
      .lte('expiry_date', sixtyDaysFromNow.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });
    
    const certs = (certsResult.data || []) as any[];
    
    // Process enrollment summaries
    const summaries: EnrollmentSummary[] = team.map(member => {
      const memberEnrollments = (enrollments || []).filter(e => e.user_id === member.id);
      const completed = memberEnrollments.filter(e => e.status === 'completed').length;
      const inProgress = memberEnrollments.filter(e => e.status === 'in_progress').length;
      const overdue = memberEnrollments.filter(e => {
        if (!e.due_date || e.status === 'completed') return false;
        return new Date(e.due_date) < today;
      }).length;
      
      return {
        employeeId: member.id,
        employeeName: member.full_name,
        totalAssigned: memberEnrollments.length,
        completed,
        inProgress,
        overdue,
        completionRate: memberEnrollments.length > 0 
          ? Math.round((completed / memberEnrollments.length) * 100) 
          : 0
      };
    });
    
    setEnrollmentSummaries(summaries);
    
    // Process expiring certs
    const expiring: ExpiringCertification[] = (certs || []).map(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: cert.id,
        employeeId: cert.employee_id,
        employeeName: (cert.employee as any)?.full_name || 'Unknown',
        certName: (cert.requirement as any)?.name || 'Certification',
        expiryDate: cert.expiry_date,
        daysUntilExpiry: daysUntil
      };
    });
    
    setExpiringCerts(expiring);
    
    // Process overdue training
    const overdue: OverdueTraining[] = (enrollments || [])
      .filter(e => {
        if (!e.due_date || e.status === 'completed') return false;
        return new Date(e.due_date) < today;
      })
      .map(e => {
        const member = team.find(t => t.id === e.user_id);
        const dueDate = new Date(e.due_date!);
        const daysOver = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: e.id,
          employeeId: e.user_id,
          employeeName: member?.full_name || 'Unknown',
          courseName: (e.course as any)?.title || 'Unknown Course',
          dueDate: e.due_date!,
          daysOverdue: daysOver
        };
      });
    
    setOverdueTraining(overdue);
    setLoading(false);
  };

  // Calculate overall stats
  const totalTeamMembers = teamMembers.length;
  const avgCompletionRate = enrollmentSummaries.length > 0
    ? Math.round(enrollmentSummaries.reduce((sum, s) => sum + s.completionRate, 0) / enrollmentSummaries.length)
    : 0;
  const totalOverdue = enrollmentSummaries.reduce((sum, s) => sum + s.overdue, 0);
  const totalExpiring = expiringCerts.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading team training data...</div>
        </CardContent>
      </Card>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">No direct reports found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Training Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Size</span>
            </div>
            <p className="text-2xl font-bold">{totalTeamMembers}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. Completion</span>
            </div>
            <p className="text-2xl font-bold">{avgCompletionRate}%</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{totalOverdue}</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Certs Expiring</span>
            </div>
            <p className="text-2xl font-bold text-warning">{totalExpiring}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Team Overview</TabsTrigger>
            <TabsTrigger value="overdue" className="flex-1">
              Overdue Training
              {totalOverdue > 0 && <Badge variant="destructive" className="ml-2">{totalOverdue}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="expiring" className="flex-1">
              Expiring Certs
              {totalExpiring > 0 && <Badge variant="outline" className="ml-2">{totalExpiring}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">In Progress</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentSummaries.map(summary => (
                  <TableRow key={summary.employeeId}>
                    <TableCell className="font-medium">{summary.employeeName}</TableCell>
                    <TableCell className="text-center">{summary.totalAssigned}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{summary.completed}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{summary.inProgress}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {summary.overdue > 0 ? (
                        <Badge variant="destructive">{summary.overdue}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={summary.completionRate} className="h-2 w-20" />
                        <span className="text-sm text-muted-foreground">{summary.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="overdue" className="mt-4">
            {overdueTraining.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No overdue training! Your team is on track.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueTraining.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeName}</TableCell>
                      <TableCell>{item.courseName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDateForDisplay(item.dueDate, "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.daysOverdue} days</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Send Reminder</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="expiring" className="mt-4">
            {expiringCerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No certifications expiring in the next 60 days.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Until Expiry</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringCerts.map(cert => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.employeeName}</TableCell>
                      <TableCell>{cert.certName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDateForDisplay(cert.expiryDate, "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cert.daysUntilExpiry <= 14 ? "destructive" : "outline"}>
                          {cert.daysUntilExpiry} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Schedule Renewal</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
