import { useState } from "react";
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
import { Plus, Pencil, Archive, FileSignature, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/contexts/AuthContext";

interface EmployeeAgreementsSignaturesTabProps {
  employeeId: string;
  isEssView?: boolean;
}

interface AgreementFormData {
  agreement_type: string;
  agreement_name: string;
  version: string;
  issued_date: string;
  signed_date: string;
  effective_date: string;
  expiry_date: string;
  signature_status: string;
  signature_method: string;
  document_url: string;
  signatory_name: string;
  witness_name: string;
  notes: string;
}

const AGREEMENT_TYPES = [
  { value: "employment_contract", label: "Employment Contract" },
  { value: "nda", label: "Non-Disclosure Agreement (NDA)" },
  { value: "non_compete", label: "Non-Compete Agreement" },
  { value: "confidentiality", label: "Confidentiality Agreement" },
  { value: "policy_acknowledgment", label: "Policy Acknowledgment" },
  { value: "handbook_acknowledgment", label: "Employee Handbook Acknowledgment" },
  { value: "benefits_enrollment", label: "Benefits Enrollment Form" },
  { value: "ip_assignment", label: "IP Assignment Agreement" },
  { value: "other", label: "Other" },
];

const SIGNATURE_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "signed", label: "Signed" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const SIGNATURE_METHODS = [
  { value: "electronic", label: "Electronic Signature" },
  { value: "wet_ink", label: "Physical/Wet Signature" },
  { value: "verbal", label: "Verbal Acknowledgment" },
  { value: "not_required", label: "Not Required" },
];

const getInitialFormData = (): AgreementFormData => ({
  agreement_type: "employment_contract",
  agreement_name: "",
  version: "",
  issued_date: getTodayString(),
  signed_date: "",
  effective_date: getTodayString(),
  expiry_date: "",
  signature_status: "pending",
  signature_method: "electronic",
  document_url: "",
  signatory_name: "",
  witness_name: "",
  notes: "",
});

export function EmployeeAgreementsSignaturesTab({ employeeId, isEssView = false }: EmployeeAgreementsSignaturesTabProps) {
  const queryClient = useQueryClient();
  const { user, roles } = useAuth();
  const { hasActionAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AgreementFormData>(getInitialFormData());

  // Determine permissions based on ESS vs Workforce view
  const moduleCode = isEssView ? "ess" : "workforce";
  const tabCode = isEssView ? "ess_agreements_signatures" : "agreements_signatures";
  
  const isAdmin = roles.includes("admin");
  const canCreate = isAdmin || hasActionAccess(moduleCode, "create", tabCode);
  const canEdit = isAdmin || hasActionAccess(moduleCode, "edit", tabCode);
  const canDelete = isAdmin || hasActionAccess(moduleCode, "delete", tabCode);

  // Fetch agreements
  const { data: agreements, isLoading } = useQuery({
    queryKey: ["employee-agreements", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_agreements")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_archived", false)
        .order("effective_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: AgreementFormData) => {
      const { data: result, error } = await supabase
        .from("employee_agreements")
        .insert({
          employee_id: employeeId,
          agreement_type: data.agreement_type,
          agreement_name: data.agreement_name,
          version: data.version || null,
          issued_date: data.issued_date || null,
          signed_date: data.signed_date || null,
          effective_date: data.effective_date,
          expiry_date: data.expiry_date || null,
          signature_status: data.signature_status,
          signature_method: data.signature_method,
          document_url: data.document_url || null,
          signatory_name: data.signatory_name || null,
          witness_name: data.witness_name || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "CREATE",
        entity_type: "employee_agreement",
        entity_id: result.id,
        entity_name: result.agreement_name,
        new_values: result,
      });
      queryClient.invalidateQueries({ queryKey: ["employee-agreements", employeeId] });
      toast.success("Agreement added successfully");
      closeDialog();
    },
    onError: (error) => {
      console.error("Error creating agreement:", error);
      toast.error("Failed to add agreement");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AgreementFormData }) => {
      const { data: result, error } = await supabase
        .from("employee_agreements")
        .update({
          agreement_type: data.agreement_type,
          agreement_name: data.agreement_name,
          version: data.version || null,
          issued_date: data.issued_date || null,
          signed_date: data.signed_date || null,
          effective_date: data.effective_date,
          expiry_date: data.expiry_date || null,
          signature_status: data.signature_status,
          signature_method: data.signature_method,
          document_url: data.document_url || null,
          signatory_name: data.signatory_name || null,
          witness_name: data.witness_name || null,
          notes: data.notes || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "UPDATE",
        entity_type: "employee_agreement",
        entity_id: result.id,
        entity_name: result.agreement_name,
        new_values: result,
      });
      queryClient.invalidateQueries({ queryKey: ["employee-agreements", employeeId] });
      toast.success("Agreement updated successfully");
      closeDialog();
    },
    onError: (error) => {
      console.error("Error updating agreement:", error);
      toast.error("Failed to update agreement");
    },
  });

  // Archive mutation (soft delete)
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("employee_agreements")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "DELETE",
        entity_type: "employee_agreement",
        entity_id: result.id,
        entity_name: result.agreement_name,
        old_values: { archived: true },
      });
      queryClient.invalidateQueries({ queryKey: ["employee-agreements", employeeId] });
      toast.success("Agreement archived successfully");
    },
    onError: (error) => {
      console.error("Error archiving agreement:", error);
      toast.error("Failed to archive agreement");
    },
  });

  // Sign/Acknowledge mutation (for ESS)
  const signMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("employee_agreements")
        .update({
          signature_status: "signed",
          signed_date: getTodayString(),
          signatory_name: user?.email,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "UPDATE",
        entity_type: "employee_agreement",
        entity_id: result.id,
        entity_name: result.agreement_name,
        new_values: { signature_status: "signed" },
      });
      queryClient.invalidateQueries({ queryKey: ["employee-agreements", employeeId] });
      toast.success("Agreement signed successfully");
    },
    onError: (error) => {
      console.error("Error signing agreement:", error);
      toast.error("Failed to sign agreement");
    },
  });
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(getInitialFormData());
  };

  const handleEdit = (agreement: any) => {
    setEditingId(agreement.id);
    setFormData({
      agreement_type: agreement.agreement_type,
      agreement_name: agreement.agreement_name,
      version: agreement.version || "",
      issued_date: agreement.issued_date || "",
      signed_date: agreement.signed_date || "",
      effective_date: agreement.effective_date,
      expiry_date: agreement.expiry_date || "",
      signature_status: agreement.signature_status,
      signature_method: agreement.signature_method,
      document_url: agreement.document_url || "",
      signatory_name: agreement.signatory_name || "",
      witness_name: agreement.witness_name || "",
      notes: agreement.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.agreement_name || !formData.effective_date) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-500">Signed</Badge>;
      case "acknowledged":
        return <Badge className="bg-blue-500">Acknowledged</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return AGREEMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Agreements & Signatures
          </CardTitle>
          <CardDescription>
            {isEssView 
              ? "View and sign your employment agreements and policy acknowledgments"
              : "Employment agreements, NDAs, policy acknowledgments, and signature tracking"
            }
          </CardDescription>
        </div>
        {canCreate && !isEssView && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Agreement
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {agreements && agreements.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                {!isEssView && <TableHead>Signed Date</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell className="font-medium">
                    {agreement.agreement_name}
                    {agreement.version && <span className="text-muted-foreground ml-1">v{agreement.version}</span>}
                  </TableCell>
                  <TableCell>{getTypeLabel(agreement.agreement_type)}</TableCell>
                  <TableCell>{formatDateForDisplay(agreement.effective_date)}</TableCell>
                  <TableCell>{getStatusBadge(agreement.signature_status)}</TableCell>
                  {!isEssView && <TableCell>{agreement.signed_date ? formatDateForDisplay(agreement.signed_date) : "-"}</TableCell>}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {agreement.document_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={agreement.document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {isEssView && agreement.signature_status === "pending" && (
                        <Button 
                          size="sm" 
                          onClick={() => signMutation.mutate(agreement.id)}
                          disabled={signMutation.isPending}
                        >
                          Sign
                        </Button>
                      )}
                      {canEdit && !isEssView && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(agreement)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && !isEssView && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => archiveMutation.mutate(agreement.id)}
                          disabled={archiveMutation.isPending}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSignature className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {isEssView 
                ? "No agreements requiring your signature at this time."
                : "No agreements on file. Add employment contracts, NDAs, and policy acknowledgments."
              }
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Agreement" : "Add Agreement"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Agreement Type *</Label>
              <Select value={formData.agreement_type} onValueChange={(v) => setFormData(prev => ({ ...prev, agreement_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGREEMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Agreement Name *</Label>
              <Input 
                value={formData.agreement_name} 
                onChange={(e) => setFormData(prev => ({ ...prev, agreement_name: e.target.value }))} 
                placeholder="e.g., Employment Agreement 2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Version</Label>
                <Input 
                  value={formData.version} 
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="e.g., 1.0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Signature Status</Label>
                <Select value={formData.signature_status} onValueChange={(v) => setFormData(prev => ({ ...prev, signature_status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNATURE_STATUS.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Issued Date</Label>
                <Input 
                  type="date" 
                  value={formData.issued_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, issued_date: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Effective Date *</Label>
                <Input 
                  type="date" 
                  value={formData.effective_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Expiry Date</Label>
                <Input 
                  type="date" 
                  value={formData.expiry_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Signed Date</Label>
                <Input 
                  type="date" 
                  value={formData.signed_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, signed_date: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Signature Method</Label>
              <Select value={formData.signature_method} onValueChange={(v) => setFormData(prev => ({ ...prev, signature_method: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIGNATURE_METHODS.map(method => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Signatory Name</Label>
                <Input 
                  value={formData.signatory_name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, signatory_name: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Witness Name</Label>
                <Input 
                  value={formData.witness_name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, witness_name: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Document URL</Label>
              <Input 
                value={formData.document_url} 
                onChange={(e) => setFormData(prev => ({ ...prev, document_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
