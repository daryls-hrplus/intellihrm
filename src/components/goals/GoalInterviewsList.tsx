import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import { useGoalInterviews } from "@/hooks/useGoalInterviews";
import { GoalInterviewCard } from "./GoalInterviewCard";
import { ScheduleGoalInterviewDialog } from "./ScheduleGoalInterviewDialog";
import { GoalInterviewCalendar } from "./GoalInterviewCalendar";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalInterviewsListProps {
  userId: string;
  userRole: "employee" | "manager";
}

export function GoalInterviewsList({ userId, userRole }: GoalInterviewsListProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    interviews,
    isLoading,
    createInterview,
    updateInterview,
    confirmInterview,
    cancelInterview,
    completeInterview,
  } = useGoalInterviews(userId, userRole);

  const handleSchedule = (data: any) => {
    if (selectedInterview) {
      updateInterview.mutate({ id: selectedInterview.id, ...data });
    } else {
      createInterview.mutate({ ...data, scheduled_by: userId });
    }
    setSelectedInterview(null);
  };

  const handleReschedule = (interview: any) => {
    setSelectedInterview(interview);
    setShowScheduleDialog(true);
  };

  const filteredInterviews = interviews?.filter((interview) => {
    if (statusFilter === "all") return true;
    return interview.status === statusFilter;
  });

  const upcomingInterviews = filteredInterviews?.filter(
    (i) => new Date(i.scheduled_at) >= new Date() && i.status !== "cancelled"
  );
  const pastInterviews = filteredInterviews?.filter(
    (i) => new Date(i.scheduled_at) < new Date() || i.status === "cancelled"
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goal Review Meetings</h2>
          <p className="text-muted-foreground">
            {userRole === "manager"
              ? "Schedule and manage goal review meetings with your team"
              : "View your scheduled goal review meetings"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          {userRole === "manager" && (
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          )}
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {viewMode === "calendar" ? (
        <GoalInterviewCalendar
          interviews={filteredInterviews || []}
          onSelectInterview={(interview) => {
            if (userRole === "manager") {
              handleReschedule(interview);
            }
          }}
        />
      ) : (
        <div className="space-y-6">
          {upcomingInterviews && upcomingInterviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <GoalInterviewCard
                    key={interview.id}
                    interview={interview}
                    userRole={userRole}
                    onConfirm={() => confirmInterview.mutate(interview.id)}
                    onCancel={(reason) => cancelInterview.mutate({ id: interview.id, reason })}
                    onReschedule={() => handleReschedule(interview)}
                    onComplete={(outcome) =>
                      completeInterview.mutate({ id: interview.id, outcome_summary: outcome })
                    }
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {pastInterviews && pastInterviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Past</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastInterviews.map((interview) => (
                  <GoalInterviewCard
                    key={interview.id}
                    interview={interview}
                    userRole={userRole}
                    onComplete={(outcome) =>
                      completeInterview.mutate({ id: interview.id, outcome_summary: outcome })
                    }
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {(!filteredInterviews || filteredInterviews.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No goal review meetings found
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ScheduleGoalInterviewDialog
        open={showScheduleDialog}
        onOpenChange={(open) => {
          setShowScheduleDialog(open);
          if (!open) setSelectedInterview(null);
        }}
        onSchedule={handleSchedule}
        existingInterview={selectedInterview}
      />
    </div>
  );
}
