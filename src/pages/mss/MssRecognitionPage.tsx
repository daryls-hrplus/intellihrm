import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Award, Star, Trophy, Heart, ThumbsUp, PartyPopper, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Recognition {
  id: string;
  recipient_id: string;
  nominator_id: string;
  award_type: string;
  title: string;
  description: string;
  company_value: string | null;
  points_awarded: number;
  status: string;
  created_at: string;
  recipient?: { full_name: string };
  nominator?: { full_name: string };
}

interface DirectReport {
  employee_id: string;
  employee_name: string;
}

const awardTypes = [
  { value: "manager_recognition", label: "Manager Recognition", icon: Star },
  { value: "spot_bonus", label: "Spot Bonus", icon: Trophy },
  { value: "team_award", label: "Team Award", icon: PartyPopper },
  { value: "milestone", label: "Milestone Achievement", icon: Award },
  { value: "value_champion", label: "Value Champion", icon: Heart },
  { value: "innovation", label: "Innovation Award", icon: Star },
];

export default function MssRecognitionPage() {
  const { user, company } = useAuth();
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [teamRecognitions, setTeamRecognitions] = useState<Recognition[]>([]);
  const [sentRecognitions, setSentRecognitions] = useState<Recognition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient_id: "",
    award_type: "manager_recognition",
    title: "",
    description: "",
    company_value: "",
    points_awarded: 25,
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get direct reports
      const { data: reports } = await supabase.rpc("get_manager_direct_reports", {
        p_manager_id: user?.id,
      });
      setDirectReports(reports || []);

      const reportIds = (reports || []).map((r: DirectReport) => r.employee_id);

      if (reportIds.length > 0) {
        // Fetch recognitions received by team
        const { data: teamRecs } = await supabase
          .from("recognition_awards")
          .select(`
            *,
            nominator:profiles!recognition_awards_nominator_id_fkey(full_name),
            recipient:profiles!recognition_awards_recipient_id_fkey(full_name)
          `)
          .in("recipient_id", reportIds)
          .order("created_at", { ascending: false })
          .limit(50);

        setTeamRecognitions((teamRecs as Recognition[]) || []);
      }

      // Fetch recognitions sent by manager
      const { data: sent } = await supabase
        .from("recognition_awards")
        .select(`
          *,
          recipient:profiles!recognition_awards_recipient_id_fkey(full_name)
        `)
        .eq("nominator_id", user?.id)
        .order("created_at", { ascending: false });

      setSentRecognitions((sent as Recognition[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.recipient_id || !formData.title || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const { error } = await supabase.from("recognition_awards").insert({
        recipient_id: formData.recipient_id,
        nominator_id: user?.id,
        award_type: formData.award_type,
        title: formData.title,
        description: formData.description,
        company_value: formData.company_value || null,
        points_awarded: formData.points_awarded,
        company_id: company?.id,
        status: "approved",
        is_public: true,
      });

      if (error) throw error;

      toast.success("Recognition sent successfully");
      setDialogOpen(false);
      setFormData({
        recipient_id: "",
        award_type: "manager_recognition",
        title: "",
        description: "",
        company_value: "",
        points_awarded: 25,
      });
      fetchData();
    } catch (error) {
      console.error("Error sending recognition:", error);
      toast.error("Failed to send recognition");
    }
  };

  const getAwardIcon = (type: string) => {
    const awardType = awardTypes.find((a) => a.value === type);
    const Icon = awardType?.icon || Award;
    return <Icon className="h-5 w-5" />;
  };

  const totalPointsGiven = sentRecognitions.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Manager Self Service", href: "/mss" },
            { label: "Team Recognition" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Recognition</h1>
            <p className="text-muted-foreground">
              Recognize your direct reports and view team recognitions
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} disabled={directReports.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Recognize Team Member
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{directReports.length}</p>
              <p className="text-sm text-muted-foreground">direct reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Team Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{teamRecognitions.length}</p>
              <p className="text-sm text-muted-foreground">recognitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                You Gave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sentRecognitions.length}</p>
              <p className="text-sm text-muted-foreground">recognitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Points Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalPointsGiven}</p>
              <p className="text-sm text-muted-foreground">total points</p>
            </CardContent>
          </Card>
        </div>

        {directReports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No direct reports found. This page is for managers with team members.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Team Recognitions</h2>
              {teamRecognitions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No recognitions received by team members yet
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {teamRecognitions.slice(0, 10).map((recognition) => (
                    <Card key={recognition.id} className="overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-background p-2">
                            {getAwardIcon(recognition.award_type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{recognition.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              To: {recognition.recipient?.full_name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          From: {recognition.nominator?.full_name}
                        </p>
                        <p className="text-muted-foreground line-clamp-2">{recognition.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="outline" className="capitalize">
                            {recognition.award_type.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(recognition.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recognize Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team Member *</Label>
                <Select
                  value={formData.recipient_id}
                  onValueChange={(value) => setFormData({ ...formData, recipient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {directReports.map((report) => (
                      <SelectItem key={report.employee_id} value={report.employee_id}>
                        {report.employee_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Award Type</Label>
                <Select
                  value={formData.award_type}
                  onValueChange={(value) => setFormData({ ...formData, award_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {awardTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Outstanding Performance!"
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe their achievement..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Points to Award</Label>
                <Input
                  type="number"
                  value={formData.points_awarded}
                  onChange={(e) => setFormData({ ...formData, points_awarded: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Company Value (Optional)</Label>
                <Input
                  value={formData.company_value}
                  onChange={(e) => setFormData({ ...formData, company_value: e.target.value })}
                  placeholder="e.g., Excellence, Innovation"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Send Recognition</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
