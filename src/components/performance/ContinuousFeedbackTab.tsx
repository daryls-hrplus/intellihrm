import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Plus, Loader2, MessageSquare, ThumbsUp, Lightbulb, CheckCircle } from "lucide-react";
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

interface ContinuousFeedbackTabProps {
  companyId: string;
}

export function ContinuousFeedbackTab({ companyId }: ContinuousFeedbackTabProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
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
    if (companyId && user) fetchData();
  }, [companyId, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [feedbackRes, employeesRes] = await Promise.all([
        // @ts-ignore
        supabase
          .from("continuous_feedback")
          .select(`
            *,
            from_user:profiles!continuous_feedback_from_user_id_fkey(full_name),
            to_user:profiles!continuous_feedback_to_user_id_fkey(full_name)
          `)
          .eq("company_id", companyId)
          .or(`from_user_id.eq.${user?.id},to_user_id.eq.${user?.id}`)
          .order("created_at", { ascending: false }),
        // @ts-ignore
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .neq("id", user?.id),
      ]);

      if (feedbackRes.data) setFeedback(feedbackRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.to_user_id || !formData.content) {
      toast.error("Please select a recipient and enter feedback content");
      return;
    }

    try {
      const { error } = await supabase.from("continuous_feedback").insert({
        company_id: companyId,
        from_user_id: user?.id,
        to_user_id: formData.to_user_id,
        feedback_type: formData.feedback_type,
        subject: formData.subject || null,
        content: formData.content,
        is_private: formData.is_private,
        is_anonymous: formData.is_anonymous,
      });

      if (error) throw error;
      toast.success("Feedback sent successfully");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback");
    }
  };

  const acknowledgedFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from("continuous_feedback")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Feedback acknowledged");
      fetchData();
    } catch (error) {
      toast.error("Failed to acknowledge feedback");
    }
  };

  const resetForm = () => {
    setFormData({
      to_user_id: "",
      feedback_type: "praise",
      subject: "",
      content: "",
      is_private: false,
      is_anonymous: false,
    });
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "praise":
        return <ThumbsUp className="h-4 w-4 text-success" />;
      case "constructive":
        return <MessageSquare className="h-4 w-4 text-warning" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-info" />;
      case "check_in":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      praise: "bg-success/10 text-success",
      constructive: "bg-warning/10 text-warning",
      suggestion: "bg-info/10 text-info",
      check_in: "bg-primary/10 text-primary",
      recognition: "bg-purple-500/10 text-purple-600",
    };
    return <Badge className={colors[type] || "bg-muted"}>{type.replace("_", " ")}</Badge>;
  };

  const receivedFeedback = feedback.filter((f) => f.to_user_id === user?.id);
  const sentFeedback = feedback.filter((f) => f.from_user_id === user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const FeedbackCard = ({ item, isSent }: { item: Feedback; isSent: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFeedbackIcon(item.feedback_type)}
            <CardTitle className="text-base">
              {item.subject || `${item.feedback_type.replace("_", " ")} feedback`}
            </CardTitle>
            {getTypeBadge(item.feedback_type)}
            {item.is_private && <Badge variant="outline">Private</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{item.content}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isSent
              ? `To: ${item.to_user?.full_name}`
              : item.is_anonymous
              ? "From: Anonymous"
              : `From: ${item.from_user?.full_name}`}
          </span>
          {!isSent && !item.acknowledged_at && (
            <Button size="sm" variant="outline" onClick={() => acknowledgedFeedback(item.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Acknowledge
            </Button>
          )}
          {item.acknowledged_at && (
            <Badge variant="outline" className="bg-success/10 text-success">
              Acknowledged
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Continuous Feedback</h3>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Give Feedback
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="received">Received ({receivedFeedback.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentFeedback.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4">
          {receivedFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No feedback received yet
              </CardContent>
            </Card>
          ) : (
            receivedFeedback.map((item) => (
              <FeedbackCard key={item.id} item={item} isSent={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          {sentFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No feedback sent yet
              </CardContent>
            </Card>
          ) : (
            sentFeedback.map((item) => (
              <FeedbackCard key={item.id} item={item} isSent={true} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Recipient *</Label>
              <Select value={formData.to_user_id} onValueChange={(v) => setFormData({ ...formData, to_user_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <Select value={formData.feedback_type} onValueChange={(v) => setFormData({ ...formData, feedback_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="praise">Praise</SelectItem>
                  <SelectItem value="constructive">Constructive</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="check_in">Check-in</SelectItem>
                  <SelectItem value="recognition">Recognition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject (optional)</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief subject line"
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
                  onCheckedChange={(v) => setFormData({ ...formData, is_private: v })}
                />
                <Label>Private (only visible to recipient)</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_anonymous}
                onCheckedChange={(v) => setFormData({ ...formData, is_anonymous: v })}
              />
              <Label>Send anonymously</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Send Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
