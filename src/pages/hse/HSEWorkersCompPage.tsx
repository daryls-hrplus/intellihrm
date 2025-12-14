import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Briefcase, 
  Plus, 
  Search, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { useState } from "react";

export default function HSEWorkersCompPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: claims, isLoading } = useQuery({
    queryKey: ["hse-workers-comp-claims", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_workers_comp_claims")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredClaims = claims?.filter((claim) => {
    const matchesSearch = claim.claim_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.claim_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">-</Badge>;
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      filed: "secondary",
      under_review: "default",
      approved: "default",
      denied: "destructive",
      closed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{t(`hseModule.workersComp.statusOptions.${status}`)}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.workersComp.stats.totalClaims"), 
      value: claims?.length || 0, 
      icon: FileText, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.workersComp.stats.pendingClaims"), 
      value: claims?.filter(c => c.claim_status === "under_review" || c.claim_status === "filed").length || 0, 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600" 
    },
    {
      label: t("hseModule.workersComp.stats.approvedClaims"), 
      value: claims?.filter(c => c.claim_status === "approved").length || 0, 
      icon: CheckCircle, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
    { 
      label: t("hseModule.workersComp.stats.totalCompensation"), 
      value: `$${(claims?.reduce((sum, c) => sum + (c.total_paid || 0), 0) || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-sky-500/10 text-sky-600" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.workersComp.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.workersComp.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.workersComp.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
            />
            <DepartmentFilter
              companyId={selectedCompanyId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={setSelectedDepartmentId}
            />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("hseModule.workersComp.fileClaim")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      {isLoading ? (
                        <Skeleton className="h-9 w-16 mt-1" />
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("hseModule.workersComp.searchClaims")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("common.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("hseModule.common.allStatus")}</SelectItem>
              <SelectItem value="filed">{t("hseModule.workersComp.statusOptions.filed")}</SelectItem>
              <SelectItem value="under_review">{t("hseModule.workersComp.statusOptions.under_review")}</SelectItem>
              <SelectItem value="approved">{t("hseModule.workersComp.statusOptions.approved")}</SelectItem>
              <SelectItem value="denied">{t("hseModule.workersComp.statusOptions.denied")}</SelectItem>
              <SelectItem value="closed">{t("hseModule.workersComp.statusOptions.closed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("hseModule.workersComp.claimsList")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.workersComp.claimNumber")}</TableHead>
                  <TableHead>{t("hseModule.workersComp.injuryDate")}</TableHead>
                  <TableHead>{t("hseModule.workersComp.injuryDescription")}</TableHead>
                  <TableHead>{t("hseModule.workersComp.claimType")}</TableHead>
                  <TableHead>{t("hseModule.workersComp.compensation")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredClaims?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("hseModule.workersComp.noClaims")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims?.map((claim) => (
                    <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.claim_number}</TableCell>
                          <TableCell>{claim.incident_date ? format(new Date(claim.incident_date), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{claim.injury_type || "-"}</TableCell>
                          <TableCell>{claim.treatment_type || "-"}</TableCell>
                          <TableCell>${(claim.total_paid || 0).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(claim.claim_status)}</TableCell>
                          <TableCell>
                        <Button variant="ghost" size="sm">{t("common.view")}</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
