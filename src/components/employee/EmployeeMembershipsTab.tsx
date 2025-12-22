import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Archive, CheckCircle, AlertTriangle, XCircle, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";
import { useAuditLog } from "@/hooks/useAuditLog";

interface EmployeeMembershipsTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

interface MembershipFormData {
  organization_name: string;
  membership_type: string;
  membership_number: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

// Industry-standard membership types aligned with professional bodies (CIPD, ACCA, ICAEW, IEEE, CPA, PMP, etc.)
const MEMBERSHIP_TYPES = [
  { value: "student", label: "Student" },
  { value: "affiliate", label: "Affiliate" },
  { value: "associate", label: "Associate" },
  { value: "member", label: "Member" },
  { value: "chartered_member", label: "Chartered Member" },
  { value: "fellow", label: "Fellow" },
  { value: "chartered_fellow", label: "Chartered Fellow" },
  { value: "honorary", label: "Honorary" },
  { value: "lifetime", label: "Lifetime" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "pending_renewal", label: "Pending Renewal" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Cancelled" },
];

export function EmployeeMembershipsTab({ employeeId, viewType = "hr" }: EmployeeMembershipsTabProps) {
  const queryClient = useQueryClient();
  const { logAction } = useAuditLog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MembershipFormData>({
    organization_name: "",
    membership_type: "",
    membership_number: "",
    start_date: getTodayString(),
    end_date: "",
    status: "active",
    notes: "",
  });

  const isHR = viewType === "hr";
  const isManager = viewType === "manager";
  const isESS = viewType === "ess";
  const canAdd = isHR || isManager || isESS;
  const canArchive = isHR;

  const { data: memberships, isLoading } = useQuery({
    queryKey: ["employee-memberships", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_memberships")
        .select("*")
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Compute status with auto-detection for pending renewal
  const processedMemberships = useMemo(() => {
    if (!memberships) return [];
    return memberships.map((m) => {
      let computedStatus = m.status;
      if (m.end_date && m.status === "active") {
        const daysUntilExpiry = differenceInDays(new Date(m.end_date), new Date());
        if (daysUntilExpiry < 0) {
          computedStatus = "expired";
        } else if (daysUntilExpiry <= 30) {
          computedStatus = "pending_renewal";
        }
      }
      return { ...m, computedStatus };
    });
  }, [memberships]);

  const saveMutation = useMutation({
    mutationFn: async (data: MembershipFormData) => {
      const payload = {
        employee_id: employeeId,
        organization_name: data.organization_name,
        membership_type: data.membership_type,
        membership_number: data.membership_number || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        status: data.status,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_memberships").update(payload).eq("id", editingId);
        if (error) throw error;
        await logAction({
          action: "UPDATE",
          entityType: "employee_membership",
          entityId: editingId,
          entityName: data.organization_name,
          newValues: payload,
        });
      } else {
        const { data: inserted, error } = await supabase.from("employee_memberships").insert(payload).select().single();
        if (error) throw error;
        await logAction({
          action: "CREATE",
          entityType: "employee_membership",
          entityId: inserted.id,
          entityName: data.organization_name,
          newValues: payload,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-memberships", employeeId] });
      toast.success(editingId ? "Membership updated" : "Membership added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save membership"),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_memberships").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
      await logAction({
        action: "UPDATE",
        entityType: "employee_membership",
        entityId: id,
        entityName: "Membership",
        newValues: { status: "cancelled" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-memberships", employeeId] });
      toast.success("Membership archived");
    },
    onError: () => toast.error("Failed to archive membership"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      organization_name: "",
      membership_type: "",
      membership_number: "",
      start_date: getTodayString(),
      end_date: "",
      status: "active",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    // ESS can only edit active memberships
    if (isESS && item.status !== "active") {
      toast.error("You can only edit active memberships");
      return;
    }
    setEditingId(item.id);
    setFormData({
      organization_name: item.organization_name,
      membership_type: item.membership_type,
      membership_number: item.membership_number || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      status: item.status,
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending_renewal":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "expired":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "suspended":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      expired: { variant: "destructive", label: "Expired" },
      pending_renewal: { variant: "outline", label: "Pending Renewal" },
      suspended: { variant: "secondary", label: "Suspended" },
      cancelled: { variant: "secondary", label: "Cancelled" },
    };
    const config = statusConfig[status] || { variant: "secondary", label: status };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    );
  };

  const getMembershipTypeLabel = (value: string) => {
    const type = MEMBERSHIP_TYPES.find((t) => t.value === value);
    return type?.label || value;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professional Memberships
          </CardTitle>
          <CardDescription>
            Track memberships in professional bodies, associations, and industry organizations (e.g., CIPD, ACCA, IEEE, CPA, PMP bodies)
          </CardDescription>
        </div>
        {canAdd && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Membership
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : processedMemberships.length === 0 ? (
          <p className="text-muted-foreground">No memberships found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Association/Organization</TableHead>
                <TableHead>Membership Type</TableHead>
                <TableHead>Membership ID</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                {(isHR || isManager) && <TableHead>Notes</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedMemberships.map((item) => (
                <TableRow key={item.id} className={item.computedStatus === "cancelled" ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{item.organization_name}</TableCell>
                  <TableCell>{getMembershipTypeLabel(item.membership_type)}</TableCell>
                  <TableCell>{item.membership_number || "-"}</TableCell>
                  <TableCell>{format(new Date(item.start_date), "PP")}</TableCell>
                  <TableCell>{item.end_date ? format(new Date(item.end_date), "PP") : "-"}</TableCell>
                  <TableCell>{getStatusBadge(item.computedStatus)}</TableCell>
                  {(isHR || isManager) && (
                    <TableCell className="max-w-[200px] truncate" title={item.notes || ""}>
                      {item.notes || "-"}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex gap-1">
                      {(isHR || isManager || (isESS && item.status === "active")) && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canArchive && item.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => archiveMutation.mutate(item.id)}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Membership" : "Add Membership"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Row 1: Organization, Type, ID */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Association/Organization Name *</Label>
                <Input
                  value={formData.organization_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organization_name: e.target.value }))}
                  placeholder="e.g., CIPD, IEEE, ACCA"
                />
              </div>
              <div className="grid gap-2">
                <Label>Membership Type *</Label>
                <Select
                  value={formData.membership_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, membership_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Membership ID</Label>
                <Input
                  value={formData.membership_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, membership_number: e.target.value }))}
                  placeholder="e.g., MEM-12345"
                />
              </div>
            </div>

            {/* Row 2: Dates and Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date (Expiry)</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Notes (full width) */}
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details about this membership..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.organization_name || !formData.membership_type || !formData.start_date}
            >
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
