import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, GraduationCap, Award, FileText, Calendar, Building, MapPin } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Qualification {
  id: string;
  employee_id: string;
  company_id: string;
  record_type: string;
  name: string;
  status: string;
  verification_status: string;
  date_awarded?: string;
  issued_date?: string;
  expiry_date?: string;
  institution_name?: string;
  accrediting_body_name?: string;
  country?: string;
  specialization?: string;
  license_number?: string;
  document_url?: string;
  comments?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualification: Qualification | null;
  onSuccess: () => void;
}

export function VerificationDialog({
  open,
  onOpenChange,
  qualification,
  onSuccess,
}: VerificationDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  if (!qualification) return null;

  const handleVerification = async (status: "verified" | "rejected") => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("employee_qualifications")
        .update({
          verification_status: status,
          verified_by: user?.id,
          verification_date: new Date().toISOString(),
          verification_notes: verificationNotes || null,
        })
        .eq("id", qualification.id);

      if (error) throw error;

      toast.success(`Qualification ${status === "verified" ? "verified" : "rejected"} successfully`);
      setVerificationNotes("");
      onSuccess();
    } catch (error: any) {
      console.error("Error updating verification:", error);
      toast.error(error.message || "Failed to update verification status");
    } finally {
      setIsLoading(false);
    }
  };

  const isAcademic = qualification.record_type === "academic";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verify Qualification</DialogTitle>
          <DialogDescription>
            Review the qualification details and verify or reject.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{qualification.profiles?.full_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{qualification.profiles?.email}</p>
            </CardContent>
          </Card>

          {/* Qualification Details */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {isAcademic ? "Academic Qualification" : "Certification/License"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isAcademic ? (
                    <GraduationCap className="h-4 w-4 text-primary" />
                  ) : (
                    <Award className="h-4 w-4 text-primary" />
                  )}
                  <Badge variant="outline" className="capitalize">{qualification.record_type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-lg">{qualification.name}</p>
                {qualification.specialization && (
                  <p className="text-sm text-muted-foreground">Specialization: {qualification.specialization}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {isAcademic ? (
                  <>
                    {qualification.institution_name && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{qualification.institution_name}</span>
                      </div>
                    )}
                    {qualification.date_awarded && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Awarded: {formatDateForDisplay(qualification.date_awarded, "PPP")}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {qualification.accrediting_body_name && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{qualification.accrediting_body_name}</span>
                      </div>
                    )}
                    {qualification.license_number && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>License #: {qualification.license_number}</span>
                      </div>
                    )}
                    {qualification.issued_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Issued: {formatDateForDisplay(qualification.issued_date, "PPP")}</span>
                      </div>
                    )}
                    {qualification.expiry_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Expires: {formatDateForDisplay(qualification.expiry_date, "PPP")}</span>
                      </div>
                    )}
                  </>
                )}
                {qualification.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{qualification.country}</span>
                  </div>
                )}
              </div>

              {qualification.comments && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Comments:</p>
                  <p className="text-sm">{qualification.comments}</p>
                </div>
              )}

              {qualification.document_url && (
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <a href={qualification.document_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      View Document
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Notes */}
          <div>
            <Label>Verification Notes</Label>
            <Textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add notes about this verification (optional)..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleVerification("rejected")}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button onClick={() => handleVerification("verified")} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
