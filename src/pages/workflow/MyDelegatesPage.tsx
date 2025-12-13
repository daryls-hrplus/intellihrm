import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import type { WorkflowCategory, WorkflowTemplate } from "@/hooks/useWorkflow";

interface WorkflowDelegate {
  id: string;
  delegator_id: string;
  delegate_id: string;
  category: WorkflowCategory | null;
  template_id: string | null;
  start_date: string;
  end_date: string | null;
  reason: string | null;
  is_active: boolean;
  delegate?: { full_name: string; email: string };
  delegator?: { full_name: string; email: string };
  template?: { name: string };
}

const WORKFLOW_CATEGORIES: { value: WorkflowCategory; label: string }[] = [
  { value: "leave_request", label: "Leave Request" },
  { value: "probation_confirmation", label: "Probation Confirmation" },
  { value: "headcount_request", label: "Headcount Request" },
  { value: "training_request", label: "Training Request" },
  { value: "promotion", label: "Promotion" },
  { value: "transfer", label: "Transfer" },
  { value: "resignation", label: "Resignation" },
  { value: "termination", label: "Termination" },
  { value: "expense_claim", label: "Expense Claim" },
  { value: "letter_request", label: "Letter Request" },
  { value: "general", label: "General" },
];

export default function MyDelegatesPage() {
  const { user } = useAuth();
  const [myDelegates, setMyDelegates] = useState<WorkflowDelegate[]>([]);
  const [delegatedToMe, setDelegatedToMe] = useState<WorkflowDelegate[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    delegate_id: "",
    category: "" as WorkflowCategory | "",
    template_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const [delegatesRes, delegatedRes, usersRes, templatesRes] = await Promise.all([
        supabase
          .from("workflow_delegates")
          .select(`
            *,
            delegate:profiles!workflow_delegates_delegate_id_fkey(full_name, email),
            template:workflow_templates(name)
          `)
          .eq("delegator_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("workflow_delegates")
          .select(`
            *,
            delegator:profiles!workflow_delegates_delegator_id_fkey(full_name, email),
            template:workflow_templates(name)
          `)
          .eq("delegate_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email").neq("id", user.id),
        supabase.from("workflow_templates").select("*").eq("is_active", true),
      ]);

      if (delegatesRes.data) setMyDelegates(delegatesRes.data as unknown as WorkflowDelegate[]);
      if (delegatedRes.data) setDelegatedToMe(delegatedRes.data as unknown as WorkflowDelegate[]);
      if (usersRes.data) setUsers(usersRes.data);
      if (templatesRes.data) setTemplates(templatesRes.data as WorkflowTemplate[]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !formData.delegate_id) {
      toast.error("Please select a delegate");
      return;
    }

    try {
      const { error } = await supabase.from("workflow_delegates").insert({
        delegator_id: user.id,
        delegate_id: formData.delegate_id,
        category: formData.category ? formData.category : null,
        template_id: formData.template_id || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        reason: formData.reason || null,
        created_by: user.id,
      });

      if (error) throw error;
      toast.success("Delegate added");
      setShowDialog(false);
      setFormData({
        delegate_id: "",
        category: "",
        template_id: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        reason: "",
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add delegate");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await supabase
        .from("workflow_delegates")
        .update({ is_active: !isActive })
        .eq("id", id);
      toast.success(isActive ? "Delegation deactivated" : "Delegation activated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update delegation");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this delegation?")) return;

    try {
      await supabase.from("workflow_delegates").delete().eq("id", id);
      toast.success("Delegation deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete delegation");
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "All Categories";
    return WORKFLOW_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "My Delegates" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Approval Delegates</h1>
            <p className="text-muted-foreground">
              Manage who can approve workflows on your behalf
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Delegate
          </Button>
        </div>

        <Tabs defaultValue="my-delegates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-delegates" className="gap-2">
              <Users className="h-4 w-4" />
              My Delegates
              {myDelegates.length > 0 && (
                <Badge variant="secondary">{myDelegates.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="delegated-to-me" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Delegated to Me
              {delegatedToMe.length > 0 && (
                <Badge variant="secondary">{delegatedToMe.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-delegates">
            <Card>
              <CardHeader>
                <CardTitle>People Who Can Approve for You</CardTitle>
                <CardDescription>
                  These users can take action on workflows assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : myDelegates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No delegates configured</p>
                    <p className="text-sm">Add a delegate to allow someone to approve on your behalf</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Delegate</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myDelegates.map((delegation) => (
                        <TableRow key={delegation.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {delegation.delegate?.full_name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {delegation.delegate?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {delegation.template ? (
                              <Badge variant="outline">{delegation.template.name}</Badge>
                            ) : (
                              <Badge variant="secondary">
                                {getCategoryLabel(delegation.category)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{format(new Date(delegation.start_date), "MMM d, yyyy")}</p>
                              {delegation.end_date && (
                                <p className="text-muted-foreground">
                                  to {format(new Date(delegation.end_date), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={delegation.is_active ? "default" : "secondary"}>
                              {delegation.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleActive(delegation.id, delegation.is_active)}
                              >
                                {delegation.is_active ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(delegation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delegated-to-me">
            <Card>
              <CardHeader>
                <CardTitle>Workflows You Can Approve</CardTitle>
                <CardDescription>
                  These users have delegated their approval authority to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : delegatedToMe.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active delegations to you</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Delegator</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {delegatedToMe.map((delegation) => (
                        <TableRow key={delegation.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {delegation.delegator?.full_name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {delegation.delegator?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {delegation.template ? (
                              <Badge variant="outline">{delegation.template.name}</Badge>
                            ) : (
                              <Badge variant="secondary">
                                {getCategoryLabel(delegation.category)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{format(new Date(delegation.start_date), "MMM d, yyyy")}</p>
                              {delegation.end_date && (
                                <p className="text-muted-foreground">
                                  to {format(new Date(delegation.end_date), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {delegation.reason || "-"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Delegate Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Delegate</DialogTitle>
              <DialogDescription>
                Choose someone who can approve workflows on your behalf
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Delegate *</Label>
                <Select
                  value={formData.delegate_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, delegate_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Workflow Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as WorkflowCategory, template_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    min={formData.start_date}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g., On vacation, out of office..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Add Delegate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
