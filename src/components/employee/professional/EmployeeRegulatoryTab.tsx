import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Archive, Stamp, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useEnhancedPiiVisibility } from "@/hooks/useEnhancedPiiVisibility";
import { useAuditLog } from "@/hooks/useAuditLog";
import { CountrySelect } from "@/components/ui/country-select";

interface RegulatoryClearance {
  id: string;
  check_type: string;
  provider: string | null;
  requested_date: string;
  completed_date: string | null;
  status: string;
  result: string | null;
  reference_number: string | null;
  expiry_date: string | null;
  notes: string | null;
  jurisdiction: string | null;
  category: string;
}

interface RegulatoryFormData {
  check_type: string;
  provider: string;
  requested_date: string;
  completed_date: string;
  status: string;
  result: string;
  reference_number: string;
  expiry_date: string;
  notes: string;
  jurisdiction: string;
}

interface EmployeeRegulatoryTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeRegulatoryTab({ employeeId, viewType = "hr" }: EmployeeRegulatoryTabProps) {
  const [clearances, setClearances] = useState<RegulatoryClearance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClearance, setEditingClearance] = useState<RegulatoryClearance | null>(null);
  const [viewingClearance, setViewingClearance] = useState<RegulatoryClearance | null>(null);
  
  const { hasTabAccess } = useGranularPermissions();
  const { canViewDomain, maskPiiValue } = useEnhancedPiiVisibility();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "create");
  const canViewResults = viewType === "hr";
  const canViewNotes = viewType === "hr";

  const form = useForm<RegulatoryFormData>({
    defaultValues: {
      check_type: "financial_services",
      provider: "",
      requested_date: getTodayString(),
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
      jurisdiction: "",
    },
  });

  const fetchClearances = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_background_checks")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("category", "regulatory_clearance")
      .order("requested_date", { ascending: false });

    if (error) {
      toast.error("Failed to load regulatory clearances");
    } else {
      setClearances(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClearances();
  }, [employeeId]);

  const handleSubmit = async (data: RegulatoryFormData) => {
    try {
      const payload = {
        ...data,
        category: "regulatory_clearance",
        provider: data.provider || null,
        completed_date: data.completed_date || null,
        result: data.result || null,
        reference_number: data.reference_number || null,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
        jurisdiction: data.jurisdiction || null,
      };

      if (editingClearance) {
        const { error } = await supabase
          .from("employee_background_checks")
          .update(payload)
          .eq("id", editingClearance.id);

        if (error) throw error;
        
        await logAction({
          action: "UPDATE",
          entityType: "regulatory_clearance",
          entityId: editingClearance.id,
          entityName: data.check_type,
          newValues: payload,
        });
        
        toast.success("Regulatory clearance updated");
      } else {
        const { data: result, error } = await supabase
          .from("employee_background_checks")
          .insert({ employee_id: employeeId, ...payload })
          .select()
          .single();

        if (error) throw error;
        
        await logAction({
          action: "CREATE",
          entityType: "regulatory_clearance",
          entityId: result.id,
          entityName: data.check_type,
          newValues: payload,
        });
        
        toast.success("Regulatory clearance added");
      }

      setDialogOpen(false);
      setEditingClearance(null);
      form.reset();
      fetchClearances();
    } catch (error) {
      toast.error("Failed to save regulatory clearance");
    }
  };

  const handleEdit = (clearance: RegulatoryClearance) => {
    setEditingClearance(clearance);
    form.reset({
      check_type: clearance.check_type,
      provider: clearance.provider || "",
      requested_date: clearance.requested_date,
      completed_date: clearance.completed_date || "",
      status: clearance.status,
      result: clearance.result || "",
      reference_number: clearance.reference_number || "",
      expiry_date: clearance.expiry_date || "",
      notes: clearance.notes || "",
      jurisdiction: clearance.jurisdiction || "",
    });
    setDialogOpen(true);
  };

  const handleArchive = async (clearance: RegulatoryClearance) => {
    const { error } = await supabase
      .from("employee_background_checks")
      .update({ status: "archived" })
      .eq("id", clearance.id);

    if (error) {
      toast.error("Failed to archive clearance");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "regulatory_clearance",
        entityId: clearance.id,
        entityName: clearance.check_type,
        oldValues: { status: clearance.status },
        newValues: { status: "archived" },
      });
      toast.success("Clearance archived");
      fetchClearances();
    }
  };

  const openNewDialog = () => {
    setEditingClearance(null);
    form.reset({
      check_type: "financial_services",
      provider: "",
      requested_date: getTodayString(),
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
      jurisdiction: "",
    });
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string, result: string | null) => {
    if (status === "completed") {
      if (result === "clear" || result === "passed") {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      } else if (result === "failed" || result === "flagged") {
        return <XCircle className="h-4 w-4 text-destructive" />;
      }
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getComplianceIndicator = (clearance: RegulatoryClearance) => {
    if (clearance.status === "archived") return null;
    
    const now = new Date();
    const expiry = clearance.expiry_date ? new Date(clearance.expiry_date) : null;
    
    if (clearance.result === "failed" || clearance.result === "flagged") {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (expiry && expiry < now) {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (clearance.status === "pending" || clearance.status === "in_progress") {
      return <span className="text-yellow-500 font-medium">⚠</span>;
    }
    if (clearance.result === "clear" || clearance.result === "passed") {
      return <span className="text-green-500 font-medium">✔</span>;
    }
    return <span className="text-yellow-500 font-medium">⚠</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">Regulatory Clearances</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Industry-specific clearances required by regulatory bodies (e.g., Financial Services, Healthcare, Aviation, Maritime, Gaming)
          </p>
        </div>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Clearance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingClearance ? "Edit Clearance" : "Add Regulatory Clearance"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="check_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clearance Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="financial_services">Financial Services Clearance</SelectItem>
                              <SelectItem value="healthcare">Healthcare Clearance</SelectItem>
                              <SelectItem value="legal">Legal Clearance</SelectItem>
                              <SelectItem value="aviation">Aviation Clearance</SelectItem>
                              <SelectItem value="maritime">Maritime Clearance</SelectItem>
                              <SelectItem value="gaming">Gaming License Clearance</SelectItem>
                              <SelectItem value="securities">Securities Clearance</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurisdiction</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value}
                              onChange={field.onChange}
                              valueType="name"
                              placeholder="Select jurisdiction"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regulatory Body / Provider</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Central Bank, FAA, etc." />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requested_date"
                      rules={{ required: "Requested date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="completed_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completed Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Result</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select result..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="clear">Clear</SelectItem>
                              <SelectItem value="passed">Passed</SelectItem>
                              <SelectItem value="flagged">Flagged</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (HR Only)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : clearances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Stamp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No regulatory clearances on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clearances.map((clearance) => (
            <Card key={clearance.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(clearance.status, clearance.result)}
                    <CardTitle className="text-base capitalize">
                      {clearance.check_type.replace(/_/g, " ")}
                    </CardTitle>
                    {getStatusBadge(clearance.status)}
                    {viewType !== "ess" && getComplianceIndicator(clearance)}
                    {canViewResults && clearance.result && (
                      <Badge
                        variant={clearance.result === "clear" || clearance.result === "passed" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {clearance.result}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {viewType === "hr" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setViewingClearance(clearance)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && clearance.status !== "archived" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(clearance)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleArchive(clearance)}>
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {viewType === "hr" && clearance.jurisdiction && (
                    <div>
                      <span className="text-muted-foreground">Jurisdiction:</span> {clearance.jurisdiction}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Status:</span> {clearance.status}
                  </div>
                  {viewType === "hr" && (
                    <div>
                      <span className="text-muted-foreground">Requested:</span>{" "}
                      {formatDateForDisplay(clearance.requested_date)}
                    </div>
                  )}
                  {viewType === "hr" && clearance.completed_date && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      {formatDateForDisplay(clearance.completed_date)}
                    </div>
                  )}
                  {clearance.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {formatDateForDisplay(clearance.expiry_date)}
                    </div>
                  )}
                  {viewType === "ess" && (
                    <div>
                      <span className="text-muted-foreground">Action Required:</span>{" "}
                      {clearance.status === "pending" ? "Yes" : "No"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog for HR */}
      <Dialog open={!!viewingClearance} onOpenChange={(open) => !open && setViewingClearance(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Regulatory Clearance Details</DialogTitle>
          </DialogHeader>
          {viewingClearance && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
                  <p className="capitalize">{viewingClearance.check_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Jurisdiction</h4>
                  <p>{viewingClearance.jurisdiction || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Regulatory Body</h4>
                  <p>{viewingClearance.provider || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Reference Number</h4>
                  <p>{viewingClearance.reference_number || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                  {getStatusBadge(viewingClearance.status)}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Result</h4>
                  {viewingClearance.result ? (
                    <Badge
                      variant={viewingClearance.result === "clear" || viewingClearance.result === "passed" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {viewingClearance.result}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Dates</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>{" "}
                    {formatDateForDisplay(viewingClearance.requested_date)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed:</span>{" "}
                    {viewingClearance.completed_date ? formatDateForDisplay(viewingClearance.completed_date) : "Pending"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry:</span>{" "}
                    {viewingClearance.expiry_date ? formatDateForDisplay(viewingClearance.expiry_date) : "N/A"}
                  </div>
                </div>
              </div>

              {canViewNotes && viewingClearance.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Notes (HR Only)</h4>
                  <p className="text-sm text-muted-foreground">{viewingClearance.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
