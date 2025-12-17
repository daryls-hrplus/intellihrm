import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Building2, Shield, Check, X } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useTranslation } from "react-i18next";

const AUDIT_TYPES = [
  { value: "dependent_verification", label: "Dependent Verification" },
  { value: "eligibility_review", label: "Eligibility Review" },
  { value: "coverage_audit", label: "Coverage Audit" },
  { value: "document_verification", label: "Document Verification" },
  { value: "annual_review", label: "Annual Review" }
];

export default function EligibilityAuditPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    audit_type: "",
    notes: ""
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchEmployees();
      fetchAudits();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, company_id")
      .eq("company_id", selectedCompany);
    setEmployees(data || []);
  };

  const fetchAudits = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("benefit_eligibility_audits")
        .select(`
          *,
          employee:profiles!benefit_eligibility_audits_employee_id_fkey(full_name, email, company_id),
          verifier:profiles!benefit_eligibility_audits_verified_by_fkey(full_name),
          enrollment:benefit_enrollments(*, plan:benefit_plans(name)),
          dependent:benefit_dependents(full_name, relationship)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter by company
      const filtered = (data || []).filter((a: any) => a.employee?.company_id === selectedCompany);
      setAudits(filtered);
    } catch (error) {
      console.error("Error fetching audits:", error);
      toast.error("Failed to load eligibility audits");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.audit_type) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("benefit_eligibility_audits")
        .insert([{
          employee_id: formData.employee_id,
          audit_type: formData.audit_type,
          notes: formData.notes,
          verification_status: "pending"
        }]);

      if (error) throw error;

      await logAction({
        action: "CREATE",
        entityType: "benefit_eligibility_audits",
        entityName: formData.audit_type
      });

      toast.success("Audit record created successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchAudits();
    } catch (error) {
      console.error("Error creating audit:", error);
      toast.error("Failed to create audit record");
    }
  };

  const handleVerify = async (audit: any, status: "verified" | "failed") => {
    try {
      const { error } = await supabase
        .from("benefit_eligibility_audits")
        .update({
          verification_status: status,
          verified_by: user?.id,
          verification_date: getTodayString()
        })
        .eq("id", audit.id);

      if (error) throw error;

      await logAction({
        action: "UPDATE",
        entityType: "benefit_eligibility_audits",
        entityId: audit.id,
        entityName: `${audit.audit_type} - ${status}`
      });

      toast.success(`Audit marked as ${status}`);
      fetchAudits();
    } catch (error) {
      console.error("Error updating audit:", error);
      toast.error("Failed to update audit");
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      audit_type: "",
      notes: ""
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "verified": return "default";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Eligibility Audit" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Eligibility Audit Trail</h1>
            <p className="text-muted-foreground">Track and verify benefit eligibility</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> New Audit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Eligibility Audit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employee">Employee *</Label>
                    <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="audit_type">Audit Type *</Label>
                    <Select value={formData.audit_type} onValueChange={(value) => setFormData({ ...formData, audit_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audit type" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional audit notes..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>Create Audit</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Audit Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No audit records found
                    </TableCell>
                  </TableRow>
                ) : (
                  audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{audit.employee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{audit.employee?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {AUDIT_TYPES.find(t => t.value === audit.audit_type)?.label || audit.audit_type}
                      </TableCell>
                      <TableCell>{formatDateForDisplay(audit.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(audit.verification_status)}>
                          {audit.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {audit.verifier?.full_name || "-"}
                        {audit.verification_date && (
                          <p className="text-xs text-muted-foreground">{audit.verification_date}</p>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {audit.notes || "-"}
                      </TableCell>
                      <TableCell>
                        {audit.verification_status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleVerify(audit, "verified")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleVerify(audit, "failed")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
