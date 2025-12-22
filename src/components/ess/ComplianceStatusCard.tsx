import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, XCircle, FileCheck, Award, ShieldCheck, FileText, Stamp } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComplianceRecord {
  id: string;
  type: string;
  category: "work_permit" | "license" | "background_check" | "certificate_of_character" | "regulatory_clearance";
  status: string;
  expiry_date: string | null;
  actionRequired: boolean;
}

interface ComplianceStatusCardProps {
  employeeId: string;
}

export function ComplianceStatusCard({ employeeId }: ComplianceStatusCardProps) {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplianceRecords();
  }, [employeeId]);

  const fetchComplianceRecords = async () => {
    setIsLoading(true);
    try {
      // Fetch work permits
      const { data: workPermits } = await supabase
        .from("employee_work_permits")
        .select("id, permit_type, status, expiry_date")
        .eq("employee_id", employeeId);

      // Fetch licenses
      const { data: licenses } = await supabase
        .from("employee_licenses")
        .select("id, license_type, status, expiry_date")
        .eq("employee_id", employeeId);

      // Fetch background checks (all categories)
      const { data: backgroundChecks } = await supabase
        .from("employee_background_checks")
        .select("id, check_type, status, expiry_date, category")
        .eq("employee_id", employeeId)
        .neq("status", "archived");

      const allRecords: ComplianceRecord[] = [];

      // Process work permits
      (workPermits || []).forEach((wp) => {
        const isExpired = wp.expiry_date && new Date(wp.expiry_date) < new Date();
        allRecords.push({
          id: wp.id,
          type: wp.permit_type.replace(/_/g, " "),
          category: "work_permit",
          status: isExpired ? "expired" : wp.status,
          expiry_date: wp.expiry_date,
          actionRequired: wp.status === "pending" || isExpired,
        });
      });

      // Process licenses
      (licenses || []).forEach((lic) => {
        const isExpired = lic.expiry_date && new Date(lic.expiry_date) < new Date();
        allRecords.push({
          id: lic.id,
          type: lic.license_type.replace(/_/g, " "),
          category: "license",
          status: isExpired ? "expired" : lic.status,
          expiry_date: lic.expiry_date,
          actionRequired: lic.status === "pending" || isExpired,
        });
      });

      // Process background checks by category
      (backgroundChecks || []).forEach((bc) => {
        const isExpired = bc.expiry_date && new Date(bc.expiry_date) < new Date();
        const category = (bc.category || "background_check") as ComplianceRecord["category"];
        allRecords.push({
          id: bc.id,
          type: bc.check_type.replace(/_/g, " "),
          category: category,
          status: isExpired ? "expired" : bc.status,
          expiry_date: bc.expiry_date,
          actionRequired: bc.status === "pending" || isExpired,
        });
      });

      setRecords(allRecords);
    } catch (error) {
      console.error("Failed to fetch compliance records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallStatus = () => {
    if (records.length === 0) return "none";
    
    const hasExpired = records.some((r) => r.status === "expired");
    const hasPending = records.some((r) => r.status === "pending" || r.status === "in_progress");
    
    if (hasExpired) return "non_compliant";
    if (hasPending) return "attention";
    return "compliant";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "attention":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "non_compliant":
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Shield className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "compliant":
        return "All Good";
      case "attention":
        return "Attention Needed";
      case "non_compliant":
        return "Action Required";
      default:
        return "No Records";
    }
  };

  const getCategoryIcon = (category: ComplianceRecord["category"]) => {
    switch (category) {
      case "work_permit":
        return <FileCheck className="h-4 w-4" />;
      case "license":
        return <Award className="h-4 w-4" />;
      case "background_check":
        return <ShieldCheck className="h-4 w-4" />;
      case "certificate_of_character":
        return <FileText className="h-4 w-4" />;
      case "regulatory_clearance":
        return <Stamp className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRecordStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <Badge variant="default" className="text-xs">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="text-xs">In Progress</Badge>;
      case "expired":
        return <Badge variant="destructive" className="text-xs">Expired</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs capitalize">{status}</Badge>;
    }
  };

  const filterByCategory = (category: ComplianceRecord["category"]) => {
    return records.filter((r) => r.category === category);
  };

  const overallStatus = getOverallStatus();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading compliance status...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <CardTitle className="text-lg">{getStatusText(overallStatus)}</CardTitle>
                <CardDescription>
                  {records.length} compliance record{records.length !== 1 ? "s" : ""} on file
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Records by Category */}
      <Tabs defaultValue="work_permits" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="work_permits" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Work Permits ({filterByCategory("work_permit").length})
          </TabsTrigger>
          <TabsTrigger value="licenses" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Licenses ({filterByCategory("license").length})
          </TabsTrigger>
          <TabsTrigger value="background" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Background ({filterByCategory("background_check").length})
          </TabsTrigger>
          <TabsTrigger value="character" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Character ({filterByCategory("certificate_of_character").length})
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2">
            <Stamp className="h-4 w-4" />
            Regulatory ({filterByCategory("regulatory_clearance").length})
          </TabsTrigger>
        </TabsList>

        {["work_permits", "licenses", "background", "character", "regulatory"].map((tab) => {
          const categoryMap: Record<string, ComplianceRecord["category"]> = {
            work_permits: "work_permit",
            licenses: "license",
            background: "background_check",
            character: "certificate_of_character",
            regulatory: "regulatory_clearance",
          };
          const categoryRecords = filterByCategory(categoryMap[tab]);

          return (
            <TabsContent key={tab} value={tab}>
              {categoryRecords.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {getCategoryIcon(categoryMap[tab])}
                    <p className="mt-2">No records in this category</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {categoryRecords.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(record.category)}
                            <div>
                              <p className="font-medium capitalize">{record.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {record.expiry_date 
                                  ? `Expires: ${formatDateForDisplay(record.expiry_date)}`
                                  : "No expiry date"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getRecordStatusBadge(record.status)}
                            <div className="text-sm">
                              <span className="text-muted-foreground">Action: </span>
                              <span className={record.actionRequired ? "text-destructive font-medium" : "text-muted-foreground"}>
                                {record.actionRequired ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
