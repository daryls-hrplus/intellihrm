import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Receipt, Check, X } from "lucide-react";

interface BenefitClaim {
  id: string;
  enrollment_id: string;
  claim_number: string;
  claim_date: string;
  service_date: string;
  claim_type: string;
  description: string | null;
  amount_claimed: number;
  amount_approved: number | null;
  status: string;
  provider_name: string | null;
  notes: string | null;
  benefit_enrollments?: {
    profiles?: { full_name: string };
    benefit_plans?: { name: string };
  };
}

interface Enrollment {
  id: string;
  benefit_plans?: { name: string };
  profiles?: { full_name: string };
}

interface Company {
  id: string;
  name: string;
}

const CLAIM_TYPES = ['medical', 'dental', 'vision', 'prescription', 'wellness', 'other'];
const STATUS_OPTIONS = ['submitted', 'processing', 'approved', 'denied', 'paid'];

export default function BenefitClaimsPage() {
  const { t } = useTranslation();
  const canManage = isAdmin || hasRole('hr_manager');
  
  const [claims, setClaims] = useState<BenefitClaim[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<BenefitClaim | null>(null);
  
  const [formData, setFormData] = useState({
    enrollment_id: "",
    claim_date: new Date().toISOString().split('T')[0],
    service_date: new Date().toISOString().split('T')[0],
    claim_type: "medical",
    description: "",
    amount_claimed: 0,
    amount_approved: 0,
    status: "submitted",
    provider_name: "",
    notes: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchClaims();
      fetchEnrollments();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name').eq('is_active', true).order('name');
    if (data) {
      setCompanies(data);
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    }
  };

  const fetchEnrollments = async () => {
    let query = supabase
      .from('benefit_enrollments')
      .select(`
        id,
        benefit_plans!inner(name, company_id),
        profiles!benefit_enrollments_employee_id_fkey(full_name)
      `)
      .eq('status', 'active');

    if (!canManage) {
      query = query.eq('employee_id', user?.id);
    }
    
    const { data } = await query;
    const filtered = (data || []).filter((e: any) => e.benefit_plans?.company_id === selectedCompanyId);
    setEnrollments(filtered);
  };

  const fetchClaims = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('benefit_claims')
      .select(`
        *,
        benefit_enrollments(
          profiles!benefit_enrollments_employee_id_fkey(full_name),
          benefit_plans(name, company_id)
        )
      `)
      .order('claim_date', { ascending: false });
    
    if (error) {
      toast.error("Failed to load claims");
    } else {
      // Filter by company
      const filtered = (data || []).filter((c: any) => 
        c.benefit_enrollments?.benefit_plans?.company_id === selectedCompanyId
      );
      
      // If not admin, filter to only show user's claims
      const userFiltered = canManage ? filtered : filtered.filter((c: any) =>
        c.benefit_enrollments?.employee_id === user?.id
      );
      
      setClaims(userFiltered);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.enrollment_id || !formData.amount_claimed) {
      toast.error("Please fill required fields");
      return;
    }

    const payload = {
      ...formData,
      amount_approved: formData.status === 'approved' || formData.status === 'paid' ? formData.amount_approved : null,
    };

    if (editingClaim) {
      const { error } = await supabase.from('benefit_claims').update({
        ...payload,
        processed_by: canManage ? user?.id : undefined,
        processed_at: canManage ? new Date().toISOString() : undefined,
      }).eq('id', editingClaim.id);
      if (error) {
        toast.error("Failed to update claim");
      } else {
        toast.success("Claim updated");
        fetchClaims();
      }
    } else {
      const { error } = await supabase.from('benefit_claims').insert(payload);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Claim submitted");
        fetchClaims();
      }
    }
    closeDialog();
  };

  const handleApprove = async (claim: BenefitClaim) => {
    const { error } = await supabase.from('benefit_claims').update({
      status: 'approved',
      amount_approved: claim.amount_claimed,
      processed_by: user?.id,
      processed_at: new Date().toISOString()
    }).eq('id', claim.id);
    
    if (error) {
      toast.error("Failed to approve");
    } else {
      toast.success("Claim approved");
      fetchClaims();
    }
  };

  const handleDeny = async (id: string) => {
    const { error } = await supabase.from('benefit_claims').update({
      status: 'denied',
      processed_by: user?.id,
      processed_at: new Date().toISOString()
    }).eq('id', id);
    
    if (error) {
      toast.error("Failed to deny");
    } else {
      toast.success("Claim denied");
      fetchClaims();
    }
  };

  const openCreate = () => {
    setEditingClaim(null);
    setFormData({
      enrollment_id: enrollments[0]?.id || "",
      claim_date: new Date().toISOString().split('T')[0],
      service_date: new Date().toISOString().split('T')[0],
      claim_type: "medical",
      description: "",
      amount_claimed: 0,
      amount_approved: 0,
      status: "submitted",
      provider_name: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (claim: BenefitClaim) => {
    setEditingClaim(claim);
    setFormData({
      enrollment_id: claim.enrollment_id,
      claim_date: claim.claim_date,
      service_date: claim.service_date,
      claim_type: claim.claim_type,
      description: claim.description || "",
      amount_claimed: claim.amount_claimed,
      amount_approved: claim.amount_approved || 0,
      status: claim.status,
      provider_name: claim.provider_name || "",
      notes: claim.notes || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingClaim(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      approved: "default",
      processing: "secondary",
      submitted: "secondary",
      denied: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Claims" }
        ]} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Benefit Claims</h1>
              <p className="text-muted-foreground">Submit and track benefit claims</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={openCreate} disabled={enrollments.length === 0}>
              <Plus className="h-4 w-4 mr-2" /> Submit Claim
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim #</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Amount Claimed</TableHead>
                <TableHead>Amount Approved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : claims.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No claims found</TableCell></TableRow>
              ) : claims.map(claim => (
                <TableRow key={claim.id}>
                  <TableCell className="font-mono">{claim.claim_number}</TableCell>
                  <TableCell>{claim.benefit_enrollments?.profiles?.full_name}</TableCell>
                  <TableCell>{claim.benefit_enrollments?.benefit_plans?.name}</TableCell>
                  <TableCell className="capitalize">{claim.claim_type}</TableCell>
                  <TableCell>{claim.service_date}</TableCell>
                  <TableCell>${claim.amount_claimed.toFixed(2)}</TableCell>
                  <TableCell>{claim.amount_approved ? `$${claim.amount_approved.toFixed(2)}` : '-'}</TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {canManage && (claim.status === 'submitted' || claim.status === 'processing') && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(claim)} title="Approve">
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeny(claim.id)} title="Deny">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {canManage && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(claim)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingClaim ? "Edit Claim" : "Submit Claim"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enrollment (Plan) *</Label>
              <Select value={formData.enrollment_id} onValueChange={v => setFormData({...formData, enrollment_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select enrollment" /></SelectTrigger>
                <SelectContent>
                  {enrollments.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.benefit_plans?.name} - {e.profiles?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Claim Type *</Label>
                <Select value={formData.claim_type} onValueChange={v => setFormData({...formData, claim_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLAIM_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service Date *</Label>
                <Input type="date" value={formData.service_date} onChange={e => setFormData({...formData, service_date: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Claimed *</Label>
                <Input type="number" step="0.01" value={formData.amount_claimed} onChange={e => setFormData({...formData, amount_claimed: parseFloat(e.target.value) || 0})} />
              </div>
              {canManage && (
                <div className="space-y-2">
                  <Label>Amount Approved</Label>
                  <Input type="number" step="0.01" value={formData.amount_approved} onChange={e => setFormData({...formData, amount_approved: parseFloat(e.target.value) || 0})} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input value={formData.provider_name} onChange={e => setFormData({...formData, provider_name: e.target.value})} />
              </div>
              {canManage && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingClaim ? "Update" : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
