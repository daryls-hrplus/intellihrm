import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, Settings } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

export default function AutoEnrollmentRulesPage() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    plan_id: "",
    is_active: true,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    criteria: {
      min_tenure_days: 0,
      job_levels: [] as string[],
      departments: [] as string[],
      employment_types: [] as string[]
    }
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchPlans();
      fetchRules();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("benefit_plans")
      .select("id, name, code")
      .eq("company_id", selectedCompany)
      .eq("is_active", true);
    setPlans(data || []);
  };

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("benefit_auto_enrollment_rules")
        .select(`
          *,
          plan:benefit_plans(name, code)
        `)
        .eq("company_id", selectedCompany)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast.error("Failed to load auto-enrollment rules");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.plan_id) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const ruleData = {
        company_id: selectedCompany,
        name: formData.name,
        description: formData.description,
        plan_id: formData.plan_id,
        is_active: formData.is_active,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        criteria: formData.criteria
      };

      if (editingRule) {
        const { error } = await supabase
          .from("benefit_auto_enrollment_rules")
          .update(ruleData)
          .eq("id", editingRule.id);

        if (error) throw error;
        await logAction({
          action: "UPDATE",
          entityType: "benefit_auto_enrollment_rules",
          entityId: editingRule.id,
          entityName: formData.name
        });
        toast.success("Rule updated successfully");
      } else {
        const { error } = await supabase
          .from("benefit_auto_enrollment_rules")
          .insert([ruleData]);

        if (error) throw error;
        await logAction({
          action: "CREATE",
          entityType: "benefit_auto_enrollment_rules",
          entityName: formData.name
        });
        toast.success("Rule created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save rule");
    }
  };

  const handleDelete = async (rule: any) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const { error } = await supabase
        .from("benefit_auto_enrollment_rules")
        .delete()
        .eq("id", rule.id);

      if (error) throw error;
      await logAction({
        action: "DELETE",
        entityType: "benefit_auto_enrollment_rules",
        entityId: rule.id,
        entityName: rule.name
      });
      toast.success("Rule deleted successfully");
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    }
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      plan_id: rule.plan_id,
      is_active: rule.is_active,
      start_date: rule.start_date,
      end_date: rule.end_date || "",
      criteria: rule.criteria || { min_tenure_days: 0, job_levels: [], departments: [], employment_types: [] }
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      plan_id: "",
      is_active: true,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      criteria: { min_tenure_days: 0, job_levels: [], departments: [], employment_types: [] }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Auto-Enrollment Rules</h1>
            <p className="text-muted-foreground">Configure automatic benefit enrollment criteria</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Rule</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingRule ? "Edit Rule" : "Create Auto-Enrollment Rule"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Rule Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., New Hire Health Insurance"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe when this rule applies..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plan">Benefit Plan *</Label>
                    <Select value={formData.plan_id} onValueChange={(value) => setFormData({ ...formData, plan_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>{plan.name} ({plan.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Enrollment Criteria</Label>
                    <Card>
                      <CardContent className="pt-4 space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="min_tenure">Minimum Tenure (days after hire)</Label>
                          <Input
                            id="min_tenure"
                            type="number"
                            min={0}
                            value={formData.criteria.min_tenure_days}
                            onChange={(e) => setFormData({
                              ...formData,
                              criteria: { ...formData.criteria, min_tenure_days: parseInt(e.target.value) || 0 }
                            })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Employees will be auto-enrolled after this many days of employment
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingRule ? "Update" : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configured Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Benefit Plan</TableHead>
                  <TableHead>Waiting Period</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No auto-enrollment rules configured
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{rule.plan?.name}</TableCell>
                      <TableCell>{rule.criteria?.min_tenure_days || 0} days</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{rule.start_date}</p>
                          {rule.end_date && <p className="text-muted-foreground">to {rule.end_date}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rule)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
