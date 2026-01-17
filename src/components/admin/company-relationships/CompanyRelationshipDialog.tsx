import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationship?: any;
  onSuccess: () => void;
}

interface Company {
  id: string;
  code: string;
  name: string;
  group_id: string | null;
}

export function CompanyRelationshipDialog({ open, onOpenChange, relationship, onSuccess }: Props) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    source_company_id: "",
    target_company_id: "",
    relationship_type: "both",
    relationship_reason: "custom",
    description: "",
    is_bidirectional: false,
    effective_date: new Date().toISOString().split("T")[0],
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    if (open) {
      fetchCompanies();
      if (relationship) {
        setFormData({
          source_company_id: relationship.source_company_id || "",
          target_company_id: relationship.target_company_id || "",
          relationship_type: relationship.relationship_type || "both",
          relationship_reason: relationship.relationship_reason || "custom",
          description: relationship.description || "",
          is_bidirectional: relationship.is_bidirectional || false,
          effective_date: relationship.effective_date || new Date().toISOString().split("T")[0],
          end_date: relationship.end_date || "",
          is_active: relationship.is_active ?? true,
        });
      } else {
        setFormData({
          source_company_id: "",
          target_company_id: "",
          relationship_type: "both",
          relationship_reason: "custom",
          description: "",
          is_bidirectional: false,
          effective_date: new Date().toISOString().split("T")[0],
          end_date: "",
          is_active: true,
        });
      }
    }
  }, [open, relationship]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, code, name, group_id")
      .eq("is_active", true)
      .order("name");
    setCompanies(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.source_company_id || !formData.target_company_id) {
      toast.error("Please select both source and target companies");
      return;
    }

    if (formData.source_company_id === formData.target_company_id) {
      toast.error("Source and target companies must be different");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        source_company_id: formData.source_company_id,
        target_company_id: formData.target_company_id,
        relationship_type: formData.relationship_type,
        relationship_reason: formData.relationship_reason,
        description: formData.description || null,
        is_bidirectional: formData.is_bidirectional,
        effective_date: formData.effective_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        created_by: user?.id,
      };

      if (relationship?.id) {
        const { error } = await supabase
          .from("company_reporting_relationships")
          .update(payload)
          .eq("id", relationship.id);
        if (error) throw error;
        toast.success("Relationship updated successfully");
      } else {
        const { error } = await supabase
          .from("company_reporting_relationships")
          .insert(payload);
        if (error) throw error;
        toast.success("Relationship created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Submit error:", error);
      if (error.code === "23505") {
        toast.error("This relationship already exists");
      } else {
        toast.error("Failed to save relationship");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceCompany = companies.find(c => c.id === formData.source_company_id);
  const targetCompany = companies.find(c => c.id === formData.target_company_id);
  const isSameGroup = sourceCompany?.group_id && sourceCompany.group_id === targetCompany?.group_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{relationship ? "Edit" : "Add"} Company Relationship</DialogTitle>
          <DialogDescription>
            Configure cross-company reporting rules for positions outside the same corporate group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Source Company *</Label>
              <Select
                value={formData.source_company_id}
                onValueChange={(value) => setFormData({ ...formData, source_company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} ({company.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Company that can report TO the target</p>
            </div>

            <div className="space-y-2">
              <Label>Target Company *</Label>
              <Select
                value={formData.target_company_id}
                onValueChange={(value) => setFormData({ ...formData, target_company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} ({company.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Company that receives reports</p>
            </div>
          </div>

          {isSameGroup && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
              <p className="font-medium text-warning">Same Corporate Group</p>
              <p className="text-muted-foreground">
                These companies are already in the same group. Reporting is automatically allowed.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Relationship Type *</Label>
              <Select
                value={formData.relationship_type}
                onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary (Solid-Line) Only</SelectItem>
                  <SelectItem value="matrix">Matrix (Dotted-Line) Only</SelectItem>
                  <SelectItem value="both">Both Primary & Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select
                value={formData.relationship_reason}
                onValueChange={(value) => setFormData({ ...formData, relationship_reason: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joint_venture">Joint Venture</SelectItem>
                  <SelectItem value="managed_services">Managed Services</SelectItem>
                  <SelectItem value="shared_services">Shared Services</SelectItem>
                  <SelectItem value="custom">Custom Arrangement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this relationship arrangement..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Bidirectional</Label>
              <p className="text-xs text-muted-foreground">
                Allow reporting in both directions between these companies
              </p>
            </div>
            <Switch
              checked={formData.is_bidirectional}
              onCheckedChange={(checked) => setFormData({ ...formData, is_bidirectional: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                Only active relationships are enforced during imports
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {relationship ? "Update" : "Create"} Relationship
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
