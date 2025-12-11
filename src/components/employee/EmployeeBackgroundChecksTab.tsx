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
import { Plus, Pencil, Trash2, ShieldCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

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
  start_date: string;
  end_date: string;
}

interface EmployeeBackgroundChecksTabProps {
  employeeId: string;
}

export function EmployeeBackgroundChecksTab({ employeeId }: EmployeeBackgroundChecksTabProps) {
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<BackgroundCheck | null>(null);

  const form = useForm<BackgroundCheckFormData>({
    defaultValues: {
      check_type: "criminal",
      provider: "",
      requested_date: new Date().toISOString().split("T")[0],
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const fetchChecks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_background_checks")
      .select("*")
      .eq("employee_id", employeeId)
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
        toast.success("Background check updated");
      } else {
        const { error } = await supabase.from("employee_background_checks").insert({
          employee_id: employeeId,
          ...payload,
        });

        if (error) throw error;
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

  const handleEdit = (check: any) => {
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
      start_date: check.start_date || new Date().toISOString().split("T")[0],
      end_date: check.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employee_background_checks").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete background check");
    } else {
      toast.success("Background check deleted");
      fetchChecks();
    }
  };

  const openNewDialog = () => {
    setEditingCheck(null);
    form.reset({
      check_type: "criminal",
      provider: "",
      requested_date: new Date().toISOString().split("T")[0],
      completed_date: "",
      status: "pending",
      result: "",
      reference_number: "",
      expiry_date: "",
      notes: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Background Checks</h3>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
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
                      <FormLabel>Notes</FormLabel>
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
      </div>

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
            <Card key={check.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status, check.result)}
                    <CardTitle className="text-base capitalize">
                      {check.check_type.replace("_", " ")}
                    </CardTitle>
                    {getStatusBadge(check.status)}
                    {check.result && (
                      <Badge 
                        variant={check.result === "clear" || check.result === "passed" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {check.result}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(check)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(check.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>{" "}
                    {format(new Date(check.requested_date), "MMM d, yyyy")}
                  </div>
                  {check.completed_date && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      {format(new Date(check.completed_date), "MMM d, yyyy")}
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
