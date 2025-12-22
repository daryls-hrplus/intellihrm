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
import { Plus, Pencil, Archive, FileCheck, AlertCircle, Upload, FileText, X, Download, Eye } from "lucide-react";
import { isBefore } from "date-fns";
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
}

interface EmployeeWorkPermitsTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeWorkPermitsTab({ employeeId, viewType = "hr" }: EmployeeWorkPermitsTabProps) {
  const [permits, setPermits] = useState<WorkPermit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<WorkPermit | null>(null);
  const [viewingPermit, setViewingPermit] = useState<WorkPermit | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
    },
  });

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
      setPermits(data || []);
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

      const payload = {
        ...data,
        sponsoring_company: data.sponsoring_company || null,
        notes: data.notes || null,
        document_url: documentUrl,
        document_name: documentName,
        document_size: documentSize,
        document_mime_type: documentMimeType,
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
    });
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

  // HR View - Full access
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPermit ? "Edit Work Permit" : "Add Work Permit"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="permit_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Permit Type</FormLabel>
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
                          <FormLabel>Permit Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="issuing_country"
                    rules={{ required: "Issuing country is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Country</FormLabel>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issue_date"
                      rules={{ required: "Issue date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
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
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
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
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sponsoring_company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sponsoring Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

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
                    <Button type="submit" disabled={uploading}>
                      {uploading ? "Saving..." : "Save"}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Work Permit Details</DialogTitle>
          </DialogHeader>
          {viewingPermit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{viewingPermit.permit_type.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Number:</span>
                  <p className="font-medium">{viewingPermit.permit_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Country:</span>
                  <p className="font-medium">{viewingPermit.issuing_country}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(viewingPermit)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Issue Date:</span>
                  <p className="font-medium">{formatDateForDisplay(viewingPermit.issue_date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <p className="font-medium">{formatDateForDisplay(viewingPermit.expiry_date)}</p>
                </div>
                {viewingPermit.sponsoring_company && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Sponsoring Company:</span>
                    <p className="font-medium">{viewingPermit.sponsoring_company}</p>
                  </div>
                )}
              </div>
              {viewingPermit.notes && canViewNotes && (
                <div>
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{viewingPermit.notes}</p>
                </div>
              )}
              {viewingPermit.document_url && (
                <div className="flex items-center gap-2">
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
