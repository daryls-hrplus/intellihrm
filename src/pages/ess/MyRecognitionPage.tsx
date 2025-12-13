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
import { toast } from "sonner";
import { Plus, Loader2, Award, Star, Trophy, Heart, ThumbsUp, PartyPopper, Send, Gift } from "lucide-react";
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
  is_public: boolean;
  created_at: string;
  recipient?: { full_name: string };
  nominator?: { full_name: string };
}

const awardTypes = [
  { value: "peer_recognition", label: "Peer Recognition", icon: ThumbsUp },
  { value: "spot_bonus", label: "Spot Bonus", icon: Trophy },
  { value: "team_award", label: "Team Award", icon: PartyPopper },
  { value: "milestone", label: "Milestone Achievement", icon: Award },
  { value: "value_champion", label: "Value Champion", icon: Heart },
  { value: "innovation", label: "Innovation Award", icon: Star },
];

export default function MyRecognitionPage() {
  const { user, company } = useAuth();
  const [receivedRecognitions, setReceivedRecognitions] = useState<Recognition[]>([]);
  const [sentRecognitions, setSentRecognitions] = useState<Recognition[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("received");
  const [formData, setFormData] = useState({
    recipient_id: "",
    award_type: "peer_recognition",
    title: "",
    description: "",
    company_value: "",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch received recognitions
      const { data: received } = await supabase
        .from("recognition_awards")
        .select(`
          *,
          nominator:profiles!recognition_awards_nominator_id_fkey(full_name)
        `)
        .eq("recipient_id", user?.id)
        .order("created_at", { ascending: false });

      // Fetch sent recognitions
      const { data: sent } = await supabase
        .from("recognition_awards")
        .select(`
          *,
          recipient:profiles!recognition_awards_recipient_id_fkey(full_name)
        `)
        .eq("nominator_id", user?.id)
        .order("created_at", { ascending: false });

      // Fetch employees for recognition
      // @ts-ignore - Supabase type instantiation issue
      const { data: emps } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .neq("id", user?.id)
        .order("full_name");

      // @ts-ignore - Supabase types issue
      setReceivedRecognitions((received as Recognition[]) || []);
      // @ts-ignore - Supabase types issue
      setSentRecognitions((sent as Recognition[]) || []);
      setEmployees(emps || []);
    } catch (error) {
      console.error("Error fetching recognitions:", error);
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
        company_id: company?.id,
        status: "approved",
        is_public: true,
        points_awarded: 10,
      });

      if (error) throw error;

      toast.success("Recognition sent successfully");
      setDialogOpen(false);
      setFormData({
        recipient_id: "",
        award_type: "peer_recognition",
        title: "",
        description: "",
        company_value: "",
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

  const totalPoints = receivedRecognitions.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

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
            { label: "My Recognition" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Recognition</h1>
            <p className="text-muted-foreground">
              View your recognitions and recognize colleagues
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Recognize Someone
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{receivedRecognitions.length}</p>
              <p className="text-sm text-muted-foreground">recognitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">total points</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sentRecognitions.length}</p>
              <p className="text-sm text-muted-foreground">recognitions sent</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="received">Received ({receivedRecognitions.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentRecognitions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedRecognitions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No recognitions received yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {receivedRecognitions.map((recognition) => (
                  <Card key={recognition.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-background p-2">
                          {getAwardIcon(recognition.award_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{recognition.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {recognition.nominator?.full_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground">{recognition.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="outline" className="capitalize">
                          {recognition.award_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(recognition.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {recognition.points_awarded > 0 && (
                        <div className="mt-2 text-sm font-medium text-primary">
                          +{recognition.points_awarded} points
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRecognitions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No recognitions sent yet. Start recognizing your colleagues!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sentRecognitions.map((recognition) => (
                  <Card key={recognition.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary/10 to-muted/10 p-4">
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
                      <p className="text-muted-foreground">{recognition.description}</p>
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
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recognize a Colleague</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Colleague *</Label>
                <Select
                  value={formData.recipient_id}
                  onValueChange={(value) => setFormData({ ...formData, recipient_id: value })}
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
                  placeholder="e.g., Great teamwork!"
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell everyone why they deserve this recognition..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Company Value (Optional)</Label>
                <Input
                  value={formData.company_value}
                  onChange={(e) => setFormData({ ...formData, company_value: e.target.value })}
                  placeholder="e.g., Collaboration, Innovation"
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
