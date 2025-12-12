import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Search,
  UserPlus,
  X,
  Users,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Nomination {
  id: string;
  nominated_peer_id: string;
  status: string;
  nominee?: {
    full_name: string;
    email: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface PeerNominationManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  cycleId: string;
  cycleName: string;
  companyId: string;
  minPeers: number;
  maxPeers: number;
  deadline: string | null;
}

export function PeerNominationManager({
  open,
  onOpenChange,
  participantId,
  cycleId,
  cycleName,
  companyId,
  minPeers,
  maxPeers,
  deadline,
}: PeerNominationManagerProps) {
  const { user } = useAuth();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [nominationReason, setNominationReason] = useState("");

  useEffect(() => {
    if (open && participantId) {
      fetchData();
    }
  }, [open, participantId]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchNominations(), fetchEmployees()]);
    setLoading(false);
  };

  const fetchNominations = async () => {
    const { data, error } = await supabase
      .from("peer_nominations")
      .select("id, nominated_peer_id, status")
      .eq("review_participant_id", participantId);

    if (error) {
      console.error("Error fetching nominations:", error);
      return;
    }

    // Fetch nominee details
    const nominationsWithDetails = await Promise.all(
      (data || []).map(async (n) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", n.nominated_peer_id)
          .single();
        return { ...n, nominee: profile };
      })
    );

    setNominations(nominationsWithDetails);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("company_id", companyId)
      .neq("id", user?.id) // Exclude self
      .order("full_name");

    if (error) {
      console.error("Error fetching employees:", error);
      return;
    }

    setEmployees(data || []);
  };

  const handleNominate = async (employeeId: string) => {
    if (nominations.length >= maxPeers) {
      toast.error(`Maximum ${maxPeers} peer nominations allowed`);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("peer_nominations").insert([
        {
          review_participant_id: participantId,
          nominated_by: user?.id || "",
          nominated_peer_id: employeeId,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast.success("Peer nominated successfully");
      setShowSearch(false);
      fetchNominations();
    } catch (error) {
      console.error("Error nominating peer:", error);
      toast.error("Failed to nominate peer");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveNomination = async (nominationId: string) => {
    try {
      const { error } = await supabase
        .from("peer_nominations")
        .delete()
        .eq("id", nominationId);

      if (error) throw error;

      toast.success("Nomination removed");
      fetchNominations();
    } catch (error) {
      console.error("Error removing nomination:", error);
      toast.error("Failed to remove nomination");
    }
  };

  const handleSubmitNominations = async () => {
    if (nominations.length < minPeers) {
      toast.error(`Minimum ${minPeers} peer nominations required`);
      return;
    }

    toast.success("Peer nominations submitted");
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const nominatedIds = new Set(nominations.map((n) => n.nominated_peer_id));
  const filteredEmployees = employees.filter(
    (e) =>
      !nominatedIds.has(e.id) &&
      (e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;
  const nominationsComplete = nominations.length >= minPeers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nominate Peer Reviewers
          </DialogTitle>
          <DialogDescription>{cycleName}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Status Card */}
          <Card className={nominationsComplete ? "border-success/50" : "border-warning/50"}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {nominationsComplete ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                  <div>
                    <p className="font-medium">
                      {nominations.length} of {minPeers}-{maxPeers} peers nominated
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {nominationsComplete
                        ? "You've met the minimum requirement"
                        : `Need at least ${minPeers - nominations.length} more`}
                    </p>
                  </div>
                </div>
                {deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className={isDeadlinePassed ? "text-destructive" : ""}>
                      {isDeadlinePassed ? "Deadline passed" : `Due: ${new Date(deadline).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Nomination */}
          {!isDeadlinePassed && nominations.length < maxPeers && (
            <div>
              {showSearch ? (
                <Card className="border-primary/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search colleagues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>

                    <ScrollArea className="h-48 border rounded-md">
                      <div className="p-2 space-y-1">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                            onClick={() => handleNominate(employee.id)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(employee.full_name || "")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{employee.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {employee.email}
                              </p>
                            </div>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                        {filteredEmployees.length === 0 && (
                          <p className="text-center py-4 text-sm text-muted-foreground">
                            No colleagues found
                          </p>
                        )}
                      </div>
                    </ScrollArea>

                    <Textarea
                      placeholder="Why are you nominating this peer? (optional)"
                      value={nominationReason}
                      onChange={(e) => setNominationReason(e.target.value)}
                      rows={2}
                    />

                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setShowSearch(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSearch(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Peer Reviewer
                </Button>
              )}
            </div>
          )}

          {/* Current Nominations */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : nominations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No peers nominated yet</p>
                <p className="text-sm">Search for colleagues to nominate as reviewers</p>
              </div>
            ) : (
              <div className="space-y-2">
                {nominations.map((nomination) => (
                  <Card key={nomination.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getInitials(nomination.nominee?.full_name || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{nomination.nominee?.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {nomination.nominee?.email}
                          </p>
                        </div>
                        <Badge className={statusColors[nomination.status]}>
                          {nomination.status}
                        </Badge>
                        {!isDeadlinePassed && nomination.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveNomination(nomination.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Submit Button */}
          {!isDeadlinePassed && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Save & Close
              </Button>
              <Button
                onClick={handleSubmitNominations}
                disabled={!nominationsComplete || saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Nominations
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
