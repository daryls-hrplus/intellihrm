import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Plus, Pencil, Archive, FileCheck, AlertCircle, Upload, FileText, X, Download, Eye, ChevronDown, ChevronRight, HelpCircle, Calendar, Clock, DollarSign, Building2, FileSignature, RotateCcw, Info } from "lucide-react";
import { isBefore, differenceInDays, addYears } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CountrySelect } from "@/components/ui/country-select";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useEnhancedPiiVisibility } from "@/hooks/useEnhancedPiiVisibility";
import { useAuditLog } from "@/hooks/useAuditLog";

interface WorkPermit {
  id: string;
  permit_type: string;
  permit_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  sponsoring_company: string | null;
  notes: string | null;
  document_url: string | null;
  document_name: string | null;
  // New fields from database
  application_date: string | null;
  approval_date: string | null;
  fee_amount: number | null;
  fee_currency: string | null;
  fee_paid_date: string | null;
  fee_due_date: string | null;
  term_limit_years: number | null;
  max_renewals: number | null;
  current_renewal_count: number | null;
  is_initial_permit: boolean | null;
  previous_permit_id: string | null;
  port_of_entry: string | null;
  permit_conditions: string[] | null;
  application_reference: string | null;
  issuing_authority: string | null;
}

interface WorkPermitFormData {
  permit_type: string;
  permit_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  sponsoring_company: string;
  notes: string;
  // New fields
  application_date: string;
  approval_date: string;
  fee_amount: string;
  fee_currency: string;
  fee_paid_date: string;
  fee_due_date: string;
  term_limit_years: string;
  max_renewals: string;
  is_initial_permit: boolean;
  previous_permit_id: string;
  port_of_entry: string;
  permit_conditions: string;
  application_reference: string;
  issuing_authority: string;
}

interface EmployeeWorkPermitsTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

// Tooltip helper component
function FieldTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Section header component for collapsible sections
function SectionHeader({ 
  icon: Icon, 
  title, 
  isOpen, 
  tooltip 
}: { 
  icon: React.ElementType; 
  title: string; 
  isOpen: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-sm">{title}</span>
      {tooltip && <FieldTooltip content={tooltip} />}
    </div>
  );
}

export function EmployeeWorkPermitsTab({ employeeId, viewType = "hr" }: EmployeeWorkPermitsTabProps) {
  const [permits, setPermits] = useState<WorkPermit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<WorkPermit | null>(null);
  const [viewingPermit, setViewingPermit] = useState<WorkPermit | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Section open states
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [sponsorshipOpen, setSponsorshipOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);

  const { hasTabAccess } = useGranularPermissions();
  const { canViewDomain, maskPiiValue } = useEnhancedPiiVisibility();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "edit");
  const canAdd = viewType === "hr" && hasTabAccess("workforce", "compliance_legal", "create");
  const canViewDetails = viewType === "hr";
  const canViewNotes = viewType === "hr";

  const form = useForm<WorkPermitFormData>({
    defaultValues: {
      permit_type: "work_visa",
      permit_number: "",
      issuing_country: "",
      issue_date: "",
      expiry_date: "",
      status: "active",
      sponsoring_company: "",
      notes: "",
      application_date: "",
      approval_date: "",
      fee_amount: "",
      fee_currency: "USD",
      fee_paid_date: "",
      fee_due_date: "",
      term_limit_years: "",
      max_renewals: "",
      is_initial_permit: true,
      previous_permit_id: "",
      port_of_entry: "",
      permit_conditions: "",
      application_reference: "",
      issuing_authority: "",
    },
  });

  const watchIsInitialPermit = form.watch("is_initial_permit");
  const watchExpiryDate = form.watch("expiry_date");
  const watchIssueDate = form.watch("issue_date");

  // Calculate days until expiry
  const daysUntilExpiry = useMemo(() => {
    if (!watchExpiryDate) return null;
    return differenceInDays(new Date(watchExpiryDate), new Date());
  }, [watchExpiryDate]);

  // Get previous permits for dropdown (non-archived, not current)
  const previousPermitOptions = useMemo(() => {
    return permits.filter(p => 
      p.status !== "archived" && 
      (!editingPermit || p.id !== editingPermit.id)
    );
  }, [permits, editingPermit]);

  const fetchPermits = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_work_permits")
      .select("*")
      .eq("employee_id", employeeId)
      .order("expiry_date", { ascending: false });

    if (error) {
      toast.error("Failed to load work permits");
    } else {
      setPermits((data || []) as unknown as WorkPermit[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPermits();
  }, [employeeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (data: WorkPermitFormData) => {
    // Validation: expiry must be after issue
    if (data.issue_date && data.expiry_date && new Date(data.expiry_date) <= new Date(data.issue_date)) {
      toast.error("Expiry date must be after issue date");
      return;
    }
    
    // Validation: approval must be after application
    if (data.application_date && data.approval_date && new Date(data.approval_date) < new Date(data.application_date)) {
      toast.error("Approval date cannot be before application date");
      return;
    }

    setUploading(true);
    try {
      let documentUrl = editingPermit?.document_url || null;
      let documentName = editingPermit?.document_name || null;
      let documentSize = null;
      let documentMimeType = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `work-permits/${employeeId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("employee-documents")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("employee-documents")
          .getPublicUrl(filePath);

        documentUrl = urlData.publicUrl;
        documentName = selectedFile.name;
        documentSize = selectedFile.size;
        documentMimeType = selectedFile.type;
      }

      // Parse permit conditions from comma-separated string
      const permitConditions = data.permit_conditions 
        ? data.permit_conditions.split(",").map(c => c.trim()).filter(Boolean)
        : null;

      const payload = {
        permit_type: data.permit_type,
        permit_number: data.permit_number,
        issuing_country: data.issuing_country,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        status: data.status,
        sponsoring_company: data.sponsoring_company || null,
        notes: data.notes || null,
        document_url: documentUrl,
        document_name: documentName,
        document_size: documentSize,
        document_mime_type: documentMimeType,
        // New fields
        application_date: data.application_date || null,
        approval_date: data.approval_date || null,
        fee_amount: data.fee_amount ? parseFloat(data.fee_amount) : null,
        fee_currency: data.fee_currency || null,
        fee_paid_date: data.fee_paid_date || null,
        fee_due_date: data.fee_due_date || null,
        term_limit_years: data.term_limit_years ? parseInt(data.term_limit_years) : null,
        max_renewals: data.max_renewals ? parseInt(data.max_renewals) : null,
        is_initial_permit: data.is_initial_permit,
        previous_permit_id: data.previous_permit_id || null,
        port_of_entry: data.port_of_entry || null,
        permit_conditions: permitConditions,
        application_reference: data.application_reference || null,
        issuing_authority: data.issuing_authority || null,
      };

      if (editingPermit) {
        const { error } = await supabase
          .from("employee_work_permits")
          .update(payload)
          .eq("id", editingPermit.id);

        if (error) throw error;
        
        await logAction({
          action: "UPDATE",
          entityType: "work_permit",
          entityId: editingPermit.id,
          entityName: data.permit_type,
          newValues: payload,
        });
        
        toast.success("Work permit updated");
      } else {
        const { data: result, error } = await supabase.from("employee_work_permits").insert({
          employee_id: employeeId,
          ...payload,
        }).select().single();

        if (error) throw error;
        
        await logAction({
          action: "CREATE",
          entityType: "work_permit",
          entityId: result.id,
          entityName: data.permit_type,
          newValues: payload,
        });
        
        toast.success("Work permit added");
      }

      setDialogOpen(false);
      setEditingPermit(null);
      setSelectedFile(null);
      form.reset();
      fetchPermits();
    } catch (error) {
      toast.error("Failed to save work permit");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (permit: WorkPermit) => {
    setEditingPermit(permit);
    setSelectedFile(null);
    form.reset({
      permit_type: permit.permit_type,
      permit_number: permit.permit_number,
      issuing_country: permit.issuing_country,
      issue_date: permit.issue_date,
      expiry_date: permit.expiry_date,
      status: permit.status,
      sponsoring_company: permit.sponsoring_company || "",
      notes: permit.notes || "",
      application_date: permit.application_date || "",
      approval_date: permit.approval_date || "",
      fee_amount: permit.fee_amount?.toString() || "",
      fee_currency: permit.fee_currency || "USD",
      fee_paid_date: permit.fee_paid_date || "",
      fee_due_date: permit.fee_due_date || "",
      term_limit_years: permit.term_limit_years?.toString() || "",
      max_renewals: permit.max_renewals?.toString() || "",
      is_initial_permit: permit.is_initial_permit ?? true,
      previous_permit_id: permit.previous_permit_id || "",
      port_of_entry: permit.port_of_entry || "",
      permit_conditions: permit.permit_conditions?.join(", ") || "",
      application_reference: permit.application_reference || "",
      issuing_authority: permit.issuing_authority || "",
    });
    // Open relevant sections when editing
    setBasicInfoOpen(true);
    setSponsorshipOpen(!!permit.sponsoring_company || !!permit.issuing_authority);
    setApplicationOpen(!!permit.application_date || !!permit.approval_date || !!permit.application_reference);
    setRenewalOpen(!!permit.term_limit_years || !!permit.previous_permit_id || !permit.is_initial_permit);
    setFinancialOpen(!!permit.fee_amount);
    setDocumentsOpen(true);
    setDialogOpen(true);
  };

  const handleArchive = async (permit: WorkPermit) => {
    const { error } = await supabase
      .from("employee_work_permits")
      .update({ status: "archived" })
      .eq("id", permit.id);

    if (error) {
      toast.error("Failed to archive work permit");
    } else {
      await logAction({
        action: "UPDATE",
        entityType: "work_permit",
        entityId: permit.id,
        entityName: permit.permit_type,
        oldValues: { status: permit.status },
        newValues: { status: "archived" },
      });
      toast.success("Work permit archived");
      fetchPermits();
    }
  };

  const openNewDialog = () => {
    setEditingPermit(null);
    setSelectedFile(null);
    form.reset();
    setBasicInfoOpen(true);
    setSponsorshipOpen(false);
    setApplicationOpen(false);
    setRenewalOpen(false);
    setFinancialOpen(false);
    setDocumentsOpen(true);
    setDialogOpen(true);
  };

  const isExpired = (date: string) => isBefore(new Date(date), new Date());

  const getStatusBadge = (permit: WorkPermit) => {
    if (permit.status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (isExpired(permit.expiry_date)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (permit.status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{permit.status}</Badge>;
  };

  const getComplianceIndicator = (permit: WorkPermit) => {
    if (permit.status === "archived") return null;
    
    if (isExpired(permit.expiry_date)) {
      return <span className="text-destructive font-medium">✖</span>;
    }
    if (permit.status === "pending") {
      return <span className="text-yellow-500 font-medium">⚠</span>;
    }
    if (permit.status === "active") {
      return <span className="text-green-500 font-medium">✔</span>;
    }
    return <span className="text-yellow-500 font-medium">⚠</span>;
  };

  const getRenewalEligibilityDate = (permit: WorkPermit) => {
    if (!permit.term_limit_years || !permit.issue_date) return null;
    // Typically eligible for renewal 6 months before expiry
    const eligibleDate = addYears(new Date(permit.issue_date), permit.term_limit_years);
    eligibleDate.setMonth(eligibleDate.getMonth() - 6);
    return eligibleDate;
  };

  // ESS View - Simplified status card
  if (viewType === "ess") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Work Permits</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : permits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No work permits on file
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {permits.filter(p => p.status !== "archived").map((permit) => (
              <Card key={permit.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">{permit.permit_type.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {formatDateForDisplay(permit.expiry_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(permit)}
                      {isExpired(permit.expiry_date) && (
                        <span className="text-sm text-destructive font-medium">Action Required</span>
                      )}
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

  // Manager View - Limited list
  if (viewType === "manager") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Work Permits</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : permits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No work permits on file
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {permits.filter(p => p.status !== "archived").map((permit) => (
              <Card key={permit.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getComplianceIndicator(permit)}
                      <CardTitle className="text-base capitalize">
                        {permit.permit_type.replace("_", " ")}
                      </CardTitle>
                      {getStatusBadge(permit)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Country:</span> {permit.issuing_country}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {formatDateForDisplay(permit.expiry_date)}
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

  // HR View - Full access with progressive disclosure form
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Permits</h3>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Work Permit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPermit ? "Edit Work Permit" : "Add Work Permit"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  
                  {/* Expiry Warning */}
                  {daysUntilExpiry !== null && daysUntilExpiry < 90 && daysUntilExpiry > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">
                        This permit expires in {daysUntilExpiry} days. Consider initiating renewal.
                      </span>
                    </div>
                  )}

                  {/* Section 1: Basic Information (Always Open) */}
                  <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen}>
                    <CollapsibleTrigger className="w-full border-b pb-2 hover:bg-muted/50 rounded-t px-2 -mx-2">
                      <SectionHeader 
                        icon={FileSignature} 
                        title="Basic Information" 
                        isOpen={basicInfoOpen}
                        tooltip="Core permit details required for compliance tracking"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="permit_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Permit Type
                                <FieldTooltip content="The category of authorization for work/residence in the country" />
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="work_visa">Work Visa</SelectItem>
                                  <SelectItem value="work_permit">Work Permit</SelectItem>
                                  <SelectItem value="residence_permit">Residence Permit</SelectItem>
                                  <SelectItem value="employment_pass">Employment Pass</SelectItem>
                                  <SelectItem value="investor_visa">Investor Visa</SelectItem>
                                  <SelectItem value="intra_company_transfer">Intra-Company Transfer</SelectItem>
                                  <SelectItem value="skilled_worker">Skilled Worker Visa</SelectItem>
                                  <SelectItem value="temporary_worker">Temporary Worker</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="permit_number"
                          rules={{ required: "Permit number is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Permit Number
                                <FieldTooltip content="Unique identifier issued by the immigration authority" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., WP-2024-123456" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="issuing_country"
                          rules={{ required: "Issuing country is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Issuing Country
                                <FieldTooltip content="The country that granted this work authorization" />
                              </FormLabel>
                              <FormControl>
                                <CountrySelect
                                  value={field.value}
                                  onChange={field.onChange}
                                  valueType="name"
                                  placeholder="Select country"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Status
                                <FieldTooltip content="Current validity status of the permit" />
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="pending">Pending Approval</SelectItem>
                                  <SelectItem value="expired">Expired</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                  <SelectItem value="revoked">Revoked</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="issue_date"
                          rules={{ required: "Issue date is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Issue Date
                                <FieldTooltip content="Date when the permit was officially issued" />
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="expiry_date"
                          rules={{ required: "Expiry date is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Expiry Date
                                <FieldTooltip content="Date when the permit expires and must be renewed" />
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              {daysUntilExpiry !== null && (
                                <FormDescription>
                                  {daysUntilExpiry > 0 
                                    ? `${daysUntilExpiry} days remaining`
                                    : daysUntilExpiry === 0 
                                      ? "Expires today"
                                      : `Expired ${Math.abs(daysUntilExpiry)} days ago`
                                  }
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="port_of_entry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Port of Entry
                              <FieldTooltip content="The location where the employee entered the country on this permit" />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., JFK International Airport, New York" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Section 2: Sponsorship Details */}
                  <Collapsible open={sponsorshipOpen} onOpenChange={setSponsorshipOpen}>
                    <CollapsibleTrigger className="w-full border-b pb-2 hover:bg-muted/50 rounded-t px-2 -mx-2">
                      <SectionHeader 
                        icon={Building2} 
                        title="Sponsorship Details" 
                        isOpen={sponsorshipOpen}
                        tooltip="Information about the sponsoring organization and issuing authority"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sponsoring_company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Sponsoring Company
                                <FieldTooltip content="The organization that sponsored this work permit application" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Company name" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="issuing_authority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Issuing Authority
                                <FieldTooltip content="The embassy, consulate, or immigration office that issued the permit" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., US Embassy, London" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="permit_conditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Conditions & Restrictions
                              <FieldTooltip content="Any specific conditions or restrictions attached to this permit (comma-separated)" />
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={2} 
                                placeholder="e.g., Must work for sponsoring employer only, Cannot change job role, Limited to specific location"
                              />
                            </FormControl>
                            <FormDescription>Enter conditions separated by commas</FormDescription>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Section 3: Application Tracking */}
                  <Collapsible open={applicationOpen} onOpenChange={setApplicationOpen}>
                    <CollapsibleTrigger className="w-full border-b pb-2 hover:bg-muted/50 rounded-t px-2 -mx-2">
                      <SectionHeader 
                        icon={Calendar} 
                        title="Application Tracking" 
                        isOpen={applicationOpen}
                        tooltip="Track the application timeline and reference numbers"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="application_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Application Date
                                <FieldTooltip content="Date when the permit application was submitted" />
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="approval_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Approval Date
                                <FieldTooltip content="Date when the application was approved (may differ from issue date)" />
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="application_reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Application Reference Number
                              <FieldTooltip content="Government or embassy tracking number for this application" />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., APP-2024-789012" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Section 4: Renewal Information */}
                  <Collapsible open={renewalOpen} onOpenChange={setRenewalOpen}>
                    <CollapsibleTrigger className="w-full border-b pb-2 hover:bg-muted/50 rounded-t px-2 -mx-2">
                      <SectionHeader 
                        icon={RotateCcw} 
                        title="Renewal Information" 
                        isOpen={renewalOpen}
                        tooltip="Track permit terms, renewal limits, and permit history"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="is_initial_permit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Initial Permit
                                <FieldTooltip content="Check if this is the first permit issued (not a renewal)" />
                              </FormLabel>
                              <FormDescription>
                                This is the employee's first work permit for this country
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!watchIsInitialPermit && (
                        <FormField
                          control={form.control}
                          name="previous_permit_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Previous Permit
                                <FieldTooltip content="Link to the permit this renewal is based on" />
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select previous permit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {previousPermitOptions.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.permit_number} - {p.permit_type.replace("_", " ")} (expires {formatDateForDisplay(p.expiry_date)})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="term_limit_years"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Term Limit (Years)
                                <FieldTooltip content="Maximum duration this permit type can be held" />
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="99" {...field} placeholder="e.g., 5" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="max_renewals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Max Renewals Allowed
                                <FieldTooltip content="Maximum number of times this permit type can be renewed" />
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="99" {...field} placeholder="e.g., 2" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {editingPermit?.current_renewal_count !== undefined && editingPermit?.current_renewal_count !== null && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Current renewal count: <strong>{editingPermit.current_renewal_count}</strong>
                            {editingPermit.max_renewals && (
                              <> of {editingPermit.max_renewals} maximum</>
                            )}
                          </span>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Section 5: Financial */}
                  <Collapsible open={financialOpen} onOpenChange={setFinancialOpen}>
                    <CollapsibleTrigger className="w-full border-b pb-2 hover:bg-muted/50 rounded-t px-2 -mx-2">
                      <SectionHeader 
                        icon={DollarSign} 
                        title="Financial" 
                        isOpen={financialOpen}
                        tooltip="Track permit fees and payment status"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="fee_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Fee Amount
                                <FieldTooltip content="Total cost of the permit application and processing" />
                              </FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} placeholder="0.00" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fee_currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                  <SelectItem value="CAD">CAD</SelectItem>
                                  <SelectItem value="AUD">AUD</SelectItem>
                                  <SelectItem value="SGD">SGD</SelectItem>
                                  <SelectItem value="HKD">HKD</SelectItem>
                                  <SelectItem value="JPY">JPY</SelectItem>
                                  <SelectItem value="CHF">CHF</SelectItem>
                                  <SelectItem value="XCD">XCD</SelectItem>
                                  <SelectItem value="JMD">JMD</SelectItem>
                                  <SelectItem value="TTD">TTD</SelectItem>
                                  <SelectItem value="BBD">BBD</SelectItem>
                                  <SelectItem value="GHS">GHS</SelectItem>
                                  <SelectItem value="NGN">NGN</SelectItem>
                                  <SelectItem value="DOP">DOP</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fee_due_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Fee Due Date
                                <FieldTooltip content="Deadline for fee payment" />
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fee_paid_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Fee Paid Date
                                <FieldTooltip content="Date when the fee was actually paid" />
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Section 6: Documents & Notes */}
                  <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
                    <CollapsibleTrigger className="w-full border-b pb-2 hover:bg-muted/50 rounded-t px-2 -mx-2">
                      <SectionHeader 
                        icon={FileText} 
                        title="Documents & Notes" 
                        isOpen={documentsOpen}
                        tooltip="Attach supporting documents and add internal notes"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <FormLabel>Supporting Document</FormLabel>
                        <div className="border-2 border-dashed rounded-lg p-4">
                          <input
                            type="file"
                            id="permit-file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          {selectedFile ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{selectedFile.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </span>
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
                          ) : (
                            <label htmlFor="permit-file-upload" className="cursor-pointer flex items-center justify-center gap-2">
                              <Upload className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Click to upload (PDF, DOC, JPG, PNG - max 10MB)
                              </span>
                            </label>
                          )}
                        </div>
                        {editingPermit?.document_url && !selectedFile && (
                          <p className="text-xs text-muted-foreground">
                            Current document: {editingPermit.document_name}
                          </p>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Notes (HR Only)
                              <FieldTooltip content="Internal notes visible only to HR personnel" />
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} placeholder="Add any relevant notes or observations..." />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? "Saving..." : "Save Work Permit"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Detail View Dialog */}
      <Dialog open={!!viewingPermit} onOpenChange={() => setViewingPermit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Work Permit Details</DialogTitle>
          </DialogHeader>
          {viewingPermit && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <FileSignature className="h-4 w-4" /> Basic Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{viewingPermit.permit_type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Number:</span>
                    <p className="font-medium">{viewingPermit.permit_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">{getStatusBadge(viewingPermit)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium">{viewingPermit.issuing_country}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issue Date:</span>
                    <p className="font-medium">{formatDateForDisplay(viewingPermit.issue_date)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <p className="font-medium">{formatDateForDisplay(viewingPermit.expiry_date)}</p>
                  </div>
                  {viewingPermit.port_of_entry && (
                    <div className="col-span-full">
                      <span className="text-muted-foreground">Port of Entry:</span>
                      <p className="font-medium">{viewingPermit.port_of_entry}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sponsorship */}
              {(viewingPermit.sponsoring_company || viewingPermit.issuing_authority || viewingPermit.permit_conditions?.length) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Sponsorship Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {viewingPermit.sponsoring_company && (
                      <div>
                        <span className="text-muted-foreground">Sponsoring Company:</span>
                        <p className="font-medium">{viewingPermit.sponsoring_company}</p>
                      </div>
                    )}
                    {viewingPermit.issuing_authority && (
                      <div>
                        <span className="text-muted-foreground">Issuing Authority:</span>
                        <p className="font-medium">{viewingPermit.issuing_authority}</p>
                      </div>
                    )}
                    {viewingPermit.permit_conditions && viewingPermit.permit_conditions.length > 0 && (
                      <div className="col-span-full">
                        <span className="text-muted-foreground">Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewingPermit.permit_conditions.map((condition, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Tracking */}
              {(viewingPermit.application_date || viewingPermit.approval_date || viewingPermit.application_reference) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Application Tracking
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {viewingPermit.application_date && (
                      <div>
                        <span className="text-muted-foreground">Application Date:</span>
                        <p className="font-medium">{formatDateForDisplay(viewingPermit.application_date)}</p>
                      </div>
                    )}
                    {viewingPermit.approval_date && (
                      <div>
                        <span className="text-muted-foreground">Approval Date:</span>
                        <p className="font-medium">{formatDateForDisplay(viewingPermit.approval_date)}</p>
                      </div>
                    )}
                    {viewingPermit.application_reference && (
                      <div>
                        <span className="text-muted-foreground">Reference:</span>
                        <p className="font-medium">{viewingPermit.application_reference}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Renewal Info */}
              {(viewingPermit.term_limit_years || viewingPermit.max_renewals !== null || viewingPermit.is_initial_permit !== null) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" /> Renewal Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Initial Permit:</span>
                      <p className="font-medium">{viewingPermit.is_initial_permit ? "Yes" : "No"}</p>
                    </div>
                    {viewingPermit.term_limit_years && (
                      <div>
                        <span className="text-muted-foreground">Term Limit:</span>
                        <p className="font-medium">{viewingPermit.term_limit_years} years</p>
                      </div>
                    )}
                    {viewingPermit.max_renewals !== null && (
                      <div>
                        <span className="text-muted-foreground">Max Renewals:</span>
                        <p className="font-medium">{viewingPermit.max_renewals}</p>
                      </div>
                    )}
                    {viewingPermit.current_renewal_count !== null && (
                      <div>
                        <span className="text-muted-foreground">Current Renewal:</span>
                        <p className="font-medium">#{viewingPermit.current_renewal_count}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial */}
              {(viewingPermit.fee_amount || viewingPermit.fee_due_date || viewingPermit.fee_paid_date) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Financial
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {viewingPermit.fee_amount && (
                      <div>
                        <span className="text-muted-foreground">Fee Amount:</span>
                        <p className="font-medium">
                          {viewingPermit.fee_currency || "USD"} {viewingPermit.fee_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {viewingPermit.fee_due_date && (
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <p className="font-medium">{formatDateForDisplay(viewingPermit.fee_due_date)}</p>
                      </div>
                    )}
                    {viewingPermit.fee_paid_date && (
                      <div>
                        <span className="text-muted-foreground">Paid Date:</span>
                        <p className="font-medium">{formatDateForDisplay(viewingPermit.fee_paid_date)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingPermit.notes && canViewNotes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Notes
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded">{viewingPermit.notes}</p>
                </div>
              )}

              {/* Document */}
              {viewingPermit.document_url && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={viewingPermit.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {viewingPermit.document_name || "View Document"}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : permits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No work permits on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {permits.map((permit) => (
            <Card key={permit.id} className={permit.status === "archived" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getComplianceIndicator(permit)}
                    <CardTitle className="text-base capitalize">
                      {permit.permit_type.replace("_", " ")}
                    </CardTitle>
                    {getStatusBadge(permit)}
                    {!permit.is_initial_permit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Renewal
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {permit.current_renewal_count !== null 
                              ? `Renewal #${permit.current_renewal_count}${permit.max_renewals ? ` of ${permit.max_renewals}` : ""}`
                              : "This is a renewed permit"
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isExpired(permit.expiry_date) && permit.status !== "archived" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingPermit(permit)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {permit.document_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={permit.document_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {canEdit && permit.status !== "archived" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(permit)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleArchive(permit)}>
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
                    <span className="text-muted-foreground">Number:</span> {permit.permit_number}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span> {permit.issuing_country}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued:</span>{" "}
                    {formatDateForDisplay(permit.issue_date)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>{" "}
                    {formatDateForDisplay(permit.expiry_date)}
                    {!isExpired(permit.expiry_date) && permit.status !== "archived" && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({differenceInDays(new Date(permit.expiry_date), new Date())}d)
                      </span>
                    )}
                  </div>
                </div>
                {permit.sponsoring_company && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Sponsor:</span> {permit.sponsoring_company}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
