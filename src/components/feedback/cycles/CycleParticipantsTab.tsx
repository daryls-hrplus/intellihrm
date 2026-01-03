import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Search,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Participant {
  id: string;
  employee_id: string;
  employee_name: string;
  status: string;
  self_review_completed: boolean;
  peer_reviews_completed: number;
  peer_reviews_required: number;
}

interface CycleParticipantsTabProps {
  cycleId: string;
  onOpenFullManager: () => void;
}

export function CycleParticipantsTab({ cycleId, onOpenFullManager }: CycleParticipantsTabProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchParticipants();
  }, [cycleId]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("review_participants")
        .select("id, employee_id, status, self_review_completed")
        .eq("review_cycle_id", cycleId);

      if (error) throw error;

      // Fetch employee names and peer review counts
      const participantsWithNames: Participant[] = [];
      
      for (const p of data || []) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", p.employee_id)
          .single();

        // Count peer reviews
        const { count: completedPeerReviews } = await supabase
          .from("feedback_submissions")
          .select("*", { count: "exact", head: true })
          .eq("review_participant_id", p.id)
          .eq("reviewer_type", "peer")
          .eq("status", "completed");

        const { count: totalPeerReviews } = await supabase
          .from("feedback_submissions")
          .select("*", { count: "exact", head: true })
          .eq("review_participant_id", p.id)
          .eq("reviewer_type", "peer");

        participantsWithNames.push({
          id: p.id,
          employee_id: p.employee_id,
          employee_name: profile?.full_name || "Unknown",
          status: p.status,
          self_review_completed: p.self_review_completed || false,
          peer_reviews_completed: completedPeerReviews || 0,
          peer_reviews_required: totalPeerReviews || 0,
        });
      }

      setParticipants(participantsWithNames);
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (participantId: string, employeeName: string) => {
    toast.success(`Reminder sent to ${employeeName}`);
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.employee_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-info/10 text-info">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const statusCounts = {
    all: participants.length,
    pending: participants.filter((p) => p.status === "pending").length,
    in_progress: participants.filter((p) => p.status === "in_progress").length,
    completed: participants.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
        </div>
        <Button onClick={onOpenFullManager} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Manage Participants
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((filter) => (
          <Button
            key={filter.key}
            variant={statusFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.key)}
          >
            {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
          </Button>
        ))}
      </div>

      {/* Participants List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading participants...</div>
          ) : filteredParticipants.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No participants found</p>
              <Button onClick={onOpenFullManager} className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Participants
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {filteredParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{participant.employee_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {participant.self_review_completed && (
                            <Badge variant="outline" className="text-xs">
                              Self ✓
                            </Badge>
                          )}
                          {participant.peer_reviews_required > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Peers: {participant.peer_reviews_completed}/
                              {participant.peer_reviews_required}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(participant.status)}
                      {participant.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleSendReminder(participant.id, participant.employee_name)
                          }
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
