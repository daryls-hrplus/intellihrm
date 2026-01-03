import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Download, 
  Eye, 
  FileText,
  Users,
  BarChart3,
  Filter,
  ChevronDown,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AllEmployeeResultsDashboardProps {
  companyId: string;
  cycles: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

interface ParticipantResult {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string | null;
  cycle_id: string;
  cycle_name: string;
  overall_score: number | null;
  status: string;
  results_released_at: string | null;
  completed_reviews: number;
  total_reviews: number;
}

interface DetailedFeedback {
  id: string;
  reviewer_type: string;
  overall_score: number | null;
  submitted_at: string | null;
  responses: Array<{
    question_text: string;
    rating: number | null;
    comment: string | null;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
};

export function AllEmployeeResultsDashboard({ companyId, cycles }: AllEmployeeResultsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCycleId, setSelectedCycleId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantResult | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch all participants with their results
  const { data: participantsData, isLoading } = useQuery({
    queryKey: ['all-employee-results', companyId],
    queryFn: async () => {
      const { data: participants, error: partError } = await supabase
        .from("review_participants")
        .select(`
          id,
          employee_id,
          overall_score,
          status,
          review_cycle_id,
          review_cycles!inner(id, name, status, results_released_at, company_id)
        `)
        .eq("review_cycles.company_id", companyId);

      if (partError) throw partError;

      // Get employee details
      const employeeIds = [...new Set((participants || []).map(p => p.employee_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, department_id, departments(name)")
        .in("id", employeeIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get feedback submission counts
      const participantIds = (participants || []).map(p => p.id);
      const { data: submissions } = await supabase
        .from("feedback_submissions")
        .select("review_participant_id, status")
        .in("review_participant_id", participantIds);

      const submissionCounts = new Map<string, { completed: number; total: number }>();
      (submissions || []).forEach(s => {
        const current = submissionCounts.get(s.review_participant_id) || { completed: 0, total: 0 };
        current.total++;
        if (s.status === 'submitted') current.completed++;
        submissionCounts.set(s.review_participant_id, current);
      });

      return (participants || []).map((p: any) => {
        const profile = profileMap.get(p.employee_id);
        const counts = submissionCounts.get(p.id) || { completed: 0, total: 0 };
        return {
          id: p.id,
          employee_id: p.employee_id,
          employee_name: profile?.full_name || "Unknown",
          department_name: (profile?.departments as any)?.name || null,
          cycle_id: p.review_cycle_id,
          cycle_name: p.review_cycles?.name || "",
          overall_score: p.overall_score,
          status: p.status,
          results_released_at: p.review_cycles?.results_released_at,
          completed_reviews: counts.completed,
          total_reviews: counts.total,
        } as ParticipantResult;
      });
    },
    enabled: !!companyId,
  });

  // Fetch detailed feedback for selected participant
  const { data: detailedFeedback } = useQuery({
    queryKey: ['participant-detailed-feedback', selectedParticipant?.id],
    queryFn: async () => {
      if (!selectedParticipant) return [];

      const { data: submissions, error } = await supabase
        .from("feedback_submissions")
        .select(`
          id,
          reviewer_type,
          overall_score,
          submitted_at,
          status,
          feedback_responses(
            id,
            rating,
            text_response,
            feedback_question:feedback_questions(question_text)
          )
        `)
        .eq("review_participant_id", selectedParticipant.id)
        .eq("status", "submitted");

      if (error) throw error;

      return (submissions || []).map((s: any) => ({
        id: s.id,
        reviewer_type: s.reviewer_type,
        overall_score: s.overall_score,
        submitted_at: s.submitted_at,
        responses: (s.feedback_responses || []).map((r: any) => ({
          question_text: r.feedback_question?.question_text || "",
          rating: r.rating,
          comment: r.text_response,
        })),
      })) as DetailedFeedback[];
    },
    enabled: !!selectedParticipant?.id,
  });

  // Filter participants
  const filteredParticipants = useMemo(() => {
    if (!participantsData) return [];

    return participantsData.filter(p => {
      const matchesSearch = searchQuery === "" || 
        p.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.department_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCycle = selectedCycleId === "all" || p.cycle_id === selectedCycleId;
      const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;

      return matchesSearch && matchesCycle && matchesStatus;
    });
  }, [participantsData, searchQuery, selectedCycleId, selectedStatus]);

  const handleExport = () => {
    const csvData = filteredParticipants.map(p => ({
      Employee: p.employee_name,
      Department: p.department_name || "",
      Cycle: p.cycle_name,
      Score: p.overall_score?.toFixed(1) || "N/A",
      Status: p.status,
      Progress: `${p.completed_reviews}/${p.total_reviews}`,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(","),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `360-results-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getReviewerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      self: "Self Review",
      manager: "Manager",
      peer: "Peer",
      direct_report: "Direct Report",
    };
    return labels[type] || type;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">All Employee 360 Results</CardTitle>
                <CardDescription>
                  View and manage feedback results across all participants
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Cycles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                {cycles.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading results...
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        {participant.employee_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.department_name || "-"}
                      </TableCell>
                      <TableCell>{participant.cycle_name}</TableCell>
                      <TableCell className="text-center">
                        {participant.overall_score ? (
                          <span className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            {participant.overall_score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {participant.completed_reviews}/{participant.total_reviews}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[participant.status] || ""}
                        >
                          {participant.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing {filteredParticipants.length} of {participantsData?.length || 0} participants
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              360 Feedback Results - {selectedParticipant?.employee_name}
            </DialogTitle>
            <DialogDescription>
              {selectedParticipant?.cycle_name} • 
              {selectedParticipant?.overall_score 
                ? ` Overall Score: ${selectedParticipant.overall_score.toFixed(1)}`
                : " Score not yet calculated"
              }
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Detailed Responses</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 mt-4">
                {detailedFeedback && detailedFeedback.length > 0 ? (
                  <div className="space-y-3">
                    {detailedFeedback.map(fb => (
                      <Card key={fb.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{getReviewerTypeLabel(fb.reviewer_type)}</p>
                              {fb.submitted_at && (
                                <p className="text-xs text-muted-foreground">
                                  Submitted {format(new Date(fb.submitted_at), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                            {fb.overall_score && (
                              <div className="flex items-center gap-1 text-lg font-semibold">
                                <Star className="h-5 w-5 text-warning fill-warning" />
                                {fb.overall_score.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No feedback submitted yet
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                {detailedFeedback && detailedFeedback.length > 0 ? (
                  detailedFeedback.map(fb => (
                    <Card key={fb.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {getReviewerTypeLabel(fb.reviewer_type)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {fb.responses.map((response, idx) => (
                          <div key={idx} className="border-b pb-3 last:border-0">
                            <p className="text-sm font-medium mb-1">{response.question_text}</p>
                            <div className="flex items-center gap-4 text-sm">
                              {response.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-warning fill-warning" />
                                  {response.rating}/5
                                </span>
                              )}
                              {response.comment && (
                                <p className="text-muted-foreground italic">
                                  "{response.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No detailed responses available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
