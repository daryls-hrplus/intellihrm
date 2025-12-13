import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TrainingRequestsTabProps {
  companyId: string;
}

interface TrainingRequest {
  id: string;
  request_number: string;
  request_type: string;
  training_name: string;
  provider_name: string | null;
  start_date: string | null;
  end_date: string | null;
  estimated_cost: number | null;
  currency: string;
  status: string;
  business_justification: string | null;
  employee: { full_name: string } | null;
  created_at: string;
}

export function TrainingRequestsTab({ companyId }: TrainingRequestsTabProps) {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    request_type: "external",
    training_name: "",
    provider_name: "",
    start_date: "",
    end_date: "",
    estimated_cost: "",
    currency: "USD",
    location: "",
    business_justification: "",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [requestsRes, employeesRes] = await Promise.all([
      supabase
        .from("training_requests")
        .select("*, employee:profiles!training_requests_employee_id_fkey(full_name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      // @ts-ignore - Supabase type instantiation issue
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (requestsRes.data) setRequests(requestsRes.data);
    if (employeesRes.data) setEmployees(employeesRes.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.training_name) {
      toast.error("Employee and training name are required");
      return;
    }

    const { error } = await supabase.from("training_requests").insert({
      company_id: companyId,
      employee_id: formData.employee_id,
      request_type: formData.request_type,
      training_name: formData.training_name,
      provider_name: formData.provider_name || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      currency: formData.currency,
      location: formData.location || null,
      business_justification: formData.business_justification || null,
    });

    if (error) {
      toast.error("Failed to create request");
    } else {
      toast.success("Training request created");
      setDialogOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("training_requests")
      .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Request ${status}`);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      request_type: "external",
      training_name: "",
      provider_name: "",
      start_date: "",
      end_date: "",
      estimated_cost: "",
      currency: "USD",
      location: "",
      business_justification: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Requests</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Request</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Training Request</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select value={formData.request_type} onValueChange={(v) => setFormData({ ...formData, request_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External Training</SelectItem>
                    <SelectItem value="internal">Internal Training</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Training Name *</Label>
                <Input value={formData.training_name} onChange={(e) => setFormData({ ...formData, training_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input value={formData.provider_name} onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Cost</Label>
                <Input type="number" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Business Justification</Label>
                <Textarea value={formData.business_justification} onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Create Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request #</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Training</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-sm">{req.request_number}</TableCell>
                <TableCell>{req.employee?.full_name}</TableCell>
                <TableCell>{req.training_name}</TableCell>
                <TableCell className="capitalize">{req.request_type}</TableCell>
                <TableCell>
                  {req.start_date && format(new Date(req.start_date), "MMM d, yyyy")}
                  {req.end_date && ` - ${format(new Date(req.end_date), "MMM d, yyyy")}`}
                </TableCell>
                <TableCell>{req.estimated_cost ? `${req.currency} ${req.estimated_cost.toLocaleString()}` : "-"}</TableCell>
                <TableCell>{getStatusBadge(req.status)}</TableCell>
                <TableCell>
                  {req.status === "pending" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, "approved")}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, "rejected")}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">No training requests found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
