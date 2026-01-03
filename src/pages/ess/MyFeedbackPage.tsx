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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, ThumbsUp, Lightbulb, CheckCircle, Send, Inbox, Users, Clock, BarChart3, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
import { useMy360FeedbackRequests, type My360Request } from "@/hooks/useMy360FeedbackRequests";
import { Ess360FeedbackResponseDialog } from "@/components/ess/Ess360FeedbackResponseDialog";

interface Feedback {
  id: string;
  from_user_id: string;
  to_user_id: string;
  feedback_type: string;
  subject: string | null;
  content: string;
  is_private: boolean;
  is_anonymous: boolean;
  acknowledged_at: string | null;
  created_at: string;
  from_user?: { full_name: string };
  to_user?: { full_name: string };
}

export default function MyFeedbackPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("continuous");
  const [selected360Request, setSelected360Request] = useState<My360Request | null>(null);
  const [formData, setFormData] = useState({
    to_user_id: "",
    feedback_type: "praise",
    subject: "",
    content: "",
    is_private: false,
    is_anonymous: false,
  });

  const { data: feedbackRequests = [], isLoading: feedbackLoading } = useMy360FeedbackRequests();
  const pending360 = feedbackRequests.filter(r => r.status === "pending" || r.status === "in_progress");
  const completed360 = feedbackRequests.filter(r => r.status === "completed" || r.status === "submitted");

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch sent feedback
      const { data: sent } = await supabase
        .from("continuous_feedback")
        .select(`
          *,
          to_user:profiles!continuous_feedback_to_user_id_fkey(full_name)
        `)
        .eq("from_user_id", user?.id)
        .order("created_at", { ascending: false });

      // Fetch received feedback
      const { data: received } = await supabase
        .from("continuous_feedback")
        .select(`
          *,
          from_user:profiles!continuous_feedback_from_user_id_fkey(full_name)
        `)
        .eq("to_user_id", user?.id)
        .order("created_at", { ascending: false });

      // Fetch employees for giving feedback
      // @ts-ignore - Supabase type instantiation issue
      const { data: emps } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .neq("id", user?.id)
        .order("full_name");

      // @ts-ignore - Supabase types issue
      setSentFeedback((sent as Feedback[]) || []);
      // @ts-ignore - Supabase types issue
      setReceivedFeedback((received as Feedback[]) || []);
      setEmployees(emps || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
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
      const { error } = await supabase.from("continuous_feedback").insert({
        from_user_id: user?.id,
        to_user_id: formData.to_user_id,
        feedback_type: formData.feedback_type,
        subject: formData.subject || null,
        content: formData.content,
        is_private: formData.is_private,
        is_anonymous: formData.is_anonymous,
        company_id: company?.id,
      });

      if (error) throw error;

      toast.success(t('common.success'));
      setDialogOpen(false);
      setFormData({
        to_user_id: "",
        feedback_type: "praise",
        subject: "",
        content: "",
        is_private: false,
        is_anonymous: false,
      });
      fetchData();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error(t('common.error'));
    }
  };

  const handleAcknowledge = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from("continuous_feedback")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", feedbackId);

      if (error) throw error;
      toast.success(t('common.success'));
      fetchData();
    } catch (error) {
      toast.error(t('common.error'));
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      submitted: { variant: "default", label: "Submitted" },
      completed: { variant: "default", label: "Completed" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
            { label: t('navigation.ess'), href: "/ess" },
            { label: t('ess.myFeedback.breadcrumb') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('ess.myFeedback.title')}</h1>
            <p className="text-muted-foreground">
              {t('ess.myFeedback.subtitle')}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('ess.myFeedback.giveFeedback')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{receivedFeedback.length}</p>
              <p className="text-sm text-muted-foreground">
                {receivedFeedback.filter(f => !f.acknowledged_at).length} unacknowledged
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sentFeedback.length}</p>
              <p className="text-sm text-muted-foreground">feedback given</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                360 Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pending360.length}</p>
              <p className="text-sm text-muted-foreground">pending to complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                360 Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completed360.length}</p>
              <p className="text-sm text-muted-foreground">feedback provided</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="continuous">Continuous ({receivedFeedback.length + sentFeedback.length})</TabsTrigger>
            <TabsTrigger value="360requests">360 Requests ({pending360.length})</TabsTrigger>
            <TabsTrigger value="360completed">360 Completed ({completed360.length})</TabsTrigger>
            <TabsTrigger value="my360results">My 360 Results</TabsTrigger>
          </TabsList>

          {/* Continuous Feedback Tab */}
          <TabsContent value="continuous" className="space-y-4">
            <Tabs defaultValue="received">
              <TabsList>
                <TabsTrigger value="received">Received ({receivedFeedback.length})</TabsTrigger>
                <TabsTrigger value="sent">Sent ({sentFeedback.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="received" className="space-y-4">
                {receivedFeedback.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No feedback received yet
                    </CardContent>
                  </Card>
                ) : (
                  receivedFeedback.map((feedback) => (
                    <Card key={feedback.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-lg p-2 ${getFeedbackColor(feedback.feedback_type)}`}>
                              {getFeedbackIcon(feedback.feedback_type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {feedback.is_anonymous ? "Anonymous" : feedback.from_user?.full_name}
                                </span>
                                <Badge variant="outline" className="capitalize">
                                  {feedback.feedback_type}
                                </Badge>
                                {feedback.is_private && (
                                  <Badge variant="secondary">Private</Badge>
                                )}
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
                          {!feedback.acknowledged_at && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(feedback.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Acknowledge
                            </Button>
                          )}
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
                              {feedback.acknowledged_at && " • Acknowledged"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* 360 Requests Tab */}
          <TabsContent value="360requests" className="space-y-4">
            {feedbackLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : pending360.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Pending Feedback Requests</h3>
                  <p className="text-muted-foreground">You don't have any 360 feedback to provide.</p>
                </CardContent>
              </Card>
            ) : (
              pending360.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            Feedback for {request.subject_employee_name}
                          </h3>
                          {getStatusBadge(request.status)}
                          {request.is_mandatory && (
                            <Badge variant="destructive">Mandatory</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>{request.cycle_name}</span>
                          {request.due_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Due: {format(new Date(request.due_date), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelected360Request(request)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Provide Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 360 Completed Tab */}
          <TabsContent value="360completed" className="space-y-4">
            {completed360.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Completed Feedback</h3>
                  <p className="text-muted-foreground">Your completed 360 feedback will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              completed360.map((request) => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{request.subject_employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.cycle_name} • Submitted {request.submitted_at ? format(new Date(request.submitted_at), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* My 360 Results Tab */}
          <TabsContent value="my360results" className="space-y-4">
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-primary/70 mb-4" />
                <h3 className="text-lg font-medium">View Your 360° Feedback Results</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  Access your completed 360° feedback reports, download summaries, 
                  and view development themes created by your manager or HR.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  <Link to="/performance/360-feedback">
                    <Button>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View 360 Results & Reports
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/ess/my-development-themes">
                    <Button variant="outline">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      My Development Themes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Give Feedback Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Give Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To *</Label>
                <Select
                  value={formData.to_user_id}
                  onValueChange={(value) => setFormData({ ...formData, to_user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
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
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Optional subject"
                />
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_private}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
                  />
                  <Label>Private (only visible to recipient)</Label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                  />
                  <Label>Send anonymously</Label>
                </div>
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

        {/* 360 Feedback Response Dialog */}
        {selected360Request && (
          <Ess360FeedbackResponseDialog
            open={!!selected360Request}
            onOpenChange={(open) => !open && setSelected360Request(null)}
            request={selected360Request}
          />
        )}
      </div>
    </AppLayout>
  );
}