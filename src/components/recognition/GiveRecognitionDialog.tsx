import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useRecognition } from "@/hooks/useRecognition";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Award, 
  ThumbsUp, 
  Star, 
  Trophy, 
  Heart, 
  Sparkles,
  Users,
  PartyPopper,
  Loader2,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GiveRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  preselectedRecipient?: { id: string; name: string };
}

const awardTypes = [
  { value: "peer_recognition", label: "Peer Recognition", icon: ThumbsUp, description: "Recognize a colleague's great work" },
  { value: "manager_recognition", label: "Manager Recognition", icon: Star, description: "Manager appreciation" },
  { value: "spot_bonus", label: "Spot Bonus", icon: Trophy, description: "Special achievement recognition" },
  { value: "team_award", label: "Team Award", icon: Users, description: "Recognize team effort" },
  { value: "milestone", label: "Milestone", icon: PartyPopper, description: "Celebrate an achievement" },
  { value: "value_champion", label: "Value Champion", icon: Heart, description: "Living company values" },
  { value: "innovation", label: "Innovation Award", icon: Sparkles, description: "Creative solutions" },
];

const companyValues = [
  "Innovation",
  "Teamwork",
  "Excellence",
  "Integrity",
  "Customer Focus",
  "Collaboration",
  "Accountability",
  "Respect",
];

export function GiveRecognitionDialog({ 
  open, 
  onOpenChange, 
  companyId,
  preselectedRecipient 
}: GiveRecognitionDialogProps) {
  const { user } = useAuth();
  const { createRecognition } = useRecognition(companyId);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTeamRecognition, setIsTeamRecognition] = useState(false);
  const [formData, setFormData] = useState({
    recipient_id: preselectedRecipient?.id || "",
    award_type: "peer_recognition",
    title: "",
    description: "",
    company_value: "",
  });

  useEffect(() => {
    if (open && companyId) {
      fetchEmployees();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (preselectedRecipient) {
      setFormData(prev => ({ ...prev, recipient_id: preselectedRecipient.id }));
    }
  }, [preselectedRecipient]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .neq("id", user?.id)
      .order("full_name");
    setEmployees(data || []);
  };

  const filteredEmployees = employees.filter(e => 
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.recipient_id || !formData.title || !formData.description) {
      return;
    }

    createRecognition.mutate({
      ...formData,
      is_team_recognition: isTeamRecognition,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setFormData({
      recipient_id: "",
      award_type: "peer_recognition",
      title: "",
      description: "",
      company_value: "",
    });
    setIsTeamRecognition(false);
    setSearchTerm("");
  };

  const selectedType = awardTypes.find(t => t.value === formData.award_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recognize a Colleague
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Award Type Selection */}
          <div className="space-y-2">
            <Label>Recognition Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {awardTypes.slice(0, 6).map((type) => {
                const Icon = type.icon;
                const isSelected = formData.award_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, award_type: type.value })}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-colors",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isSelected && "text-primary")} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label>Who are you recognizing? *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a colleague..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchTerm && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No employees found</p>
                ) : (
                  filteredEmployees.slice(0, 5).map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, recipient_id: employee.id });
                        setSearchTerm(employee.full_name);
                      }}
                      className={cn(
                        "w-full p-3 text-left hover:bg-muted transition-colors text-sm",
                        formData.recipient_id === employee.id && "bg-primary/5"
                      )}
                    >
                      {employee.full_name}
                    </button>
                  ))
                )}
              </div>
            )}
            {formData.recipient_id && !searchTerm && (
              <p className="text-sm text-muted-foreground">
                Selected: {employees.find(e => e.id === formData.recipient_id)?.full_name}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Outstanding Team Player, Going Above & Beyond"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Why are you recognizing them? *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Share the specific actions or behaviors that made an impact..."
              rows={4}
            />
          </div>

          {/* Company Value */}
          <div className="space-y-2">
            <Label>Company Value (Optional)</Label>
            <Select 
              value={formData.company_value} 
              onValueChange={(v) => setFormData({ ...formData, company_value: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company value" />
              </SelectTrigger>
              <SelectContent>
                {companyValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Recognition Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label>Team Recognition</Label>
              <p className="text-xs text-muted-foreground">
                Mark this as a team-wide recognition
              </p>
            </div>
            <Switch 
              checked={isTeamRecognition} 
              onCheckedChange={setIsTeamRecognition}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.recipient_id || !formData.title || !formData.description || createRecognition.isPending}
          >
            {createRecognition.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Award className="h-4 w-4 mr-2" />
            )}
            Send Recognition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
