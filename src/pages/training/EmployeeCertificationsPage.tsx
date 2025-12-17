import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Award, Search, Users, Download } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { differenceInDays } from "date-fns";

interface EmployeeCertification {
  id: string;
  employee_name: string;
  employee_id: string;
  course_title: string;
  issued_at: string;
  expires_at: string | null;
  status: "active" | "expired" | "expiring_soon";
}

export default function EmployeeCertificationsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, [selectedCompanyId, selectedDepartmentId]);

  const fetchCertifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lms_certificates")
        .select(`
          id,
          issued_at,
          expires_at,
          user_id,
          course:lms_courses(title),
          profile:profiles(first_name, last_name, employee_id)
        `)
        .order("issued_at", { ascending: false });

      if (error) throw error;

      const formattedData: EmployeeCertification[] = (data || []).map((cert: any) => {
        let status: "active" | "expired" | "expiring_soon" = "active";
        if (cert.expires_at) {
          const expiresAt = new Date(cert.expires_at);
          const daysUntilExpiry = differenceInDays(expiresAt, new Date());
          if (daysUntilExpiry < 0) {
            status = "expired";
          } else if (daysUntilExpiry <= 30) {
            status = "expiring_soon";
          }
        }

        return {
          id: cert.id,
          employee_name: `${cert.profile?.first_name || ""} ${cert.profile?.last_name || ""}`.trim() || "Unknown",
          employee_id: cert.profile?.employee_id || cert.user_id,
          course_title: cert.course?.title || "Unknown Course",
          issued_at: cert.issued_at,
          expires_at: cert.expires_at,
          status,
        };
      });

      setCertifications(formattedData);
    } catch (error) {
      console.error("Error fetching certifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "expiring_soon":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Expiring Soon</Badge>;
      case "expired":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/training")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Award className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("training.modules.employeeCertifications.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("training.modules.employeeCertifications.description")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={(id) => {
                setSelectedCompanyId(id);
                setSelectedDepartmentId("all");
              }}
            />
            <DepartmentFilter
              companyId={selectedCompanyId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={setSelectedDepartmentId}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Certifications
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("training.modules.employeeCertifications.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("training.modules.employeeCertifications.allStatuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("training.modules.employeeCertifications.allStatuses")}</SelectItem>
                    <SelectItem value="active">{t("training.modules.employeeCertifications.active")}</SelectItem>
                    <SelectItem value="expiring_soon">{t("training.modules.employeeCertifications.expiringSoon")}</SelectItem>
                    <SelectItem value="expired">{t("training.modules.employeeCertifications.expired")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCertifications.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("training.modules.employeeCertifications.noCertifications")}</p>
                <p className="text-sm text-muted-foreground">{t("training.modules.employeeCertifications.adjustFilters")}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">Employee</th>
                      <th className="p-3 text-left text-sm font-medium">Certificate</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                      <th className="p-3 text-left text-sm font-medium">Issued</th>
                      <th className="p-3 text-left text-sm font-medium">Expires</th>
                      <th className="p-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertifications.map((cert) => (
                      <tr key={cert.id} className="border-b last:border-0">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{cert.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{cert.employee_id}</p>
                          </div>
                        </td>
                        <td className="p-3">{cert.course_title}</td>
                        <td className="p-3">{getStatusBadge(cert.status)}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "Never"}
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
