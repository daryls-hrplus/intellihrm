import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Award, Plus, Clock, CheckCircle, XCircle, AlertTriangle, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ESSQualificationSubmissionDialog } from "@/components/ess/ESSQualificationSubmissionDialog";

interface Qualification {
  id: string;
  record_type: string;
  name: string;
  education_level?: string;
  qualification_type?: string;
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
  status: string;
  verification_status?: string;
  document_url?: string;
  document_name?: string;
  created_at: string;
}

interface PendingRequest {
  id: string;
  request_type: string;
  new_values: Record<string, any>;
  status: string;
  created_at: string;
}

export default function MyQualificationsPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch employee's qualifications
  const { data: qualifications, isLoading, refetch } = useQuery({
    queryKey: ["my-qualifications", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("employee_qualifications")
        .select("*")
        .eq("employee_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Qualification[];
    },
    enabled: !!profile?.id,
  });

  // Fetch pending qualification change requests
  const { data: pendingRequests, refetch: refetchPending } = useQuery({
    queryKey: ["pending-qualification-requests", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("employee_data_change_requests")
        .select("*")
        .eq("employee_id", profile.id)
        .eq("request_type", "qualification")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PendingRequest[];
    },
    enabled: !!profile?.id,
  });

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending Verification</Badge>;
    }
  };

  const getExpiryBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
    }
    return null;
  };

  const filterQualifications = (quals: Qualification[] | undefined) => {
    if (!quals) return [];
    if (activeTab === "all") return quals;
    if (activeTab === "academic") return quals.filter(q => q.record_type === "academic");
    if (activeTab === "certification") return quals.filter(q => q.record_type === "certification");
    return quals;
  };

  const handleSuccess = () => {
    refetch();
    refetchPending();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.ess"), href: "/ess" },
            { label: t("ess.qualifications.title", "My Qualifications") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("ess.qualifications.title", "My Qualifications")}</h1>
            <p className="text-muted-foreground">
              {t("ess.qualifications.subtitle", "View and manage your academic qualifications and certifications")}
            </p>
          </div>
          <Button onClick={() => setShowSubmitDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("ess.qualifications.addNew", "Add Qualification")}
          </Button>
        </div>

        {/* Pending Submissions Banner */}
        {pendingRequests && pendingRequests.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                {t("ess.qualifications.pendingSubmissions", "Pending Submissions")}
              </CardTitle>
              <CardDescription>
                {t("ess.qualifications.pendingDescription", "These qualifications are awaiting HR approval")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      {request.new_values.record_type === "academic" ? (
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Award className="h-5 w-5 text-amber-600" />
                      )}
                      <div>
                        <p className="font-medium">{request.new_values.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Approval
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({qualifications?.length || 0})</TabsTrigger>
            <TabsTrigger value="academic">
              <GraduationCap className="h-4 w-4 mr-1" />
              Academic ({qualifications?.filter(q => q.record_type === "academic").length || 0})
            </TabsTrigger>
            <TabsTrigger value="certification">
              <Award className="h-4 w-4 mr-1" />
              Certifications ({qualifications?.filter(q => q.record_type === "certification").length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filterQualifications(qualifications).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">{t("ess.qualifications.noQualifications", "No qualifications found")}</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {t("ess.qualifications.noQualificationsDescription", "Add your academic qualifications and professional certifications")}
                  </p>
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("ess.qualifications.addFirst", "Add Your First Qualification")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filterQualifications(qualifications).map((qual) => (
                  <Card key={qual.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {qual.record_type === "academic" ? (
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                              <GraduationCap className="h-5 w-5 text-indigo-600" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-amber-500/10">
                              <Award className="h-5 w-5 text-amber-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">{qual.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {qual.record_type === "academic" 
                                ? qual.institution_name || "Institution not specified"
                                : qual.accrediting_body_name || "Issuing body not specified"
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {qual.record_type === "academic" ? (
                          <>
                            {qual.education_level && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Level:</span>
                                <span>{qual.education_level}</span>
                              </div>
                            )}
                            {qual.field_of_study && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Field:</span>
                                <span>{qual.field_of_study}</span>
                              </div>
                            )}
                            {qual.date_awarded && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Awarded:</span>
                                <span>{format(new Date(qual.date_awarded), "MMM yyyy")}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {qual.certification_type && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span>{qual.certification_type}</span>
                              </div>
                            )}
                            {qual.license_number && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">License #:</span>
                                <span>{qual.license_number}</span>
                              </div>
                            )}
                            {qual.issued_date && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Issued:</span>
                                <span>{format(new Date(qual.issued_date), "MMM yyyy")}</span>
                              </div>
                            )}
                            {qual.expiry_date && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Expires:</span>
                                <span>{format(new Date(qual.expiry_date), "MMM yyyy")}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {getVerificationBadge(qual.verification_status)}
                        {getExpiryBadge(qual.expiry_date)}
                        {qual.document_url && (
                          <a 
                            href={qual.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            View Document
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ESSQualificationSubmissionDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  );
}
