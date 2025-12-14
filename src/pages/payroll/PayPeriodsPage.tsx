import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface PayPeriod {
  id: string;
  period_number: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  cutoff_date: string | null;
  status: string;
  monday_count: number;
  year: number;
  pay_group: {
    id: string;
    name: string;
    code: string;
    pay_frequency: string;
    uses_national_insurance: boolean;
  } | null;
}

export default function PayPeriodsPage() {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId, selectedPayGroupId, setSelectedPayGroupId } = usePayrollFilters();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ["pay-periods", selectedCompanyId, selectedPayGroupId, selectedYear],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      let query = supabase
        .from("pay_periods")
        .select(`
          id, period_number, period_start, period_end, pay_date, cutoff_date, status, monday_count, year,
          pay_group:pay_groups(id, name, code, pay_frequency, uses_national_insurance)
        `)
        .eq("company_id", selectedCompanyId)
        .eq("year", selectedYear)
        .order("period_number");
      
      if (selectedPayGroupId && selectedPayGroupId !== "all") {
        query = query.eq("pay_group_id", selectedPayGroupId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PayPeriod[];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: payGroups = [] } = useQuery({
    queryKey: ["pay-groups-for-filter", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_groups")
        .select("id, name, code, pay_frequency, uses_national_insurance")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-success/10 text-success",
      processing: "bg-warning/10 text-warning",
      approved: "bg-primary/10 text-primary",
      paid: "bg-muted text-muted-foreground",
      closed: "bg-secondary text-secondary-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const formatFrequency = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: t("payroll.payGroups.weekly"),
      biweekly: t("payroll.payGroups.biweekly"),
      semimonthly: t("payroll.payGroups.semimonthly"),
      monthly: t("payroll.payGroups.monthly"),
    };
    return labels[freq] || freq;
  };

  const hasNITracking = periods.some(p => p.pay_group?.uses_national_insurance);

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("payroll.payPeriods.selectCompanyPrompt")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: t("payroll.payPeriods.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.payPeriods.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.payPeriods.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <PayrollFilters
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
                selectedPayGroupId={selectedPayGroupId}
                onPayGroupChange={setSelectedPayGroupId}
                showPayGroupFilter={true}
              />
              <div className="space-y-2">
                <Label className="text-sm">{t("common.year")}</Label>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Periods Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("payroll.payPeriods.periodsFor", { year: selectedYear })}</span>
              <Badge variant="outline">{periods.length} {t("payroll.payPeriods.periods")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : periods.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{t("payroll.payPeriods.noPeriodsFound", { year: selectedYear })}</p>
                <p className="text-sm mt-2">{t("payroll.payPeriods.goToPayGroups")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">{t("payroll.payPeriods.periodNumber")}</TableHead>
                    <TableHead>{t("payroll.payPeriods.payGroup")}</TableHead>
                    <TableHead>{t("payroll.payPeriods.periodStart")}</TableHead>
                    <TableHead>{t("payroll.payPeriods.periodEnd")}</TableHead>
                    <TableHead>{t("payroll.payPeriods.payDate")}</TableHead>
                    {hasNITracking && <TableHead className="text-center">{t("payroll.payPeriods.mondays")}</TableHead>}
                    <TableHead>{t("common.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">{period.period_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{period.pay_group?.name || "-"}</span>
                          <span className="text-xs text-muted-foreground">
                            {period.pay_group ? formatFrequency(period.pay_group.pay_frequency) : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(period.period_start), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(period.period_end), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(period.pay_date), "MMM d, yyyy")}</TableCell>
                      {hasNITracking && (
                        <TableCell className="text-center">
                          {period.pay_group?.uses_national_insurance ? (
                            <Badge variant="outline">{period.monday_count}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge className={getStatusColor(period.status)}>
                          {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary by Pay Group */}
        {payGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("payroll.payPeriods.summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {payGroups.map((pg) => {
                  const groupPeriods = periods.filter(p => p.pay_group?.id === pg.id);
                  const totalMondays = groupPeriods.reduce((sum, p) => sum + (p.monday_count || 0), 0);
                  
                  return (
                    <Card key={pg.id} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{pg.name}</span>
                          <Badge variant="secondary">{formatFrequency(pg.pay_frequency)}</Badge>
                        </div>
                        <div className="text-2xl font-bold">{groupPeriods.length} {t("payroll.payPeriods.periods")}</div>
                        {pg.uses_national_insurance && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {totalMondays} {t("payroll.payPeriods.totalMondays")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
