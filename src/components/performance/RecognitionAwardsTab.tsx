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
import { toast } from "sonner";
import { Plus, Loader2, Award, Star, Trophy, Heart, ThumbsUp, PartyPopper } from "lucide-react";
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
  reactions?: { reaction_type: string; user_id: string }[];
}

interface RecognitionAwardsTabProps {
  companyId: string;
}

const awardTypes = [
  { value: "peer_recognition", label: "Peer Recognition", icon: ThumbsUp },
  { value: "manager_recognition", label: "Manager Recognition", icon: Star },
  { value: "spot_bonus", label: "Spot Bonus", icon: Trophy },
  { value: "team_award", label: "Team Award", icon: PartyPopper },
  { value: "milestone", label: "Milestone Achievement", icon: Award },
  { value: "value_champion", label: "Value Champion", icon: Heart },
  { value: "innovation", label: "Innovation Award", icon: Star },
  { value: "customer_hero", label: "Customer Hero", icon: Trophy },
];

export function RecognitionAwardsTab({ companyId }: RecognitionAwardsTabProps) {
  const { user } = useAuth();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wall");
  const [formData, setFormData] = useState({
    recipient_id: "",
    award_type: "peer_recognition",
    title: "",
    description: "",
    company_value: "",
    points_awarded: 0,
  });

  useEffect(() => {
    if (companyId) fetchData();
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recognitionsRes, employeesRes] = await Promise.all([
        // @ts-ignore
        supabase
          .from("recognition_awards")
          .select(`
            *,
            recipient:profiles!recognition_awards_recipient_id_fkey(full_name),
            nominator:profiles!recognition_awards_nominator_id_fkey(full_name),
            reactions:recognition_reactions(reaction_type, user_id)
          `)
          .eq("company_id", companyId)
          .eq("status", "approved")
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        // @ts-ignore
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("company_id", companyId)
          .eq("is_active", true),
      ]);

      if (recognitionsRes.data) setRecognitions(recognitionsRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
    } catch (error) {
      console.error("Error fetching recognitions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.recipient_id || !formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("recognition_awards").insert({
        company_id: companyId,
        recipient_id: formData.recipient_id,
        nominator_id: user?.id,
        award_type: formData.award_type,
        title: formData.title,
        description: formData.description,
        company_value: formData.company_value || null,
        points_awarded: formData.points_awarded,
        status: "approved", // Auto-approve for now
        is_public: true,
      });

      if (error) throw error;
      toast.success("Recognition submitted successfully!");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error creating recognition:", error);
      toast.error("Failed to submit recognition");
    }
  };

  const addReaction = async (recognitionId: string, reactionType: string) => {
    try {
      const { error } = await supabase.from("recognition_reactions").upsert({
        recognition_id: recognitionId,
        user_id: user?.id,
        reaction_type: reactionType,
      });
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      recipient_id: "",
      award_type: "peer_recognition",
      title: "",
      description: "",
      company_value: "",
      points_awarded: 0,
    });
  };

  const getAwardIcon = (type: string) => {
    const awardType = awardTypes.find((a) => a.value === type);
    const Icon = awardType?.icon || Award;
    return <Icon className="h-5 w-5" />;
  };

  const getReactionCount = (reactions: { reaction_type: string }[] = [], type: string) => {
    return reactions.filter((r) => r.reaction_type === type).length;
  };

  const hasUserReacted = (reactions: { reaction_type: string; user_id: string }[] = [], type: string) => {
    return reactions.some((r) => r.reaction_type === type && r.user_id === user?.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recognition & Awards</h3>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Recognize Someone
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="wall">Recognition Wall</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="wall" className="mt-4">
          {recognitions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold">No recognitions yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to recognize a colleague!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recognitions.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        {getAwardIcon(item.award_type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {awardTypes.find((a) => a.value === item.award_type)?.label}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium">{item.recipient?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Recognized by {item.nominator?.full_name}
                        </p>
                      </div>
                      {item.points_awarded > 0 && (
                        <Badge className="bg-warning/10 text-warning">
                          +{item.points_awarded} pts
                        </Badge>
                      )}
                    </div>
                    {item.company_value && (
                      <Badge variant="outline" className="mb-3">
                        {item.company_value}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant={hasUserReacted(item.reactions, "like") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => addReaction(item.id, "like")}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {getReactionCount(item.reactions, "like") || ""}
                      </Button>
                      <Button
                        variant={hasUserReacted(item.reactions, "celebrate") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => addReaction(item.id, "celebrate")}
                      >
                        <PartyPopper className="h-4 w-4 mr-1" />
                        {getReactionCount(item.reactions, "celebrate") || ""}
                      </Button>
                      <Button
                        variant={hasUserReacted(item.reactions, "love") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => addReaction(item.id, "love")}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {getReactionCount(item.reactions, "love") || ""}
                      </Button>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Recognized Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Leaderboard data coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recognize a Colleague</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Who would you like to recognize? *</Label>
              <Select value={formData.recipient_id} onValueChange={(v) => setFormData({ ...formData, recipient_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.id !== user?.id).map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Award Type</Label>
              <Select value={formData.award_type} onValueChange={(v) => setFormData({ ...formData, award_type: v })}>
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
                placeholder="e.g., Outstanding Team Player"
              />
            </div>
            <div className="space-y-2">
              <Label>Why are you recognizing them? *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share what they did and why it matters..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Value (optional)</Label>
              <Input
                value={formData.company_value}
                onChange={(e) => setFormData({ ...formData, company_value: e.target.value })}
                placeholder="e.g., Innovation, Teamwork, Excellence"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              <Award className="h-4 w-4 mr-2" />
              Send Recognition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
