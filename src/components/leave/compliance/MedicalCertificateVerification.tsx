import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, Search, CheckCircle, XCircle, AlertTriangle, Clock, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MedicalCertificateVerificationProps {
  companyId: string;
}

interface Certificate {
  id: string;
  leave_request_id: string;
  employee_id: string;
  certificate_file_name: string | null;
  issuing_doctor: string | null;
  medical_facility: string | null;
  issue_date: string | null;
  valid_from: string | null;
  valid_to: string | null;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  rejection_reason: string | null;
  followup_required: boolean;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="h-4 w-4" /> },
  verified: { label: "Verified", color: "bg-green-500/10 text-green-600", icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: <XCircle className="h-4 w-4" /> },
  requires_followup: { label: "Follow-up Required", color: "bg-orange-500/10 text-orange-600", icon: <AlertTriangle className="h-4 w-4" /> },
};

export function MedicalCertificateVerification({ companyId }: MedicalCertificateVerificationProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [verificationAction, setVerificationAction] = useState<"verify" | "reject" | "followup" | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["medical-certificates", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_certificate_verifications")
        .select(`*, profiles!medical_certificate_verifications_employee_id_fkey(full_name, email)`)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!companyId,
  });

  // Update verification status
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      reason,
    }: {
      id: string;
      status: string;
      notes?: string;
      reason?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        verification_status: status,
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (notes) updateData.verification_notes = notes;
      if (reason) updateData.rejection_reason = reason;
      if (status === "requires_followup") updateData.followup_required = true;

      const { error } = await supabase
        .from("medical_certificate_verifications")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Certificate status updated");
      queryClient.invalidateQueries({ queryKey: ["medical-certificates"] });
      closeDialog();
    },
    onError: (error) => toast.error(`Failed to update: ${error.message}`),
  });

  const closeDialog = () => {
    setSelectedCert(null);
    setVerificationAction(null);
    setVerificationNotes("");
    setRejectionReason("");
  };

  const handleAction = () => {
    if (!selectedCert || !verificationAction) return;
    
    let status = "";
    switch (verificationAction) {
      case "verify":
        status = "verified";
        break;
      case "reject":
        status = "rejected";
        break;
      case "followup":
        status = "requires_followup";
        break;
    }
    
    updateMutation.mutate({
      id: selectedCert.id,
      status,
      notes: verificationNotes,
      reason: rejectionReason,
    });
  };

  // Stats
  const pendingCount = certificates.filter((c) => c.verification_status === "pending").length;
  const verifiedCount = certificates.filter((c) => c.verification_status === "verified").length;
  const rejectedCount = certificates.filter((c) => c.verification_status === "rejected").length;
  const followupCount = certificates.filter((c) => c.verification_status === "requires_followup").length;

  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuing_doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.medical_facility?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || cert.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{verifiedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Follow-up</p>
                <p className="text-2xl font-bold">{followupCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Certificate Verification</CardTitle>
          <CardDescription>Review and verify medical certificates for leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, doctor, or facility..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="requires_followup">Needs Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Doctor / Facility</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCerts.map((cert) => {
                    const statusConfig = STATUS_CONFIG[cert.verification_status] || STATUS_CONFIG.pending;
                    return (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.profiles?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{cert.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.issuing_doctor || "—"}</p>
                            <p className="text-xs text-muted-foreground">{cert.medical_facility || "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cert.issue_date ? format(new Date(cert.issue_date), "PP") : "—"}
                        </TableCell>
                        <TableCell>
                          {cert.valid_from && cert.valid_to ? (
                            <span className="text-sm">
                              {format(new Date(cert.valid_from), "MMM d")} - {format(new Date(cert.valid_to), "MMM d, yyyy")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            <span className="flex items-center gap-1">
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCert(cert)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Medical Certificate</DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedCert.profiles?.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Status</Label>
                  <Badge className={STATUS_CONFIG[selectedCert.verification_status]?.color}>
                    {STATUS_CONFIG[selectedCert.verification_status]?.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issuing Doctor</Label>
                  <p>{selectedCert.issuing_doctor || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Medical Facility</Label>
                  <p>{selectedCert.medical_facility || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issue Date</Label>
                  <p>{selectedCert.issue_date ? format(new Date(selectedCert.issue_date), "PP") : "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valid Period</Label>
                  <p>
                    {selectedCert.valid_from && selectedCert.valid_to
                      ? `${format(new Date(selectedCert.valid_from), "PP")} - ${format(new Date(selectedCert.valid_to), "PP")}`
                      : "Not provided"}
                  </p>
                </div>
              </div>

              {selectedCert.verification_status === "pending" && (
                <>
                  <div className="border-t pt-4">
                    <Label>Select Action</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={verificationAction === "verify" ? "default" : "outline"}
                        onClick={() => setVerificationAction("verify")}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        variant={verificationAction === "reject" ? "destructive" : "outline"}
                        onClick={() => setVerificationAction("reject")}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant={verificationAction === "followup" ? "secondary" : "outline"}
                        onClick={() => setVerificationAction("followup")}
                        className="flex-1"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Follow-up
                      </Button>
                    </div>
                  </div>

                  {verificationAction && (
                    <div className="space-y-3">
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          placeholder="Add verification notes..."
                        />
                      </div>
                      {verificationAction === "reject" && (
                        <div>
                          <Label>Rejection Reason *</Label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide reason for rejection..."
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {selectedCert.verification_notes && (
                <div>
                  <Label className="text-muted-foreground">Previous Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedCert.verification_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            {selectedCert?.verification_status === "pending" && verificationAction && (
              <Button
                onClick={handleAction}
                disabled={updateMutation.isPending || (verificationAction === "reject" && !rejectionReason)}
              >
                {updateMutation.isPending ? "Saving..." : "Confirm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
