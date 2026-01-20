import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Shield,
  Building2,
  Eye,
  Download,
  FileText,
  AlertTriangle,
  Clock,
  Settings,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { usePageAudit } from "@/hooks/usePageAudit";
import { usePermissionsOverview } from "@/hooks/usePermissionsOverview";
import { UserAccessMatrix } from "@/components/permissions/UserAccessMatrix";
import { RolePermissionsMatrix } from "@/components/permissions/RolePermissionsMatrix";
import { OrganizationalScopeMatrix } from "@/components/permissions/OrganizationalScopeMatrix";
import { EssSensitiveDataTab } from "@/components/permissions/EssSensitiveDataTab";
import { Link } from "react-router-dom";

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Permissions Overview" },
];

export default function PermissionsOverviewPage() {
  usePageAudit("permissions_overview", "Admin");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { isLoading, users, roles, essModules, essFields, stats, accessibleCompanies } = usePermissionsOverview(selectedCompanyId);

  // Default to current company when accessible companies load
  useEffect(() => {
    if (accessibleCompanies.length > 0 && !selectedCompanyId) {
      const currentCompany = accessibleCompanies.find(c => c.isCurrentCompany);
      setSelectedCompanyId(currentCompany?.id || accessibleCompanies[0].id);
    }
  }, [accessibleCompanies, selectedCompanyId]);

  const showMultiCompany = accessibleCompanies.length > 1;
  const selectedCompanyName = selectedCompanyId === "all" 
    ? "All Companies" 
    : accessibleCompanies.find(c => c.id === selectedCompanyId)?.name || "Company";

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Roles",
      "Is Admin",
      "PII Level",
      "Risk Level",
      "Admin Containers",
    ];

    const rows = users.map((user) => [
      user.full_name || "Unnamed",
      user.email,
      user.roles.map((r) => r.name).join("; ") || "None",
      user.isAdmin ? "Yes" : "No",
      user.piiLevel,
      user.riskLevel,
      `${user.adminContainerCount}/7`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `permissions-overview-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions Overview</h1>
            <p className="text-muted-foreground mt-1">
              Unified view of all access controls across users, roles, and organizations
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Company Selector */}
            <Select 
              value={selectedCompanyId || ""} 
              onValueChange={setSelectedCompanyId}
            >
              <SelectTrigger className="w-[220px]">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {showMultiCompany && (
                  <SelectItem value="all">All Accessible Companies</SelectItem>
                )}
                {accessibleCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.code} - {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/audit-logs">
                <FileText className="mr-2 h-4 w-4" />
                Audit Log
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            icon={Users}
            label={selectedCompanyId === "all" ? "All Company Users" : "Company Users"}
            value={stats.totalUsers}
            onClick={() => setActiveTab("users")}
            active={activeTab === "users"}
          />
          <StatCard
            icon={Shield}
            label="Administrators"
            value={stats.adminUsers}
            warning={stats.adminUsers > stats.totalUsers * 0.1}
            warningText="High admin ratio"
            onClick={() => setActiveTab("users")}
          />
          <StatCard
            icon={Eye}
            label="Full PII Access"
            value={stats.fullPiiUsers}
            warning={stats.fullPiiUsers > 10}
            warningText="Review needed"
            onClick={() => setActiveTab("ess")}
          />
          <StatCard
            icon={Clock}
            label="Pending Requests"
            value={stats.pendingRequests}
            href="/admin/access-requests"
          />
          <StatCard
            icon={AlertTriangle}
            label="High-Risk Users"
            value={stats.highRiskUsers}
            warning={stats.highRiskUsers > 0}
            warningText="Immediate review"
            onClick={() => setActiveTab("users")}
          />
          <StatCard
            icon={Settings}
            label="ESS Modules"
            value={stats.essConfigurations}
            onClick={() => setActiveTab("ess")}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Access</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="org" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Org Scope</span>
            </TabsTrigger>
            <TabsTrigger value="ess" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">ESS & PII</span>
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="pt-6">
              <TabsContent value="users" className="mt-0">
                <UserAccessMatrix users={users} roles={roles} showCompanyColumn={selectedCompanyId === "all"} />
              </TabsContent>

              <TabsContent value="roles" className="mt-0">
                <RolePermissionsMatrix roles={roles} />
              </TabsContent>

              <TabsContent value="org" className="mt-0">
                <OrganizationalScopeMatrix roles={roles} />
              </TabsContent>

              <TabsContent value="ess" className="mt-0">
                <EssSensitiveDataTab 
                  essModules={essModules} 
                  essFields={essFields} 
                  roles={roles} 
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-success/15 flex items-center justify-center text-success">✓</span>
            <span>Full Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-warning/15 flex items-center justify-center text-warning">👁</span>
            <span>Limited/View</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-muted-foreground">🚫</span>
            <span>Masked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/40">—</span>
            <span>No Access</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  warning?: boolean;
  warningText?: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  warning,
  warningText,
  onClick,
  href,
  active,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "transition-all cursor-pointer hover:shadow-md",
        active && "ring-2 ring-primary",
        warning && "border-warning/50"
      )}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-lg p-2",
              warning ? "bg-warning/10" : "bg-primary/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                warning ? "text-warning" : "text-primary"
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {warning && warningText && (
              <p className="text-[10px] text-warning font-medium">{warningText}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}
