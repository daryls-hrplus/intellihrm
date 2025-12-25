import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  FileCheck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  Download,
  Loader2,
  Briefcase,
  Target,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
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
  qualification_type_id: string | null;
  education_level: string | null;
  field_of_study: string | null;
}

interface JobRequirement {
  id: string;
  requirement_type: string;
  is_mandatory: boolean;
  is_preferred: boolean;
  specific_qualification_name: string | null;
  notes: string | null;
  education_level: { name: string; order: number } | null;
  field_of_study: { name: string } | null;
  qualification_type: { name: string } | null;
  accrediting_body: { name: string } | null;
}

interface EmployeePosition {
  position_id: string;
  position_title: string;
  job_id: string | null;
  job_title: string | null;
}

type RequirementStatus = "met" | "expiring" | "expired" | "missing" | "not_verified";

interface RequirementWithStatus extends JobRequirement {
  status: RequirementStatus;
  matchingQualification: QualificationRecord | null;
}

export function QualificationComplianceView({ employeeId, viewType = "hr" }: QualificationComplianceViewProps) {
  // Fetch employee's current position(s) and job
  const { data: employeePositions, isLoading: positionsLoading } = useQuery({
    queryKey: ["employee-positions-for-compliance", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_positions")
        .select(`
          position_id,
          positions:position_id (
            id,
            title,
            job_id,
            jobs:job_id (
              id,
              title
            )
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_active", true);
      
      if (error) throw error;
      
      return (data || []).map((ep: any) => ({
        position_id: ep.position_id,
        position_title: ep.positions?.title || "Unknown Position",
        job_id: ep.positions?.job_id,
        job_title: ep.positions?.jobs?.title || null,
      })) as EmployeePosition[];
    },
  });

  // Get unique job IDs from positions
  const jobIds = [...new Set((employeePositions || []).map(p => p.job_id).filter(Boolean))] as string[];

  // Fetch job qualification requirements
  const { data: jobRequirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ["job-requirements-for-compliance", jobIds],
    queryFn: async () => {
      if (jobIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("job_qualification_requirements")
        .select(`
          id,
          requirement_type,
          is_mandatory,
          is_preferred,
          specific_qualification_name,
          notes,
          education_levels:education_level_id (name, "order"),
          fields_of_study:field_of_study_id (name),
          qualification_types:qualification_type_id (name),
          accrediting_bodies:accrediting_body_id (name)
        `)
        .in("job_id", jobIds)
        .or("end_date.is.null,end_date.gte." + new Date().toISOString().split('T')[0]);
      
      if (error) throw error;
      
      return (data || []).map((req: any) => ({
        id: req.id,
        requirement_type: req.requirement_type,
        is_mandatory: req.is_mandatory,
        is_preferred: req.is_preferred,
        specific_qualification_name: req.specific_qualification_name,
        notes: req.notes,
        education_level: req.education_levels,
        field_of_study: req.fields_of_study,
        qualification_type: req.qualification_types,
        accrediting_body: req.accrediting_bodies,
      })) as JobRequirement[];
    },
    enabled: jobIds.length > 0,
  });

  // Fetch employee qualifications
  const { data: qualifications, isLoading: qualificationsLoading } = useQuery({
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
          document_name,
          qualification_type_id,
          education_level,
          field_of_study
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

  // Match requirements to qualifications
  const matchRequirementToQualification = (req: JobRequirement): { status: RequirementStatus; matchingQualification: QualificationRecord | null } => {
    if (!qualifications || qualifications.length === 0) {
      return { status: "missing", matchingQualification: null };
    }

    // Find matching qualification based on requirement type and criteria
    let matchingQual: QualificationRecord | null = null;

    for (const qual of qualifications) {
      // Match by specific qualification name
      if (req.specific_qualification_name && 
          qual.name.toLowerCase().includes(req.specific_qualification_name.toLowerCase())) {
        matchingQual = qual;
        break;
      }
      
      // Match by qualification type (if we have qualification_type_id)
      if (req.qualification_type?.name && 
          qual.name.toLowerCase().includes(req.qualification_type.name.toLowerCase())) {
        matchingQual = qual;
        break;
      }
      
      // Match by accrediting body
      if (req.accrediting_body?.name && 
          qual.accrediting_body_name?.toLowerCase().includes(req.accrediting_body.name.toLowerCase())) {
        matchingQual = qual;
        break;
      }
    }

    if (!matchingQual) {
      return { status: "missing", matchingQualification: null };
    }

    // Check verification status
    if (matchingQual.verification_status !== "verified") {
      return { status: "not_verified", matchingQualification: matchingQual };
    }

    // Check expiry status
    const expiryInfo = getExpiryStatus(matchingQual.expiry_date);
    if (expiryInfo.status === "expired") {
      return { status: "expired", matchingQualification: matchingQual };
    }
    if (expiryInfo.status === "expiring_soon" || expiryInfo.status === "expiring") {
      return { status: "expiring", matchingQualification: matchingQual };
    }

    return { status: "met", matchingQualification: matchingQual };
  };

  // Analyze requirements with status
  const requirementsWithStatus: RequirementWithStatus[] = (jobRequirements || []).map(req => ({
    ...req,
    ...matchRequirementToQualification(req),
  }));

  // Calculate compliance metrics
  const mandatoryRequirements = requirementsWithStatus.filter(r => r.is_mandatory);
  const metMandatory = mandatoryRequirements.filter(r => r.status === "met").length;
  const compliancePercentage = mandatoryRequirements.length > 0 
    ? Math.round((metMandatory / mandatoryRequirements.length) * 100) 
    : 100;

  const getRequirementStatusBadge = (status: RequirementStatus) => {
    const config: Record<RequirementStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      met: { variant: "default", label: "Met", icon: <CheckCircle className="h-3 w-3" /> },
      expiring: { variant: "outline", label: "Expiring", icon: <AlertTriangle className="h-3 w-3" /> },
      expired: { variant: "destructive", label: "Expired", icon: <XCircle className="h-3 w-3" /> },
      missing: { variant: "destructive", label: "Missing", icon: <XCircle className="h-3 w-3" /> },
      not_verified: { variant: "secondary", label: "Not Verified", icon: <Clock className="h-3 w-3" /> },
    };

    const { variant, label, icon } = config[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getOverallComplianceBadge = () => {
    const hasExpired = requirementsWithStatus.some(r => r.is_mandatory && r.status === "expired");
    const hasMissing = requirementsWithStatus.some(r => r.is_mandatory && r.status === "missing");
    const hasExpiring = requirementsWithStatus.some(r => r.is_mandatory && r.status === "expiring");
    const hasNotVerified = requirementsWithStatus.some(r => r.is_mandatory && r.status === "not_verified");

    if (hasExpired || hasMissing) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Non-Compliant
        </Badge>
      );
    }
    if (hasExpiring || hasNotVerified) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
          <AlertTriangle className="h-3 w-3" />
          At Risk
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-500/20">
        <ShieldCheck className="h-3 w-3" />
        Compliant
      </Badge>
    );
  };

  const getRequirementName = (req: JobRequirement): string => {
    if (req.specific_qualification_name) return req.specific_qualification_name;
    if (req.qualification_type?.name) return req.qualification_type.name;
    if (req.accrediting_body?.name) return `${req.accrediting_body.name} Certification`;
    if (req.education_level?.name) return `${req.education_level.name} Degree`;
    return "Qualification";
  };

  // Summary stats for credentials
  const stats = {
    total: qualifications?.length || 0,
    expiringSoon: qualifications?.filter(q => {
      const status = getExpiryStatus(q.expiry_date);
      return status.status === "expiring_soon" || status.status === "expiring";
    }).length || 0,
    expired: qualifications?.filter(q => getExpiryStatus(q.expiry_date).status === "expired").length || 0,
    pendingVerification: qualifications?.filter(q => !q.verification_status || q.verification_status === "pending").length || 0,
    requiredMet: metMandatory,
    requiredTotal: mandatoryRequirements.length,
  };

  const isLoading = positionsLoading || requirementsLoading || qualificationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasJobRequirements = jobRequirements && jobRequirements.length > 0;

  return (
    <div className="space-y-6">
      {/* Job Requirements Section */}
      {hasJobRequirements && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Job Qualification Requirements
                </CardTitle>
                <CardDescription>
                  Required qualifications for current role(s): {employeePositions?.map(p => p.job_title || p.position_title).join(", ")}
                </CardDescription>
              </div>
              {getOverallComplianceBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Compliance Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Mandatory Requirements Compliance</span>
                <span className="font-medium">{stats.requiredMet}/{stats.requiredTotal} met ({compliancePercentage}%)</span>
              </div>
              <Progress 
                value={compliancePercentage} 
                className="h-2"
              />
            </div>

            {/* Requirements Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Matched Credential</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirementsWithStatus.map((req) => (
                  <TableRow key={req.id} className={req.is_mandatory && (req.status === "missing" || req.status === "expired") ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">{getRequirementName(req)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {req.requirement_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {req.is_mandatory ? (
                        <Badge variant="default">Mandatory</Badge>
                      ) : (
                        <Badge variant="secondary">Preferred</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getRequirementStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      {req.matchingQualification ? (
                        <span className="text-sm">{req.matchingQualification.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No match found</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Action prompt for missing/expired */}
            {requirementsWithStatus.some(r => r.is_mandatory && (r.status === "missing" || r.status === "expired")) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Missing or Expired Required Credentials</p>
                  <p className="text-xs text-muted-foreground">
                    Add or renew required qualifications to become compliant with job requirements.
                  </p>
                </div>
                {viewType !== "ess" && (
                  <Link to={`/workforce/employees/${employeeId}?tab=qualifications`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Add Credentials
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Job Requirements Message */}
      {!hasJobRequirements && employeePositions && employeePositions.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">No Job Qualification Requirements Defined</p>
                <p className="text-sm text-muted-foreground">
                  Current position(s): {employeePositions.map(p => p.position_title).join(", ")}. 
                  {employeePositions.some(p => !p.job_id) && " Some positions don't have an associated job profile."}
                  {employeePositions.every(p => p.job_id) && " The associated job(s) don't have qualification requirements configured."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Credentials</p>
          </CardContent>
        </Card>
        {hasJobRequirements && (
          <Card className={compliancePercentage === 100 ? "bg-green-500/10 border-green-500/20" : "bg-blue-500/10 border-blue-500/20"}>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${compliancePercentage === 100 ? "text-green-600" : "text-blue-600"}`}>
                {stats.requiredMet}/{stats.requiredTotal}
              </div>
              <p className="text-sm text-muted-foreground">Required for Role</p>
            </CardContent>
          </Card>
        )}
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
              All certifications and licenses from your qualifications
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
                  {hasJobRequirements && <TableHead>Job Requirement</TableHead>}
                  <TableHead>Issuing Body</TableHead>
                  <TableHead>License/Cert #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications?.map((qual) => {
                  // Check if this qualification satisfies any job requirement
                  const matchingRequirement = requirementsWithStatus.find(r => r.matchingQualification?.id === qual.id);
                  
                  return (
                    <TableRow key={qual.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecordTypeIcon(qual.record_type)}
                          <span className="text-sm">{getRecordTypeLabel(qual.record_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{qual.name}</TableCell>
                      {hasJobRequirements && (
                        <TableCell>
                          {matchingRequirement ? (
                            <Badge variant={matchingRequirement.is_mandatory ? "default" : "secondary"} className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {matchingRequirement.is_mandatory ? "Required" : "Preferred"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>{qual.accrediting_body_name || qual.institution_name || "-"}</TableCell>
                      <TableCell>{qual.license_number || "-"}</TableCell>
                      <TableCell>
                        {qual.issued_date ? formatDateForDisplay(qual.issued_date, "PP") : "-"}
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
