import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, Search, GraduationCap, Award, FileCheck, Loader2,
  CheckCircle, XCircle, Clock, Filter, Building2, Upload, FileText, 
  MoreHorizontal, Pencil, Trash2, User, RefreshCw, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { QualificationDialog } from "@/components/workforce/qualifications/QualificationDialog";
import { VerificationDialog } from "@/components/workforce/qualifications/VerificationDialog";
import { QualificationAnalytics } from "@/components/workforce/qualifications/QualificationAnalytics";
import { BulkQualificationUpload } from "@/components/workforce/qualifications/BulkQualificationUpload";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface Company {
  id: string;
  name: string;
}

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
  document_url?: string;
  document_name?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export default function QualificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<Qualification | null>(null);
  const [editQualification, setEditQualification] = useState<Qualification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qualificationToDelete, setQualificationToDelete] = useState<Qualification | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    academic: 0,
    certifications: 0,
    pendingVerification: 0,
    expiringSoon: 0,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchQualifications();
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setCompanies(data);
    }
  };

  const fetchQualifications = async () => {
    setIsLoading(true);
    try {
      let query = (supabase as any)
        .from("employee_qualifications")
        .select(`
          *,
          profiles!employee_qualifications_employee_id_fkey (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQualifications((data || []) as Qualification[]);
      calculateStats((data || []) as Qualification[]);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      toast.error("Failed to fetch qualifications");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Qualification[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    setStats({
      total: data.length,
      academic: data.filter((q) => q.record_type === "academic").length,
      certifications: data.filter((q) => ["certification", "license", "membership"].includes(q.record_type)).length,
      pendingVerification: data.filter((q) => q.verification_status === "pending").length,
      expiringSoon: data.filter((q) => 
        q.expiry_date && new Date(q.expiry_date) <= thirtyDaysFromNow && new Date(q.expiry_date) >= now
      ).length,
    });
  };

  const filteredQualifications = qualifications.filter((q) => {
    const matchesSearch = 
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.accrediting_body_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRecordType = recordTypeFilter === "all" || q.record_type === recordTypeFilter;
    const matchesVerification = verificationFilter === "all" || q.verification_status === verificationFilter;
    
    return matchesSearch && matchesRecordType && matchesVerification;
  });

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "academic":
        return <GraduationCap className="h-4 w-4" />;
      case "certification":
      case "license":
      case "membership":
        return <Award className="h-4 w-4" />;
      default:
        return <FileCheck className="h-4 w-4" />;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getStatusBadge = (status: string, expiryDate?: string) => {
    const isExpiringSoon = expiryDate && 
      new Date(expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && 
      new Date(expiryDate) >= new Date();
    const isExpired = expiryDate && new Date(expiryDate) < new Date();

    if (isExpired) {
      return <Badge className="bg-destructive">Expired</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
    }
    
    switch (status) {
      case "active":
      case "completed":
        return <Badge className="bg-success/10 text-success">{status}</Badge>;
      case "ongoing":
      case "in_progress":
        return <Badge className="bg-info/10 text-info">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleVerify = (qualification: Qualification) => {
    setSelectedQualification(qualification);
    setVerifyDialogOpen(true);
  };

  const handleEdit = (qualification: Qualification) => {
    setEditQualification(qualification);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!qualificationToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("employee_qualifications")
        .delete()
        .eq("id", qualificationToDelete.id);

      if (error) throw error;

      toast.success("Qualification deleted successfully");
      fetchQualifications();
    } catch (error: any) {
      console.error("Error deleting qualification:", error);
      toast.error(error.message || "Failed to delete qualification");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setQualificationToDelete(null);
    }
  };

  const confirmDelete = (qualification: Qualification) => {
    setQualificationToDelete(qualification);
    setDeleteDialogOpen(true);
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return expiry <= ninetyDaysFromNow && expiry >= now;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("nav.workforce"), href: "/workforce" },
            { label: t("workforce.modules.qualifications.title", "Qualifications") },
          ]}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Qualifications</h1>
              <p className="text-muted-foreground">Manage academic qualifications and professional certifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Qualification
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Academic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.academic}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.certifications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{stats.pendingVerification}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{stats.expiringSoon}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Qualifications</TabsTrigger>
            <TabsTrigger value="verification">Verification Queue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, employee, institution..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Record Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="participation">Participation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredQualifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mb-4 opacity-50" />
                    <p>No qualifications found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Institution/Body</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQualifications.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{q.profiles?.full_name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{q.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRecordTypeIcon(q.record_type)}
                              <span className="capitalize">{q.record_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{q.name}</p>
                          </TableCell>
                          <TableCell>
                            {q.institution_name || q.accrediting_body_name || "-"}
                          </TableCell>
                          <TableCell>
                            {q.date_awarded 
                              ? formatDateForDisplay(q.date_awarded, "MMM d, yyyy")
                              : q.issued_date 
                                ? formatDateForDisplay(q.issued_date, "MMM d, yyyy")
                                : "-"
                            }
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(q.status, q.expiry_date)}
                          </TableCell>
                          <TableCell>
                            {getVerificationBadge(q.verification_status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(q)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {q.verification_status === "pending" && (
                                  <DropdownMenuItem onClick={() => handleVerify(q)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify
                                  </DropdownMenuItem>
                                )}
                                {q.document_url && (
                                  <DropdownMenuItem onClick={() => window.open(q.document_url, '_blank')}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Document
                                  </DropdownMenuItem>
                                )}
                                {isExpiringSoon(q.expiry_date) && (
                                  <DropdownMenuItem onClick={() => handleEdit(q)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Renew
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/workforce/employees/${q.employee_id}?tab=qualifications`)}>
                                  <User className="h-4 w-4 mr-2" />
                                  View Employee Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => confirmDelete(q)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>Review and verify employee qualifications</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQualifications
                        .filter((q) => q.verification_status === "pending")
                        .map((q) => (
                          <TableRow key={q.id}>
                            <TableCell>{q.profiles?.full_name || "Unknown"}</TableCell>
                            <TableCell>{q.name}</TableCell>
                            <TableCell className="capitalize">{q.record_type}</TableCell>
                            <TableCell>{formatDateForDisplay(q.created_at, "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {q.document_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(q.document_url, '_blank')}
                                    title={q.document_name || "View Document"}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                )}
                                <Button size="sm" onClick={() => handleVerify(q)}>
                                  Review & Verify
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <QualificationAnalytics 
              qualifications={qualifications} 
              companyId={selectedCompanyId === "all" ? undefined : selectedCompanyId}
            />
          </TabsContent>
        </Tabs>
      </div>

      <QualificationDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditQualification(null);
        }}
        onSuccess={() => {
          setDialogOpen(false);
          setEditQualification(null);
          fetchQualifications();
        }}
        companyId={selectedCompanyId === "all" ? undefined : selectedCompanyId}
        qualification={editQualification}
      />

      <VerificationDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        qualification={selectedQualification}
        onSuccess={() => {
          setVerifyDialogOpen(false);
          setSelectedQualification(null);
          fetchQualifications();
        }}
      />

      <BulkQualificationUpload
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onSuccess={fetchQualifications}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Qualification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{qualificationToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
