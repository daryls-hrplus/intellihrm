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
import { Plus, Pencil, Archive, ShieldCheck, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";

interface BackgroundCheck {
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
  category: string | null;
}

interface BackgroundCheckFormData {
  check_type: string;
  provider: string;
  requested_date: string;
  completed_date: string;
  status: string;
  result: string;
  reference_number: string;
  expiry_date: string;
  notes: string;
}

interface EmployeeBackgroundChecksTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeBackgroundChecksTab({ employeeId, viewType = "hr" }: EmployeeBackgroundChecksTabProps) {
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<BackgroundCheck | null>(null);
  const [viewingCheck, setViewingCheck] = useState<BackgroundCheck | null>(null);

  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "create");
  const canViewResults = viewType === "hr";
  const canViewNotes = viewType === "hr";

  const form = useForm<BackgroundCheckFormData>({
    defaultValues: {
      check_type: "criminal",
      provider: "",
      requested_date: getTodayString(),
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
    },
  });

  const fetchChecks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_background_checks")
      .select("*")
      .eq("employee_id", employeeId)
      .or("category.is.null,category.eq.background_check")
      .order("requested_date", { ascending: false });

    if (error) {
      toast.error("Failed to load background checks");
    } else {
      setChecks(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChecks();
  }, [employeeId]);

  const handleSubmit = async (data: BackgroundCheckFormData) => {
    try {
      const payload = {
        ...data,
        category: "background_check",
        provider: data.provider || null,
        completed_date: data.completed_date || null,
        result: data.result || null,
        reference_number: data.reference_number || null,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
      };

      if (editingCheck) {
        const { error } = await supabase
          .from("employee_background_checks")
          .update(payload)
          .eq("id", editingCheck.id);

        if (error) throw error;
        
        await logAction({
          action: "UPDATE",
          entityType: "background_check",
          entityId: editingCheck.id,
          entityName: data.check_type,
          newValues: payload,
        });
        
        toast.success("Background check updated");
      } else {
        const { data: result, error } = await supabase.from("employee_background_checks").insert({
          employee_id: employeeId,
          ...payload,
        }).select().single();

        if (error) throw error;
        
        await logAction({
          action: "CREATE",
          entityType: "background_check",
          entityId: result.id,
          entityName: data.check_type,
          newValues: payload,
        });
        
        toast.success("Background check added");
      }

      setDialogOpen(false);
      setEditingCheck(null);
      form.reset();
      fetchChecks();
    } catch (error) {
      toast.error("Failed to save background check");
    }
  };

  const handleEdit = (check: BackgroundCheck) => {
    setEditingCheck(check);
    form.reset({
      check_type: check.check_type,
      provider: check.provider || "",
      requested_date: check.requested_date,
      completed_date: check.completed_date || "",
      status: check.status,
      result: check.result || "",
      reference_number: check.reference_number || "",
      expiry_date: check.expiry_date || "",
      notes: check.notes || "",
    });
    setDialogOpen(true);
  };

  const handleArchive = async (check: BackgroundCheck) => {
    const { error } = await supabase
      .from("employee_background_checks")
      .update({ status: "archived" })
      .eq("id", check.id);

    if (error) {
      toast.error("Failed to archive background check");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "background_check",
        entityId: check.id,
        entityName: check.check_type,
        oldValues: { status: check.status },
        newValues: { status: "archived" },
      });
      toast.success("Background check archived");
      fetchChecks();
    }
  };

  const openNewDialog = () => {
    setEditingCheck(null);
    form.reset({
      check_type: "criminal",
      provider: "",
      requested_date: getTodayString(),
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
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

  const getComplianceIndicator = (check: BackgroundCheck) => {
    if (check.status === "archived") return null;
    
    if (check.result === "failed" || check.result === "flagged") {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (check.status === "pending" || check.status === "in_progress") {
      return <span className="text-yellow-500 font-medium">⚠</span>;
    }
    if (check.result === "clear" || check.result === "passed") {
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

  // ESS View - Simplified status card
  if (viewType === "ess") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Background Checks</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : checks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No background checks on file
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {checks.filter(c => c.status !== "archived").map((check) => (
              <Card key={check.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status, check.result)}
                      <div>
                        <p className="font-medium capitalize">{check.check_type.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {check.status === "completed" ? "Completed" : "In Progress"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Manager View - Limited list (no results visible)
  if (viewType === "manager") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Background Checks</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : checks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No background checks on file
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {checks.filter(c => c.status !== "archived").map((check) => (
              <Card key={check.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getComplianceIndicator(check)}
                      <CardTitle className="text-base capitalize">
                        {check.check_type.replace("_", " ")}
                      </CardTitle>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Requested:</span>{" "}
                      {formatDateForDisplay(check.requested_date)}
                    </div>
                    {check.expiry_date && (
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{" "}
                        {formatDateForDisplay(check.expiry_date)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // HR View - Full access
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Background Checks</h3>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Background Check
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCheck ? "Edit Background Check" : "Add Background Check"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="check_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="criminal">Criminal Record</SelectItem>
                              <SelectItem value="credit">Credit Check</SelectItem>
                              <SelectItem value="employment">Employment Verification</SelectItem>
                              <SelectItem value="education">Education Verification</SelectItem>
                              <SelectItem value="drug_test">Drug Test</SelectItem>
                              <SelectItem value="identity">Identity Verification</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Background check company" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

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

      {/* Detail View Dialog */}
      <Dialog open={!!viewingCheck} onOpenChange={() => setViewingCheck(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Background Check Details</DialogTitle>
          </DialogHeader>
          {viewingCheck && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{viewingCheck.check_type.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(viewingCheck.status)}</div>
                </div>
                {viewingCheck.provider && (
                  <div>
                    <span className="text-muted-foreground">Provider:</span>
                    <p className="font-medium">{viewingCheck.provider}</p>
                  </div>
                )}
                {viewingCheck.reference_number && (
                  <div>
                    <span className="text-muted-foreground">Reference:</span>
                    <p className="font-medium">{viewingCheck.reference_number}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Requested:</span>
                  <p className="font-medium">{formatDateForDisplay(viewingCheck.requested_date)}</p>
                </div>
                {viewingCheck.completed_date && (
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <p className="font-medium">{formatDateForDisplay(viewingCheck.completed_date)}</p>
                  </div>
                )}
                {canViewResults && viewingCheck.result && (
                  <div>
                    <span className="text-muted-foreground">Result:</span>
                    <Badge 
                      variant={viewingCheck.result === "clear" || viewingCheck.result === "passed" ? "default" : "destructive"}
                      className="mt-1 capitalize"
                    >
                      {viewingCheck.result}
                    </Badge>
                  </div>
                )}
              </div>
              {viewingCheck.notes && canViewNotes && (
                <div>
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{viewingCheck.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : checks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No background checks on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {checks.map((check) => (
            <Card key={check.id} className={check.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getComplianceIndicator(check)}
                    {getStatusIcon(check.status, check.result)}
                    <CardTitle className="text-base capitalize">
                      {check.check_type.replace("_", " ")}
                    </CardTitle>
                    {getStatusBadge(check.status)}
                    {canViewResults && check.result && (
                      <Badge 
                        variant={check.result === "clear" || check.result === "passed" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {check.result}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingCheck(check)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && check.status !== "archived" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(check)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleArchive(check)}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>{" "}
                    {formatDateForDisplay(check.requested_date)}
                  </div>
                  {check.completed_date && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      {formatDateForDisplay(check.completed_date)}
                    </div>
                  )}
                  {check.provider && (
                    <div>
                      <span className="text-muted-foreground">Provider:</span> {check.provider}
                    </div>
                  )}
                  {check.reference_number && (
                    <div>
                      <span className="text-muted-foreground">Reference:</span> {check.reference_number}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
