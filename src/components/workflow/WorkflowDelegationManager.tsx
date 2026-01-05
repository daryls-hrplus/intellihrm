import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, UserCheck, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, isBefore, isAfter } from "date-fns";

interface Delegation {
  id: string;
  delegateId: string;
  delegateName: string;
  delegateEmail: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  isActive: boolean;
  templateCategories: string[] | null;
}

export function WorkflowDelegationManager() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  
  const [formData, setFormData] = useState({
    delegateId: "",
    startDate: "",
    endDate: "",
    reason: "",
    allCategories: true,
  });

  useEffect(() => {
    if (user?.id) {
      fetchDelegations();
      fetchUsers();
    }
  }, [user?.id]);

  const fetchDelegations = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data, error } = await (supabase as any)
        .from("workflow_delegations")
        .select(`
          id,
          delegate_id,
          start_date,
          end_date,
          reason,
          is_active,
          template_categories,
          delegate:profiles!workflow_delegations_delegate_id_fkey(full_name, email)
        `)
        .eq("delegator_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;

      const mappedDelegations: Delegation[] = (data || []).map(d => ({
        id: d.id,
        delegateId: d.delegate_id,
        delegateName: (d.delegate as any)?.full_name || "Unknown",
        delegateEmail: (d.delegate as any)?.email || "",
        startDate: d.start_date,
        endDate: d.end_date,
        reason: d.reason,
        isActive: d.is_active ?? true,
        templateCategories: d.template_categories,
      }));

      setDelegations(mappedDelegations);
    } catch (error) {
      console.error("Failed to fetch delegations:", error);
      toast.error("Failed to load delegations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .neq("id", user?.id)
      .order("full_name");
    
    if (data) setUsers(data);
  };

  const handleSave = async () => {
    if (!formData.delegateId || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await (supabase as any).from("workflow_delegations").insert({
        delegator_id: user?.id,
        delegate_id: formData.delegateId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason || null,
        company_id: profile?.company_id,
        template_categories: formData.allCategories ? null : [],
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success("Delegation created successfully");
      setShowDialog(false);
      resetForm();
      fetchDelegations();
    } catch (error: any) {
      console.error("Failed to create delegation:", error);
      toast.error(error.message || "Failed to create delegation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delegation?")) return;

    try {
      const { error } = await (supabase as any).from("workflow_delegations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Delegation deleted");
      fetchDelegations();
    } catch (error) {
      toast.error("Failed to delete delegation");
    }
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("workflow_delegations")
        .update({ is_active: !currentValue })
        .eq("id", id);

      if (error) throw error;
      fetchDelegations();
    } catch (error) {
      toast.error("Failed to update delegation");
    }
  };

  const resetForm = () => {
    setFormData({
      delegateId: "",
      startDate: "",
      endDate: "",
      reason: "",
      allCategories: true,
    });
  };

  const getDelegationStatus = (delegation: Delegation): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const now = new Date();
    const start = new Date(delegation.startDate);
    const end = new Date(delegation.endDate);

    if (!delegation.isActive) return { label: "Inactive", variant: "secondary" };
    if (isBefore(now, start)) return { label: "Scheduled", variant: "outline" };
    if (isAfter(now, end)) return { label: "Expired", variant: "destructive" };
    return { label: "Active", variant: "default" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Workflow Delegation</h3>
          <p className="text-sm text-muted-foreground">
            Delegate your approval authority to others when you're away
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delegation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Delegations</CardTitle>
          <CardDescription>
            People who can approve on your behalf
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : delegations.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Delegations</h3>
              <p className="text-muted-foreground">
                You haven't set up any approval delegations yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delegate</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegations.map(delegation => {
                  const status = getDelegationStatus(delegation);
                  return (
                    <TableRow key={delegation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{delegation.delegateName}</p>
                          <p className="text-xs text-muted-foreground">{delegation.delegateEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(delegation.startDate), "MMM d, yyyy")} - {format(new Date(delegation.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {delegation.reason || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={delegation.isActive}
                          onCheckedChange={() => toggleActive(delegation.id, delegation.isActive)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(delegation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Delegation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Delegation</DialogTitle>
            <DialogDescription>
              Set up someone to approve on your behalf while you're away
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Delegate To *</Label>
              <Select
                value={formData.delegateId}
                onValueChange={value => setFormData({ ...formData, delegateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Annual leave, Business trip..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>All Workflow Categories</Label>
                <p className="text-xs text-muted-foreground">
                  Delegate for all workflow types
                </p>
              </div>
              <Switch
                checked={formData.allCategories}
                onCheckedChange={checked => setFormData({ ...formData, allCategories: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Delegation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
