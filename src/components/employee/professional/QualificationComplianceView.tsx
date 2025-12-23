import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  GraduationCap, 
  FileCheck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  Download,
  Loader2
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Link } from "react-router-dom";

interface QualificationComplianceViewProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

interface QualificationRecord {
  id: string;
  record_type: string;
  name: string;
  accrediting_body_name: string | null;
  institution_name: string | null;
  license_number: string | null;
  issued_date: string | null;
  expiry_date: string | null;
  status: string | null;
  verification_status: string | null;
  document_url: string | null;
  document_name: string | null;
}

export function QualificationComplianceView({ employeeId, viewType = "hr" }: QualificationComplianceViewProps) {
  const { data: qualifications, isLoading } = useQuery({
    queryKey: ["qualification-compliance", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_qualifications")
        .select(`
          id,
          record_type,
          name,
          accrediting_body_name,
          institution_name,
          license_number,
          issued_date,
          expiry_date,
          status,
          verification_status,
          document_url,
          document_name
        `)
        .eq("employee_id", employeeId)
        .in("record_type", ["certification", "license"])
        .order("expiry_date", { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data as QualificationRecord[];
    },
  });

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: "no_expiry", label: "No Expiry", daysUntil: null };
    
    const days = differenceInDays(new Date(expiryDate), new Date());
    
    if (days < 0) {
      return { status: "expired", label: "Expired", daysUntil: days };
    } else if (days <= 30) {
      return { status: "expiring_soon", label: "Expiring Soon", daysUntil: days };
    } else if (days <= 90) {
      return { status: "expiring", label: "Expiring", daysUntil: days };
    } else {
      return { status: "valid", label: "Valid", daysUntil: days };
    }
  };

  const getExpiryBadge = (expiryDate: string | null) => {
    const { status, label, daysUntil } = getExpiryStatus(expiryDate);
    
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      expired: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      expiring_soon: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
      expiring: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
      valid: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      no_expiry: { variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
    };

    const { variant, icon } = config[status] || config.valid;

    return (
      <div className="flex flex-col gap-1">
        <Badge variant={variant} className="flex items-center gap-1 w-fit">
          {icon}
          {label}
        </Badge>
        {daysUntil !== null && (
          <span className="text-xs text-muted-foreground">
            {daysUntil < 0 
              ? `${Math.abs(daysUntil)} days ago` 
              : `${daysUntil} days left`}
          </span>
        )}
      </div>
    );
  };

  const getVerificationBadge = (verificationStatus: string | null) => {
    const status = verificationStatus || "pending";
    
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      verified: { variant: "default", label: "Verified", icon: <CheckCircle className="h-3 w-3" /> },
      pending: { variant: "outline", label: "Pending", icon: <Clock className="h-3 w-3" /> },
      rejected: { variant: "destructive", label: "Rejected", icon: <XCircle className="h-3 w-3" /> },
      requires_review: { variant: "secondary", label: "Needs Review", icon: <AlertTriangle className="h-3 w-3" /> },
    };

    const { variant, label, icon } = config[status] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getRecordTypeIcon = (recordType: string) => {
    switch (recordType) {
      case "certification":
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case "license":
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getRecordTypeLabel = (recordType: string) => {
    return recordType.charAt(0).toUpperCase() + recordType.slice(1);
  };

  const getFileDownloadUrl = (filePath: string) => {
    const { data } = supabase.storage.from("employee-documents").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Summary stats
  const stats = {
    total: qualifications?.length || 0,
    expiringSoon: qualifications?.filter(q => {
      const status = getExpiryStatus(q.expiry_date);
      return status.status === "expiring_soon" || status.status === "expiring";
    }).length || 0,
    expired: qualifications?.filter(q => getExpiryStatus(q.expiry_date).status === "expired").length || 0,
    pendingVerification: qualifications?.filter(q => !q.verification_status || q.verification_status === "pending").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Credentials</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-sm text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.pendingVerification}</div>
            <p className="text-sm text-muted-foreground">Pending Verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Credentials Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Certifications & Licenses
            </CardTitle>
            <CardDescription>
              Compliance status of certifications and licenses from your qualifications
            </CardDescription>
          </div>
          {viewType !== "ess" && (
            <Link to={`/workforce/employees/${employeeId}?tab=qualifications`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Manage in Qualifications
              </Button>
            </Link>
          )}
          {viewType === "ess" && (
            <Link to="/ess/qualifications">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View in Qualifications
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {qualifications?.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No certifications or licenses found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add credentials in the Qualifications module to track compliance here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Credential Name</TableHead>
                  <TableHead>Issuing Body</TableHead>
                  <TableHead>License/Cert #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications?.map((qual) => (
                  <TableRow key={qual.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRecordTypeIcon(qual.record_type)}
                        <span className="text-sm">{getRecordTypeLabel(qual.record_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{qual.name}</TableCell>
                    <TableCell>{qual.accrediting_body_name || qual.institution_name || "-"}</TableCell>
                    <TableCell>{qual.license_number || "-"}</TableCell>
                    <TableCell>
                      {qual.issued_date ? format(new Date(qual.issued_date), "PP") : "-"}
                    </TableCell>
                    <TableCell>{getExpiryBadge(qual.expiry_date)}</TableCell>
                    <TableCell>{getVerificationBadge(qual.verification_status)}</TableCell>
                    <TableCell>
                      {qual.document_url ? (
                        <a
                          href={getFileDownloadUrl(qual.document_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                          title={qual.document_name || "Download"}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
