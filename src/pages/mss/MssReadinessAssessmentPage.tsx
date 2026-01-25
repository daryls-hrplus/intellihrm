import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useReadinessAssessment, ReadinessAssessmentEvent } from "@/hooks/succession/useReadinessAssessment";
import { ClipboardCheck, Clock, CheckCircle, AlertCircle, User, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { ReadinessAssessmentForm } from "@/components/succession/ReadinessAssessmentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface EnrichedEvent extends ReadinessAssessmentEvent {
  candidate_name?: string;
  candidate_avatar?: string;
  position_title?: string;
}

export default function MssReadinessAssessmentPage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const companyId = profile?.company_id;
  const { navigateToList } = useWorkspaceNavigation();
  const { fetchEvents, loading } = useReadinessAssessment(companyId);
  
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [companyId]);

  const loadEvents = async () => {
    if (!companyId) return;
    
    const rawEvents = await fetchEvents();
    
    // Enrich events with candidate details
    const enrichedEvents: EnrichedEvent[] = await Promise.all(
      rawEvents.map(async (event) => {
        let candidate_name = "Unknown";
        let candidate_avatar = "";
        let position_title = "";
        
        if (event.candidate?.employee_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", event.candidate.employee_id)
            .maybeSingle();
          
          if (profile) {
            candidate_name = profile.full_name || "Unknown";
            candidate_avatar = profile.avatar_url || "";
          }
        }
        
        return {
          ...event,
          candidate_name,
          candidate_avatar,
          position_title,
        };
      })
    );
    
    setEvents(enrichedEvents);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500 text-white"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === "pending") return event.status === "pending" || event.status === "in_progress";
    if (activeTab === "completed") return event.status === "completed";
    return true;
  });

  const handleOpenAssessment = (eventId: string) => {
    setSelectedEventId(eventId);
    setFormDialogOpen(true);
  };

  const handleAssessmentComplete = () => {
    setFormDialogOpen(false);
    setSelectedEventId(null);
    loadEvents();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title"), href: "/mss" },
            { label: "Readiness Assessments" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <ClipboardCheck className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Readiness Assessments
              </h1>
              <p className="text-muted-foreground">
                Complete readiness assessments for succession candidates
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigateToList({
              route: "/mss/succession",
              title: "Team Succession",
              moduleCode: "mss",
            })}
          >
            Back to Succession
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => e.status === "pending" || e.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => e.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => 
                  e.due_date && 
                  new Date(e.due_date) < new Date() && 
                  e.status !== "completed"
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Assessments</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No assessments found</p>
                <p className="text-sm">
                  {activeTab === "pending" 
                    ? "You don't have any pending readiness assessments" 
                    : "No assessments in this category"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={event.candidate_avatar} alt={event.candidate_name} />
                        <AvatarFallback>
                          {event.candidate_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{event.candidate_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{event.form?.name || "Readiness Assessment"}</span>
                          {event.due_date && (
                            <>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>Due {format(new Date(event.due_date), "MMM d, yyyy")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(event.status)}
                      {event.status !== "completed" && (
                        <Button 
                          size="sm"
                          onClick={() => handleOpenAssessment(event.id)}
                        >
                          Complete
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      {event.status === "completed" && event.overall_score !== null && (
                        <div className="text-right">
                          <p className="text-lg font-bold">{Math.round(event.overall_score)}%</p>
                          <p className="text-xs text-muted-foreground">{event.readiness_band}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assessment Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Readiness Assessment</DialogTitle>
          </DialogHeader>
          {selectedEventId && companyId && (
            <ReadinessAssessmentForm
              eventId={selectedEventId}
              companyId={companyId}
              assessorType="manager"
              onComplete={handleAssessmentComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
