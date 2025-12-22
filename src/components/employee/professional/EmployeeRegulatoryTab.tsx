import { useState, useEffect, useRef } from "react";
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
import { Plus, Pencil, Archive, Stamp, CheckCircle, XCircle, Clock, Eye, Upload, FileText, X, Download } from "lucide-react";
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
  scope: string | null;
  consent_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
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
  scope: string;
  consent_date: string;
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      scope: "",
      consent_date: "",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (checkId: string): Promise<{ url: string; name: string } | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `regulatory/${employeeId}/${checkId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('compliance-documents')
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Failed to upload document");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('compliance-documents')
      .getPublicUrl(filePath);

    return { url: publicUrl, name: selectedFile.name };
  };

  const handleSubmit = async (data: RegulatoryFormData) => {
    try {
      setUploadingFile(true);
      
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
        scope: data.scope || null,
        consent_date: data.consent_date || null,
      };

      if (editingClearance) {
        let attachmentData = {};
        if (selectedFile) {
          const uploaded = await uploadFile(editingClearance.id);
          if (uploaded) {
            attachmentData = { attachment_url: uploaded.url, attachment_name: uploaded.name };
          }
        }

        const { error } = await supabase
          .from("employee_background_checks")
          .update({ ...payload, ...attachmentData })
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

        if (selectedFile && result) {
          const uploaded = await uploadFile(result.id);
          if (uploaded) {
            await supabase
              .from("employee_background_checks")
              .update({ attachment_url: uploaded.url, attachment_name: uploaded.name })
              .eq("id", result.id);
          }
        }
        
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
      setSelectedFile(null);
      setCurrentAttachment(null);
      form.reset();
      fetchClearances();
    } catch (error) {
      toast.error("Failed to save regulatory clearance");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (clearance: RegulatoryClearance) => {
    setEditingClearance(clearance);
    setCurrentAttachment(clearance.attachment_url ? { url: clearance.attachment_url, name: clearance.attachment_name || 'Document' } : null);
    setSelectedFile(null);
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
      scope: clearance.scope || "",
      consent_date: clearance.consent_date || "",
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
    setSelectedFile(null);
    setCurrentAttachment(null);
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
      scope: "",
      consent_date: "",
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

  const getScopeBadge = (scope: string | null) => {
    if (!scope) return null;
    const labels: Record<string, string> = {
      local: "Local",
      regional: "Regional",
      national: "National",
      international: "International",
    };
    return <Badge variant="outline" className="text-xs">{labels[scope] || scope}</Badge>;
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClearance ? "Edit Clearance" : "Add Regulatory Clearance"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Row 1: Clearance Type, Jurisdiction, Scope */}
                  <div className="grid grid-cols-3 gap-4">
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
                              <SelectItem value="insurance">Insurance Clearance</SelectItem>
                              <SelectItem value="telecommunications">Telecommunications Clearance</SelectItem>
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
                    <FormField
                      control={form.control}
                      name="scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scope</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select scope..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="local">Local</SelectItem>
                              <SelectItem value="regional">Regional</SelectItem>
                              <SelectItem value="national">National</SelectItem>
                              <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Provider, Reference Number */}
                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Clearance ID" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Requested Date, Consent Date, Completed Date */}
                  <div className="grid grid-cols-3 gap-4">
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
                      name="consent_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consent Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
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

                  {/* Row 4: Status, Result, Expiry Date */}
                  <div className="grid grid-cols-3 gap-4">
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
                              <SelectItem value="inconclusive">Inconclusive</SelectItem>
                            </SelectContent>
                          </Select>
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

                  {/* Row 5: Attachment */}
                  <div className="space-y-2">
                    <FormLabel>Attachment</FormLabel>
                    <div className="border rounded-md p-4 space-y-3">
                      {currentAttachment && !selectedFile && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{currentAttachment.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(currentAttachment.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentAttachment(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedFile && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{selectedFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {selectedFile || currentAttachment ? "Replace File" : "Upload Document"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          PDF, Word, or Image (max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 6: Notes */}
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
                    <Button type="submit" disabled={uploadingFile}>
                      {uploadingFile ? "Saving..." : editingClearance ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingClearance} onOpenChange={() => setViewingClearance(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">{viewingClearance?.check_type.replace("_", " ")} Details</DialogTitle>
          </DialogHeader>
          {viewingClearance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Clearance Type</p>
                  <p className="capitalize">{viewingClearance.check_type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(viewingClearance.status)}
                </div>
                {viewingClearance.jurisdiction && (
                  <div>
                    <p className="text-muted-foreground">Jurisdiction</p>
                    <p>{viewingClearance.jurisdiction}</p>
                  </div>
                )}
                {viewingClearance.scope && (
                  <div>
                    <p className="text-muted-foreground">Scope</p>
                    <p className="capitalize">{viewingClearance.scope}</p>
                  </div>
                )}
                {viewingClearance.provider && (
                  <div>
                    <p className="text-muted-foreground">Regulatory Body</p>
                    <p>{viewingClearance.provider}</p>
                  </div>
                )}
                {viewingClearance.reference_number && (
                  <div>
                    <p className="text-muted-foreground">Reference</p>
                    <p>{viewingClearance.reference_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Requested Date</p>
                  <p>{formatDateForDisplay(viewingClearance.requested_date)}</p>
                </div>
                {viewingClearance.consent_date && (
                  <div>
                    <p className="text-muted-foreground">Consent Date</p>
                    <p>{formatDateForDisplay(viewingClearance.consent_date)}</p>
                  </div>
                )}
                {viewingClearance.completed_date && (
                  <div>
                    <p className="text-muted-foreground">Completed Date</p>
                    <p>{formatDateForDisplay(viewingClearance.completed_date)}</p>
                  </div>
                )}
                {viewingClearance.expiry_date && (
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p>{formatDateForDisplay(viewingClearance.expiry_date)}</p>
                  </div>
                )}
                {canViewResults && viewingClearance.result && (
                  <div>
                    <p className="text-muted-foreground">Result</p>
                    <p className="capitalize">{viewingClearance.result}</p>
                  </div>
                )}
              </div>
              {viewingClearance.attachment_url && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Attachment</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewingClearance.attachment_url!, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {viewingClearance.attachment_name || 'Download Document'}
                  </Button>
                </div>
              )}
              {canViewNotes && viewingClearance.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{viewingClearance.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Card key={clearance.id} className={clearance.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getComplianceIndicator(clearance)}
                    <CardTitle className="text-base capitalize">
                      {clearance.check_type.replace("_", " ")}
                    </CardTitle>
                    {getStatusBadge(clearance.status)}
                    {getScopeBadge(clearance.scope)}
                    {clearance.attachment_url && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex gap-1">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>{" "}
                    {formatDateForDisplay(clearance.requested_date)}
                  </div>
                  {clearance.jurisdiction && (
                    <div>
                      <span className="text-muted-foreground">Jurisdiction:</span>{" "}
                      {clearance.jurisdiction}
                    </div>
                  )}
                  {clearance.consent_date && (
                    <div>
                      <span className="text-muted-foreground">Consent:</span>{" "}
                      {formatDateForDisplay(clearance.consent_date)}
                    </div>
                  )}
                  {canViewResults && clearance.result && (
                    <div>
                      <span className="text-muted-foreground">Result:</span>{" "}
                      <span className="capitalize">{clearance.result}</span>
                    </div>
                  )}
                  {clearance.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {formatDateForDisplay(clearance.expiry_date)}
                    </div>
                  )}
                  {clearance.provider && (
                    <div>
                      <span className="text-muted-foreground">Regulatory Body:</span>{" "}
                      {clearance.provider}
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
