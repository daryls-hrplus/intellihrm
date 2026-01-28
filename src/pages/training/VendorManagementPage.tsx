import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useVendors } from "@/hooks/useVendors";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { VendorFormDialog } from "@/components/training/vendor/VendorFormDialog";
import {
  Building2,
  Plus,
  Search,
  Star,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import type { VendorStatus } from "@/types/vendor";

export default function VendorManagementPage() {
  const { user, company } = useAuth();
  const { t } = useLanguage();
  const { navigateToRecord, navigateToList } = useWorkspaceNavigation();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      companyId: "",
      searchTerm: "",
      statusFilter: "all" as VendorStatus | "all",
      isDialogOpen: false,
    },
    syncToUrl: ["statusFilter"],
  });

  const { companyId, searchTerm, statusFilter, isDialogOpen } = tabState;

  // Initialize company from auth context
  useEffect(() => {
    const initCompany = async () => {
      if (!user || companyId) return;
      if (company?.id) {
        setTabState({ companyId: company.id });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (data?.company_id) setTabState({ companyId: data.company_id });
    };
    initCompany();
  }, [user, company?.id, companyId, setTabState]);

  const { vendors, isLoading } = useVendors({
    companyId,
    status: statusFilter,
    searchTerm,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      suspended: "bg-destructive/10 text-destructive border-destructive/20",
      terminated: "bg-muted text-muted-foreground border-muted",
    };
    return (
      <Badge variant="outline" className={variants[status] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getContractWarning = (endDate: string | null | undefined) => {
    if (!endDate) return null;
    const daysUntilExpiry = differenceInDays(parseISO(endDate), new Date());
    if (daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Expired
        </Badge>
      );
    }
    if (daysUntilExpiry <= 30) {
      return (
        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {daysUntilExpiry}d left
        </Badge>
      );
    }
    return null;
  };

  const breadcrumbItems = [
    { label: t("training.dashboard.title"), href: "/training" },
    { label: "Vendor Management" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigateToList({
                route: "/training",
                title: t("training.dashboard.title"),
                moduleCode: "training",
                icon: GraduationCap,
              })
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Training Vendors
              </h1>
              <p className="text-muted-foreground">
                Manage external training providers and partners
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter
              selectedCompanyId={companyId}
              onCompanyChange={(id) => setTabState({ companyId: id })}
            />
            <Button onClick={() => setTabState({ isDialogOpen: true })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setTabState({ searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setTabState({ statusFilter: value as VendorStatus | "all" })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vendors ({vendors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vendors found</p>
                <p className="text-sm mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first training vendor to get started"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        navigateToRecord({
                          route: `/training/vendors/${vendor.id}`,
                          title: vendor.name,
                          subtitle: "Vendor",
                          moduleCode: "training",
                          contextType: "vendor",
                          contextId: vendor.id,
                          icon: Building2,
                        })
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {vendor.name}
                              {vendor.is_preferred && (
                                <Star className="h-4 w-4 text-warning fill-warning" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {vendor.code}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {vendor.vendor_type?.replace(/_/g, " ") || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {vendor.contract_end_date ? (
                            <>
                              <span className="text-sm">
                                Ends {format(parseISO(vendor.contract_end_date), "MMM d, yyyy")}
                              </span>
                              {getContractWarning(vendor.contract_end_date)}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">No contract</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.performance_score ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-warning" />
                            <span>{vendor.performance_score.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToRecord({
                              route: `/training/vendors/${vendor.id}`,
                              title: vendor.name,
                              subtitle: "Vendor",
                              moduleCode: "training",
                              contextType: "vendor",
                              contextId: vendor.id,
                              icon: Building2,
                            });
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <VendorFormDialog
          open={isDialogOpen}
          onOpenChange={(open) => setTabState({ isDialogOpen: open })}
          companyId={companyId}
        />
      </div>
    </AppLayout>
  );
}
