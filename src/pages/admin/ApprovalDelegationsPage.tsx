import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Helper to avoid deep type instantiation
const query = (table: string) => supabase.from(table as any);
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isBefore, isAfter } from "date-fns";
import { formatDateForDisplay, parseLocalDate } from "@/utils/dateUtils";
import { Plus, UserCheck, Calendar, Trash2 } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

interface Delegation {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  is_active: boolean;
  delegator: { full_name: string };
  delegate: { full_name: string };
}

interface Employee {
  id: string;
  full_name: string;
}

export default function ApprovalDelegationsPage() {
  usePageAudit('approval_delegations', 'Admin');
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    delegate_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const delegRes: any = await query("approval_delegations")
        .select("*")
        .or(`delegator_id.eq.${user.id},delegate_id.eq.${user.id}`)
        .order("start_date", { ascending: false });

      const delegData = delegRes.data || [];

      // Fetch delegator/delegate names separately
      const delegationsWithNames: Delegation[] = [];
      for (const deleg of delegData) {
        const delegatorRes: any = await query("profiles").select("full_name").eq("id", deleg.delegator_id).single();
        const delegateRes: any = await query("profiles").select("full_name").eq("id", deleg.delegate_id).single();
        delegationsWithNames.push({
          ...deleg,
          delegator: { full_name: delegatorRes.data?.full_name || "Unknown" },
          delegate: { full_name: delegateRes.data?.full_name || "Unknown" },
        });
      }

      const empRes: any = await query("profiles")
        .select("id, full_name")
        .neq("id", user.id)
        .eq("is_active", true)
        .order("full_name");

      setDelegations(delegationsWithNames);
      setEmployees((empRes.data || []) as Employee[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile?.company_id || !formData.delegate_id || !formData.start_date || !formData.end_date) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (parseLocalDate(formData.end_date)! < parseLocalDate(formData.start_date)!) {
      toast({ title: "Error", description: "End date must be after start date", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("approval_delegations").insert({
        delegator_id: user.id,
        delegate_id: formData.delegate_id,
        company_id: profile.company_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null,
        is_active: true,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Delegation created successfully" });
      setDialogOpen(false);
      setFormData({ delegate_id: "", start_date: "", end_date: "", reason: "" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create delegation", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delegation?")) return;

    try {
      await supabase.from("approval_delegations").delete().eq("id", id);
      toast({ title: "Success", description: "Delegation removed" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove delegation", variant: "destructive" });
    }
  };

  const getDelegationStatus = (delegation: Delegation) => {
    const today = new Date();
    const start = parseLocalDate(delegation.start_date);
    const end = parseLocalDate(delegation.end_date);

    if (!delegation.is_active) return { label: "Inactive", color: "bg-muted text-muted-foreground" };
    if (start && isBefore(today, start)) return { label: "Scheduled", color: "bg-blue-500/20 text-blue-700" };
    if (end && isAfter(today, end)) return { label: "Expired", color: "bg-red-500/20 text-red-700" };
    return { label: "Active", color: "bg-green-500/20 text-green-700" };
  };

  const breadcrumbItems = [
    { label: "Admin & Security", href: "/admin" },
    { label: "Approval Delegations" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Approval Delegations</h1>
            <p className="text-muted-foreground">Delegate your approvals when you're away</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Delegation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Delegations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : delegations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No delegations configured</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delegator</TableHead>
                    <TableHead>Delegate To</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delegations.map((del) => {
                    const status = getDelegationStatus(del);
                    return (
                      <TableRow key={del.id}>
                        <TableCell className="font-medium">{del.delegator.full_name}</TableCell>
                        <TableCell>{del.delegate.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDateForDisplay(del.start_date, "MMM d")} - {formatDateForDisplay(del.end_date, "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{del.reason || "-"}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {del.delegator.full_name === profile?.full_name && (
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(del.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Approval Delegation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Delegate To</Label>
                <Select value={formData.delegate_id} onValueChange={(v) => setFormData({ ...formData, delegate_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person to delegate to" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Annual leave, business trip..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Delegation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
