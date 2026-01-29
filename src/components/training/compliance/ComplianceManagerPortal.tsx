import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, AlertTriangle, CheckCircle, Clock, ChevronRight, 
  Search, Filter, TrendingUp, TrendingDown, Mail
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

interface ComplianceManagerPortalProps {
  companyId: string;
  managerId: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  total_assignments: number;
  completed: number;
  overdue: number;
  due_soon: number;
  compliance_rate: number;
  assignments: Assignment[];
}

interface Assignment {
  id: string;
  training_name: string;
  due_date: string;
  status: string;
  escalation_level: number;
}

export function ComplianceManagerPortal({ companyId, managerId }: ComplianceManagerPortalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadTeamCompliance();
  }, [companyId, managerId]);

  const loadTeamCompliance = async () => {
    setLoading(true);
    try {
      // Get direct reports
      // @ts-ignore - Supabase type instantiation issue
      const { data: reports } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .eq("reports_to", managerId)
        .eq("company_id", companyId);

      if (!reports || reports.length === 0) {
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      const memberIds = reports.map(r => r.id);

      // Get all assignments for team members
      // @ts-ignore - Supabase type instantiation issue
      const { data: assignments } = await supabase
        .from("compliance_training_assignments")
        .select(`
          id, 
          employee_id, 
          due_date, 
          status, 
          escalation_level,
          compliance:compliance_training(name)
        `)
        .in("employee_id", memberIds);

      // Process into team member cards
      const processed: TeamMember[] = reports.map(member => {
        const memberAssignments = assignments?.filter(a => a.employee_id === member.id) || [];
        const completed = memberAssignments.filter(a => a.status === "completed").length;
        const overdue = memberAssignments.filter(a => {
          if (a.status === "completed") return false;
          return differenceInDays(new Date(a.due_date), new Date()) < 0;
        }).length;
        const dueSoon = memberAssignments.filter(a => {
          if (a.status === "completed") return false;
          const days = differenceInDays(new Date(a.due_date), new Date());
          return days >= 0 && days <= 7;
        }).length;

        return {
          ...member,
          total_assignments: memberAssignments.length,
          completed,
          overdue,
          due_soon: dueSoon,
          compliance_rate: memberAssignments.length > 0 
            ? Math.round((completed / memberAssignments.length) * 100) 
            : 100,
          assignments: memberAssignments.map(a => ({
            id: a.id,
            training_name: a.compliance?.name || "Unknown",
            due_date: a.due_date,
            status: a.status,
            escalation_level: a.escalation_level || 0
          }))
        };
      });

      // Sort by overdue count (highest first)
      processed.sort((a, b) => b.overdue - a.overdue);
      setTeamMembers(processed);
    } catch (error) {
      console.error("Failed to load team compliance:", error);
    }
    setLoading(false);
  };

  const sendReminder = async (memberId: string, memberName: string) => {
    // In production, this would trigger an email notification
    toast.success(`Reminder sent to ${memberName}`);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "overdue") return matchesSearch && member.overdue > 0;
    if (statusFilter === "at_risk") return matchesSearch && (member.overdue > 0 || member.due_soon > 0);
    if (statusFilter === "compliant") return matchesSearch && member.overdue === 0 && member.due_soon === 0;
    
    return matchesSearch;
  });

  const teamStats = {
    totalMembers: teamMembers.length,
    compliantMembers: teamMembers.filter(m => m.overdue === 0 && m.due_soon === 0).length,
    atRiskMembers: teamMembers.filter(m => m.overdue > 0 || m.due_soon > 0).length,
    teamComplianceRate: teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.compliance_rate, 0) / teamMembers.length)
      : 100
  };

  const getStatusColor = (member: TeamMember) => {
    if (member.overdue > 0) return "text-destructive";
    if (member.due_soon > 0) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return <div className="p-4">Loading team compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Compliance Rate</p>
                <p className="text-2xl font-bold">{teamStats.teamComplianceRate}%</p>
              </div>
              {teamStats.teamComplianceRate >= 90 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fully Compliant</p>
                <p className="text-2xl font-bold text-green-600">{teamStats.compliantMembers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-destructive">{teamStats.atRiskMembers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Team Compliance Status</CardTitle>
          <CardDescription>View and manage your team's compliance training progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div key={member.id} className="border rounded-lg">
                  <div 
                    className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedMemberId(
                      expandedMemberId === member.id ? null : member.id
                    )}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{member.full_name}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <Progress 
                          value={member.compliance_rate} 
                          className="h-2 w-32"
                        />
                        <span className={`text-sm font-medium ${getStatusColor(member)}`}>
                          {member.compliance_rate}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-medium">{member.total_assignments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-medium text-green-600">{member.completed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Overdue</p>
                        <p className="font-medium text-destructive">{member.overdue}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Due Soon</p>
                        <p className="font-medium text-yellow-600">{member.due_soon}</p>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendReminder(member.id, member.full_name);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>

                    <ChevronRight 
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedMemberId === member.id ? "rotate-90" : ""
                      }`} 
                    />
                  </div>

                  {/* Expanded Assignment Details */}
                  {expandedMemberId === member.id && member.assignments.length > 0 && (
                    <div className="border-t bg-muted/30 p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Training</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Escalation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {member.assignments.map((assignment) => {
                            const daysUntilDue = differenceInDays(new Date(assignment.due_date), new Date());
                            return (
                              <TableRow key={assignment.id}>
                                <TableCell>{assignment.training_name}</TableCell>
                                <TableCell>{formatDateForDisplay(assignment.due_date, "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                  {assignment.status === "completed" ? (
                                    <Badge variant="default" className="bg-green-600">Completed</Badge>
                                  ) : daysUntilDue < 0 ? (
                                    <Badge variant="destructive">Overdue ({Math.abs(daysUntilDue)} days)</Badge>
                                  ) : daysUntilDue <= 7 ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                      Due in {daysUntilDue} days
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {assignment.escalation_level > 0 ? (
                                    <Badge variant="outline" className="border-destructive text-destructive">
                                      Tier {assignment.escalation_level}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
