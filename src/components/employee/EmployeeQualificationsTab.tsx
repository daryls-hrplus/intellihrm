import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Download, GraduationCap, Award, FileCheck, AlertTriangle, CheckCircle, Clock, XCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { QualificationDialog } from "@/components/workforce/qualifications/QualificationDialog";

interface EmployeeQualificationsTabProps {
  employeeId: string;
}

interface Qualification {
  id: string;
  employee_id: string;
  company_id: string;
  record_type: string;
  name: string;
  status: string;
  verification_status: string;
  education_level?: string;
  qualification_type?: string;
  qualification_type_id?: string;
  field_of_study?: string;
  specialization?: string;
  institution_name?: string;
  certification_type?: string;
  accrediting_body_name?: string;
  license_number?: string;
  country?: string;
  date_awarded?: string;
  issued_date?: string;
  expiry_date?: string;
  start_date?: string;
  end_date?: string;
  comments?: string;
  document_url?: string;
  document_name?: string;
}

interface JobRequirement {
  id: string;
  requirement_type: string;
  is_mandatory: boolean;
  specific_qualification_name: string | null;
  qualification_type_name: string | null;
  accrediting_body_name: string | null;
}

export function EmployeeQualificationsTab({ employeeId }: EmployeeQualificationsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("all");
  const [requirementFilter, setRequirementFilter] = useState<string>("all");

  // Fetch employee to get company_id
  const { data: employee } = useQuery({
    queryKey: ["employee-for-qualifications", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("id", employeeId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch employee's current job requirements
  const { data: jobRequirements } = useQuery({
    queryKey: ["employee-job-requirements", employeeId],
    queryFn: async () => {
      // First get employee's active positions
      const { data: positions, error: posError } = await supabase
        .from("employee_positions")
        .select(`
          positions:position_id (
            job_id
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_active", true);
      
      if (posError) throw posError;
      
      const jobIds = (positions || [])
        .map((p: any) => p.positions?.job_id)
        .filter(Boolean);
      
      if (jobIds.length === 0) return [];
      
      // Get job requirements
      const { data: requirements, error: reqError } = await supabase
        .from("job_qualification_requirements")
        .select(`
          id,
          requirement_type,
          is_mandatory,
          specific_qualification_name,
          qualification_types:qualification_type_id (name),
          accrediting_bodies:accrediting_body_id (name)
        `)
        .in("job_id", jobIds)
        .or("end_date.is.null,end_date.gte." + new Date().toISOString().split('T')[0]);
      
      if (reqError) throw reqError;
      
      return (requirements || []).map((r: any) => ({
        id: r.id,
        requirement_type: r.requirement_type,
        is_mandatory: r.is_mandatory,
        specific_qualification_name: r.specific_qualification_name,
        qualification_type_name: r.qualification_types?.name || null,
        accrediting_body_name: r.accrediting_bodies?.name || null,
      })) as JobRequirement[];
    },
  });

  const { data: qualifications, isLoading } = useQuery({
    queryKey: ["employee-qualifications", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_qualifications")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Qualification[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_qualifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-qualifications", employeeId] });
      toast.success("Qualification deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete qualification"),
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["employee-qualifications", employeeId] });
    setIsDialogOpen(false);
    setEditingQualification(null);
  };

  const handleEdit = (qualification: Qualification) => {
    setEditingQualification(qualification);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingQualification(null);
    setIsDialogOpen(true);
  };

  const getRecordTypeIcon = (recordType: string) => {
    switch (recordType) {
      case "academic":
        return <GraduationCap className="h-4 w-4" />;
      case "certification":
        return <Award className="h-4 w-4" />;
      case "license":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getRecordTypeBadge = (recordType: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      academic: "default",
      certification: "secondary",
      license: "outline",
    };
    return (
      <Badge variant={variants[recordType] || "default"} className="flex items-center gap-1">
        {getRecordTypeIcon(recordType)}
        {recordType.charAt(0).toUpperCase() + recordType.slice(1)}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const getExpiryBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }
    return null;
  };

  // Check if a qualification matches any job requirement
  const getJobRequirementMatch = (qual: Qualification): { isRequired: boolean; isMandatory: boolean } => {
    if (!jobRequirements || jobRequirements.length === 0) {
      return { isRequired: false, isMandatory: false };
    }

    for (const req of jobRequirements) {
      // Match by specific qualification name
      if (req.specific_qualification_name && 
          qual.name.toLowerCase().includes(req.specific_qualification_name.toLowerCase())) {
        return { isRequired: true, isMandatory: req.is_mandatory };
      }
      
      // Match by qualification type
      if (req.qualification_type_name && 
          qual.name.toLowerCase().includes(req.qualification_type_name.toLowerCase())) {
        return { isRequired: true, isMandatory: req.is_mandatory };
      }
      
      // Match by accrediting body
      if (req.accrediting_body_name && 
          qual.accrediting_body_name?.toLowerCase().includes(req.accrediting_body_name.toLowerCase())) {
        return { isRequired: true, isMandatory: req.is_mandatory };
      }
    }

    return { isRequired: false, isMandatory: false };
  };

  const filteredQualifications = qualifications?.filter((q) => {
    // Filter by record type
    if (recordTypeFilter !== "all" && q.record_type !== recordTypeFilter) return false;
    
    // Filter by job requirement
    if (requirementFilter === "required") {
      const match = getJobRequirementMatch(q);
      if (!match.isRequired) return false;
    } else if (requirementFilter === "additional") {
      const match = getJobRequirementMatch(q);
      if (match.isRequired) return false;
    }
    
    return true;
  });

  const hasJobRequirements = jobRequirements && jobRequirements.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Qualifications
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="certification">Certification</SelectItem>
              <SelectItem value="license">License</SelectItem>
            </SelectContent>
          </Select>
          {hasJobRequirements && (
            <Select value={requirementFilter} onValueChange={setRequirementFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Job requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualifications</SelectItem>
                <SelectItem value="required">Required for Job</SelectItem>
                <SelectItem value="additional">Additional</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Qualification
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredQualifications?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No qualifications found. Click "Add Qualification" to add one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                {hasJobRequirements && <TableHead>Job Requirement</TableHead>}
                <TableHead>Institution/Issuer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQualifications?.map((qual) => {
                const jobMatch = getJobRequirementMatch(qual);
                
                return (
                  <TableRow key={qual.id}>
                    <TableCell>{getRecordTypeBadge(qual.record_type)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{qual.name}</p>
                        {qual.field_of_study && (
                          <p className="text-sm text-muted-foreground">{qual.field_of_study}</p>
                        )}
                        {qual.license_number && (
                          <p className="text-sm text-muted-foreground">#{qual.license_number}</p>
                        )}
                      </div>
                    </TableCell>
                    {hasJobRequirements && (
                      <TableCell>
                        {jobMatch.isRequired ? (
                          <Badge 
                            variant={jobMatch.isMandatory ? "default" : "secondary"} 
                            className="flex items-center gap-1 w-fit"
                          >
                            <Briefcase className="h-3 w-3" />
                            {jobMatch.isMandatory ? "Required" : "Preferred"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Additional</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p>{qual.institution_name || qual.accrediting_body_name || "-"}</p>
                        {qual.country && (
                          <p className="text-sm text-muted-foreground">{qual.country}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {qual.record_type === "academic" 
                        ? qual.date_awarded 
                          ? formatDateForDisplay(qual.date_awarded, "PP") 
                          : qual.end_date 
                            ? formatDateForDisplay(qual.end_date, "PP")
                            : "-"
                        : qual.issued_date 
                          ? formatDateForDisplay(qual.issued_date, "PP") 
                          : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {qual.expiry_date ? formatDateForDisplay(qual.expiry_date, "PP") : "-"}
                        {getExpiryBadge(qual.expiry_date)}
                      </div>
                    </TableCell>
                    <TableCell>{getVerificationBadge(qual.verification_status)}</TableCell>
                    <TableCell>
                      {qual.document_url ? (
                        <a href={qual.document_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(qual)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(qual.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <QualificationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
        companyId={employee?.company_id}
        employeeId={employeeId}
        qualification={editingQualification}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Qualification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this qualification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
