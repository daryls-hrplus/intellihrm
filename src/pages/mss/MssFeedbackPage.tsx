import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, ThumbsUp, Lightbulb, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";

interface Feedback {
  id: string;
  from_user_id: string;
  to_user_id: string;
  feedback_type: string;
  subject: string | null;
  content: string;
  is_private: boolean;
  acknowledged_at: string | null;
  created_at: string;
  from_user?: { full_name: string };
  to_user?: { full_name: string };
}

interface DirectReport {
  employee_id: string;
  employee_name: string;
}

export default function MssFeedbackPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [teamFeedback, setTeamFeedback] = useState<Feedback[]>([]);
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("team");
  const [formData, setFormData] = useState({
    to_user_id: "",
    feedback_type: "praise",
    subject: "",
    content: "",
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
        // Fetch feedback received by team members
        const { data: received } = await supabase
          .from("continuous_feedback")
          .select(`
            *,
            from_user:profiles!continuous_feedback_from_user_id_fkey(full_name),
            to_user:profiles!continuous_feedback_to_user_id_fkey(full_name)
          `)
          .in("to_user_id", reportIds)
          .order("created_at", { ascending: false })
          .limit(50);

        setTeamFeedback((received as Feedback[]) || []);
      }

      // Fetch feedback sent by manager
      const { data: sent } = await supabase
        .from("continuous_feedback")
        .select(`
          *,
          to_user:profiles!continuous_feedback_to_user_id_fkey(full_name)
        `)
        .eq("from_user_id", user?.id)
        .order("created_at", { ascending: false });

      setSentFeedback((sent as Feedback[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.to_user_id || !formData.content) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      // @ts-ignore - Supabase types issue
      const { error } = await supabase.from("continuous_feedback").insert({
        from_user_id: user?.id,
        to_user_id: formData.to_user_id,
        feedback_type: formData.feedback_type,
        subject: formData.subject || null,
        content: formData.content,
        is_private: false,
        is_anonymous: false,
        company_id: null,
      });

      if (error) throw error;

      toast.success("Feedback sent successfully");
      setDialogOpen(false);
      setFormData({
        to_user_id: "",
        feedback_type: "praise",
        subject: "",
        content: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback");
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "praise": return <ThumbsUp className="h-4 w-4" />;
      case "suggestion": return <Lightbulb className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case "praise": return "bg-success/10 text-success";
      case "suggestion": return "bg-warning/10 text-warning";
      case "constructive": return "bg-info/10 text-info";
      default: return "bg-muted text-muted-foreground";
    }
  };

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
            { label: t("mss.title"), href: "/mss" },
            { label: t("mss.modules.feedback.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("mss.modules.feedback.title")}</h1>
            <p className="text-muted-foreground">
              {t("mss.modules.feedback.description")}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} disabled={directReports.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            {t("ess.myFeedback.giveFeedback")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Direct Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{directReports.length}</p>
              <p className="text-sm text-muted-foreground">team members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Team Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{teamFeedback.length}</p>
              <p className="text-sm text-muted-foreground">feedback items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                You Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sentFeedback.length}</p>
              <p className="text-sm text-muted-foreground">feedback given</p>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="team">Team Received ({teamFeedback.length})</TabsTrigger>
              <TabsTrigger value="sent">You Sent ({sentFeedback.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="space-y-4">
              {teamFeedback.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No feedback received by team members yet
                  </CardContent>
                </Card>
              ) : (
                teamFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${getFeedbackColor(feedback.feedback_type)}`}>
                          {getFeedbackIcon(feedback.feedback_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">To: {feedback.to_user?.full_name}</span>
                            <span className="text-muted-foreground">from</span>
                            <span className="font-medium">{feedback.from_user?.full_name}</span>
                            <Badge variant="outline" className="capitalize">
                              {feedback.feedback_type}
                            </Badge>
                          </div>
                          {feedback.subject && (
                            <p className="font-medium mt-1">{feedback.subject}</p>
                          )}
                          <p className="text-muted-foreground mt-1">{feedback.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                            {feedback.acknowledged_at && " • Acknowledged"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {sentFeedback.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No feedback sent yet
                  </CardContent>
                </Card>
              ) : (
                sentFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${getFeedbackColor(feedback.feedback_type)}`}>
                          {getFeedbackIcon(feedback.feedback_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">To: {feedback.to_user?.full_name}</span>
                            <Badge variant="outline" className="capitalize">
                              {feedback.feedback_type}
                            </Badge>
                          </div>
                          {feedback.subject && (
                            <p className="font-medium mt-1">{feedback.subject}</p>
                          )}
                          <p className="text-muted-foreground mt-1">{feedback.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Give Feedback to Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team Member *</Label>
                <Select
                  value={formData.to_user_id}
                  onValueChange={(value) => setFormData({ ...formData, to_user_id: value })}
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
                <Label>Type</Label>
                <Select
                  value={formData.feedback_type}
                  onValueChange={(value) => setFormData({ ...formData, feedback_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="praise">Praise</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="constructive">Constructive</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Feedback *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your feedback..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Send Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
