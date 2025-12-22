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
import { Plus, Pencil, Trash2, FileSignature, Download } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";

interface EmployeeAgreementsSignaturesTabProps {
  employeeId: string;
}

interface AgreementFormData {
  agreement_type: string;
  agreement_name: string;
  version: string;
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
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const SIGNATURE_METHODS = [
  { value: "electronic", label: "Electronic Signature" },
  { value: "physical", label: "Physical/Wet Signature" },
  { value: "digital_certificate", label: "Digital Certificate" },
];

export function EmployeeAgreementsSignaturesTab({ employeeId }: EmployeeAgreementsSignaturesTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AgreementFormData>({
    agreement_type: "employment_contract",
    agreement_name: "",
    version: "",
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

  // Since employee_agreements table doesn't exist yet, we'll show a placeholder UI
  // The component is ready to be connected once the table is created
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      agreement_type: "employment_contract",
      agreement_name: "",
      version: "",
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-500">Signed</Badge>;
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Agreements & Signatures
          </CardTitle>
          <CardDescription>
            Employment agreements, NDAs, policy acknowledgments, and signature tracking
          </CardDescription>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Agreement
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileSignature className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            No agreements on file. Add employment contracts, NDAs, and policy acknowledgments.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature requires database table setup. Please run the database migration.
          </p>
        </div>
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
                  placeholder="e.g., v1.0"
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
                <Label>Effective Date *</Label>
                <Input 
                  type="date" 
                  value={formData.effective_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Expiry Date</Label>
                <Input 
                  type="date" 
                  value={formData.expiry_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Signed Date</Label>
                <Input 
                  type="date" 
                  value={formData.signed_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, signed_date: e.target.value }))} 
                />
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
            <Button disabled>Save (Database Required)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
