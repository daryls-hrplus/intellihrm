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
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, ThumbsUp, Lightbulb, CheckCircle, Send, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const { user, company } = useAuth();
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("received");
  const [formData, setFormData] = useState({
    to_user_id: "",
    feedback_type: "praise",
    subject: "",
    content: "",
    is_private: false,
    is_anonymous: false,
  });

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

      toast.success("Feedback sent successfully");
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
      toast.error("Failed to send feedback");
    }
  };

  const handleAcknowledge = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from("continuous_feedback")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", feedbackId);

      if (error) throw error;
      toast.success("Feedback acknowledged");
      fetchData();
    } catch (error) {
      toast.error("Failed to acknowledge feedback");
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
            { label: "Employee Self Service", href: "/ess" },
            { label: "My Feedback" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Feedback</h1>
            <p className="text-muted-foreground">
              Give and receive continuous feedback
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Give Feedback
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
      </div>
    </AppLayout>
  );
}
