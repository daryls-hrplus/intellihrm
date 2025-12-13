import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, List, Loader2, Plus, Clock } from "lucide-react";
import { useAppraisalInterviews, AppraisalInterview } from "@/hooks/useAppraisalInterviews";
import { AppraisalInterviewCard } from "./AppraisalInterviewCard";
import { AppraisalInterviewCalendar } from "./AppraisalInterviewCalendar";
import { ScheduleInterviewDialog } from "./ScheduleInterviewDialog";
import { supabase } from "@/integrations/supabase/client";

interface AppraisalInterviewsListProps {
  userId: string;
  userRole: "employee" | "manager";
  cycleId?: string;
}

export function AppraisalInterviewsList({
  userId,
  userRole,
  cycleId,
}: AppraisalInterviewsListProps) {
  const {
    loading,
    interviews,
    fetchMyInterviews,
    confirmInterview,
    cancelInterview,
    completeInterview,
  } = useAppraisalInterviews();

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<AppraisalInterview | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");

  useEffect(() => {
    fetchMyInterviews(userId, userRole);
    if (userRole === "manager") {
      fetchParticipants();
    }
  }, [userId, userRole, fetchMyInterviews]);

  const fetchParticipants = async () => {
    // Fetch participants where user is the evaluator
    const { data } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee:profiles!appraisal_participants_employee_id_fkey(id, full_name),
        cycle:appraisal_cycles(id, name)
      `)
      .eq("evaluator_id", userId);

    setParticipants(data || []);
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (statusFilter !== "all" && interview.status !== statusFilter) {
      return false;
    }
    if (cycleId && interview.participant?.cycle_id !== cycleId) {
      return false;
    }
    if (selectedDate && !isSameDay(new Date(interview.scheduled_at), selectedDate)) {
      return false;
    }
    return true;
  });

  const upcomingInterviews = filteredInterviews.filter(
    (i) => new Date(i.scheduled_at) >= new Date() && i.status !== "cancelled" && i.status !== "completed"
  );
  const pastInterviews = filteredInterviews.filter(
    (i) => new Date(i.scheduled_at) < new Date() || i.status === "completed"
  );

  const handleConfirm = async (interview: AppraisalInterview) => {
    await confirmInterview(interview.id);
    fetchMyInterviews(userId, userRole);
  };

  const handleCancel = async () => {
    if (selectedInterview) {
      await cancelInterview(selectedInterview.id, cancellationReason);
      setCancelDialogOpen(false);
      setCancellationReason("");
      setSelectedInterview(null);
      fetchMyInterviews(userId, userRole);
    }
  };

  const handleComplete = async () => {
    if (selectedInterview) {
      await completeInterview(selectedInterview.id, outcomeSummary);
      setCompleteDialogOpen(false);
      setOutcomeSummary("");
      setSelectedInterview(null);
      fetchMyInterviews(userId, userRole);
    }
  };

  const openScheduleDialog = (participantId?: string) => {
    if (participantId) {
      setSelectedParticipantId(participantId);
    }
    setScheduleDialogOpen(true);
  };

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {userRole === "employee" ? "My Appraisal Interviews" : "Team Appraisal Interviews"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {userRole === "employee"
              ? "View and manage your scheduled appraisal interviews"
              : "Schedule and manage appraisal interviews with your direct reports"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userRole === "manager" && (
            <Button onClick={() => openScheduleDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          )}
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
          {selectedDate && (
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
              Clear Date Filter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "calendar" ? (
        <AppraisalInterviewCalendar
          interviews={filteredInterviews}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onSelectInterview={(interview) => {
            setSelectedInterview(interview);
          }}
        />
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastInterviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No upcoming interviews scheduled
                  </p>
                  {userRole === "manager" && (
                    <Button className="mt-4" onClick={() => openScheduleDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingInterviews.map((interview) => (
                  <AppraisalInterviewCard
                    key={interview.id}
                    interview={interview}
                    userRole={userRole}
                    onConfirm={() => handleConfirm(interview)}
                    onCancel={() => {
                      setSelectedInterview(interview);
                      setCancelDialogOpen(true);
                    }}
                    onReschedule={() => {
                      setSelectedInterview(interview);
                      setScheduleDialogOpen(true);
                    }}
                    onComplete={() => {
                      setSelectedInterview(interview);
                      setCompleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastInterviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No past interviews</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pastInterviews.map((interview) => (
                  <AppraisalInterviewCard
                    key={interview.id}
                    interview={interview}
                    userRole={userRole}
                    onComplete={() => {
                      setSelectedInterview(interview);
                      setCompleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Schedule Interview Dialog */}
      {userRole === "manager" && (
        <>
          {/* Participant Selection Dialog */}
          <Dialog open={scheduleDialogOpen && !selectedParticipantId} onOpenChange={(open) => {
            if (!open) {
              setScheduleDialogOpen(false);
              setSelectedParticipantId("");
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Employee</DialogTitle>
                <DialogDescription>
                  Choose an employee to schedule an appraisal interview with
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {participants.map((participant) => (
                  <Button
                    key={participant.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSelectedParticipantId(participant.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{participant.employee?.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {participant.cycle?.name}
                      </div>
                    </div>
                  </Button>
                ))}
                {participants.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No participants assigned to you
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Actual Schedule Dialog */}
          {selectedParticipantId && (
            <ScheduleInterviewDialog
              open={scheduleDialogOpen && !!selectedParticipantId}
              onOpenChange={(open) => {
                if (!open) {
                  setScheduleDialogOpen(false);
                  setSelectedParticipantId("");
                  setSelectedInterview(null);
                }
              }}
              participantId={selectedParticipantId}
              participantName={selectedParticipant?.employee?.full_name || ""}
              cycleName={selectedParticipant?.cycle?.name || ""}
              existingInterview={selectedInterview}
              onSuccess={() => fetchMyInterviews(userId, userRole)}
            />
          )}
        </>
      )}

      {/* Reschedule Dialog for existing interviews */}
      {selectedInterview && userRole === "manager" && (
        <ScheduleInterviewDialog
          open={scheduleDialogOpen && !!selectedInterview && !selectedParticipantId}
          onOpenChange={(open) => {
            if (!open) {
              setScheduleDialogOpen(false);
              setSelectedInterview(null);
            }
          }}
          participantId={selectedInterview.participant_id}
          participantName={selectedInterview.participant?.employee?.full_name || ""}
          cycleName={selectedInterview.participant?.cycle?.name || ""}
          existingInterview={selectedInterview}
          onSuccess={() => fetchMyInterviews(userId, userRole)}
        />
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for cancellation (optional)</Label>
              <Textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Interview
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Interview</DialogTitle>
            <DialogDescription>
              Mark this interview as completed and add any outcome notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Outcome Summary (optional)</Label>
              <Textarea
                value={outcomeSummary}
                onChange={(e) => setOutcomeSummary(e.target.value)}
                placeholder="Key discussion points, agreements, action items..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete}>
              Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
