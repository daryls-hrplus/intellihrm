import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Activity,
  Bell,
  CheckCircle,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Send,
  Users,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResponseMonitoringDashboardProps {
  companyId: string;
  cycles: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

interface ParticipantProgress {
  id: string;
  employee_id: string;
  employee_name: string;
  self_completed: boolean;
  manager_completed: boolean;
  peer_completed: number;
  peer_expected: number;
  dr_completed: number;
  dr_expected: number;
  total_completed: number;
  total_expected: number;
  completion_percent: number;
}

export function ResponseMonitoringDashboard({ companyId, cycles }: ResponseMonitoringDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    cycles.find(c => c.status === "active" || c.status === "in_progress")?.id || cycles[0]?.id || ""
  );
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

  const activeCycles = cycles.filter(c => c.status === "active" || c.status === "in_progress");

  // Fetch participant progress for selected cycle
  const { data: progressData, isLoading, refetch } = useQuery({
    queryKey: ['response-monitoring', selectedCycleId],
    queryFn: async () => {
      if (!selectedCycleId) return [];

      // Get all participants for this cycle
      const { data: participants, error: partError } = await supabase
        .from("review_participants")
        .select("id, employee_id")
        .eq("review_cycle_id", selectedCycleId);

      if (partError) throw partError;
      if (!participants?.length) return [];

      // Get employee names
      const employeeIds = participants.map(p => p.employee_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", employeeIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Get all feedback submissions for these participants
      const participantIds = participants.map(p => p.id);
      const { data: submissions } = await supabase
        .from("feedback_submissions")
        .select("id, review_participant_id, reviewer_type, status")
        .in("review_participant_id", participantIds);

      // Calculate progress per participant
      return participants.map(p => {
        const subs = (submissions || []).filter(s => s.review_participant_id === p.id);
        
        const selfSub = subs.find(s => s.reviewer_type === "self");
        const managerSub = subs.find(s => s.reviewer_type === "manager");
        const peerSubs = subs.filter(s => s.reviewer_type === "peer");
        const drSubs = subs.filter(s => s.reviewer_type === "direct_report");

        const totalCompleted = subs.filter(s => s.status === "submitted").length;
        const totalExpected = subs.length;

        return {
          id: p.id,
          employee_id: p.employee_id,
          employee_name: profileMap.get(p.employee_id) || "Unknown",
          self_completed: selfSub?.status === "submitted",
          manager_completed: managerSub?.status === "submitted",
          peer_completed: peerSubs.filter(s => s.status === "submitted").length,
          peer_expected: peerSubs.length,
          dr_completed: drSubs.filter(s => s.status === "submitted").length,
          dr_expected: drSubs.length,
          total_completed: totalCompleted,
          total_expected: totalExpected,
          completion_percent: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0,
        } as ParticipantProgress;
      });
    },
    enabled: !!selectedCycleId,
  });

  // Overall stats
  const stats = useMemo(() => {
    if (!progressData?.length) return { total: 0, completed: 0, percent: 0 };
    
    const total = progressData.reduce((sum, p) => sum + p.total_expected, 0);
    const completed = progressData.reduce((sum, p) => sum + p.total_completed, 0);
    
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [progressData]);

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (participantIds: string[]) => {
      // In a real implementation, this would call an edge function to send emails
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 500));
      return participantIds.length;
    },
    onSuccess: (count) => {
      toast.success(`Reminder sent to ${count} participant${count > 1 ? 's' : ''}`);
      setSelectedParticipants(new Set());
    },
    onError: () => {
      toast.error("Failed to send reminders");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && progressData) {
      const incomplete = progressData.filter(p => p.completion_percent < 100);
      setSelectedParticipants(new Set(incomplete.map(p => p.id)));
    } else {
      setSelectedParticipants(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedParticipants);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedParticipants(newSet);
  };

  const handleSendReminders = () => {
    if (selectedParticipants.size === 0) return;
    sendReminderMutation.mutate(Array.from(selectedParticipants));
  };

  const incompleteCount = progressData?.filter(p => p.completion_percent < 100).length || 0;

  return (
    <div className="space-y-6">
      {/* Header with Cycle Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Response Monitoring</CardTitle>
                <CardDescription>
                  Track completion and send reminders to pending reviewers
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Cycle" />
                </SelectTrigger>
                <SelectContent>
                  {activeCycles.length > 0 ? (
                    activeCycles.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  ) : (
                    cycles.slice(0, 5).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Progress */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Completion</p>
                <p className="text-2xl font-bold">{stats.percent}%</p>
              </div>
              <Progress value={stats.percent} className="w-24 h-3" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reviews Submitted</p>
                <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Participants</p>
                <p className="text-2xl font-bold">{incompleteCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedParticipants.size > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {selectedParticipants.size} participant{selectedParticipants.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedParticipants(new Set())}
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendReminders}
                  disabled={sendReminderMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendReminderMutation.isPending ? "Sending..." : "Send Reminders"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading progress data...
            </div>
          ) : !progressData?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No participants in this cycle</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={incompleteCount > 0 && selectedParticipants.size === incompleteCount}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Self</TableHead>
                  <TableHead className="text-center">Manager</TableHead>
                  <TableHead className="text-center">Peers</TableHead>
                  <TableHead className="text-center">Direct Reports</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressData.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      {participant.completion_percent < 100 && (
                        <Checkbox
                          checked={selectedParticipants.has(participant.id)}
                          onCheckedChange={(checked) => handleSelectOne(participant.id, !!checked)}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {participant.employee_name}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.self_completed ? (
                        <CheckCircle className="h-4 w-4 text-success mx-auto" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.manager_completed ? (
                        <CheckCircle className="h-4 w-4 text-success mx-auto" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={participant.peer_completed === participant.peer_expected ? "text-success" : ""}>
                        {participant.peer_completed}/{participant.peer_expected}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={participant.dr_completed === participant.dr_expected ? "text-success" : ""}>
                        {participant.dr_completed}/{participant.dr_expected}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={participant.completion_percent} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground w-8">
                          {participant.completion_percent}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {participant.completion_percent < 100 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => sendReminderMutation.mutate([participant.id])}
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
