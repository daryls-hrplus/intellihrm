import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { Receipt, DollarSign, CheckCircle, Eye, FileText, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageAudit } from "@/hooks/usePageAudit";

interface ExpenseClaim {
  id: string;
  claim_number: string;
  claim_date: string;
  total_amount: number;
  currency: string;
  status: string;
  description: string | null;
  company_id: string;
  employee_id: string;
  pay_period_id: string | null;
  profiles: { full_name: string; employee_id: string | null } | null;
  companies: { name: string } | null;
}

interface ExpenseItem {
  id: string;
  expense_date: string;
  category: string;
  description: string | null;
  amount: number;
  receipt_url: string | null;
}

interface PayPeriod {
  id: string;
  period_name: string;
  cycle_start_date: string;
  cycle_end_date: string;
  pay_group_id: string;
  pay_groups: { name: string } | null;
}

interface Company {
  id: string;
  name: string;
}

export default function PayrollExpenseClaimsPage() {
  const { t } = useTranslation();
  usePageAudit('payroll_expense_claims', 'Payroll');
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [claimItems, setClaimItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadClaims();
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedClaim) {
      loadClaimItems(selectedClaim.id);
      loadPayPeriods(selectedClaim.company_id);
    }
  }, [selectedClaim]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(data || []);
  };

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("expense_claims")
        .select(`
          *,
          profiles:employee_id(full_name, employee_id),
          companies:company_id(name)
        `)
        .eq("status", "approved")
        .is("pay_period_id", null)
        .order("claim_date", { ascending: false });

      if (selectedCompany !== "all") {
        query = query.eq("company_id", selectedCompany);
      }

      const { data } = await query;
      setClaims((data || []) as unknown as ExpenseClaim[]);
    } catch (error) {
      console.error("Error loading claims:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClaimItems = async (claimId: string) => {
    const { data } = await supabase
      .from("expense_claim_items")
      .select("*")
      .eq("claim_id", claimId)
      .order("expense_date", { ascending: false });
    setClaimItems((data || []) as ExpenseItem[]);
  };

  const loadPayPeriods = async (companyId: string) => {
    // Get pay groups for the company
    const { data: payGroups } = await supabase
      .from("pay_groups")
      .select("id")
      .eq("company_id", companyId)
      .eq("is_active", true);

    if (!payGroups?.length) {
      setPayPeriods([]);
      return;
    }

    const payGroupIds = payGroups.map(pg => pg.id);
    
    const { data } = await supabase
      .from("pay_periods")
      .select(`
        id,
        period_name,
        cycle_start_date,
        cycle_end_date,
        pay_group_id,
        pay_groups:pay_group_id(name)
      `)
      .in("pay_group_id", payGroupIds)
      .gte("cycle_end_date", getTodayString())
      .order("cycle_start_date", { ascending: true })
      .limit(20);

    setPayPeriods((data || []) as unknown as PayPeriod[]);
  };

  const handleApproveForPayment = async () => {
    if (!selectedClaim || !selectedPayPeriod || !user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("expense_claims")
        .update({
          pay_period_id: selectedPayPeriod,
          approved_for_payment_at: new Date().toISOString(),
          approved_for_payment_by: user.id,
          status: "pending_payment",
        })
        .eq("id", selectedClaim.id);

      if (error) throw error;

      toast({ title: "Success", description: "Expense claim approved for payment" });
      setApprovalDialogOpen(false);
      setSelectedClaim(null);
      setSelectedPayPeriod("");
      loadClaims();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve for payment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-500/20 text-green-700",
      pending_payment: "bg-blue-500/20 text-blue-700",
      paid: "bg-emerald-500/20 text-emerald-700",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const totalPendingAmount = claims.reduce((sum, c) => sum + c.total_amount, 0);

  const breadcrumbItems = [
    { label: t("navigation.payroll"), href: "/payroll" },
    { label: t("payroll.expenseClaims.title", "Expense Claims") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("payroll.expenseClaims.title", "Expense Claims")}</h1>
            <p className="text-muted-foreground">
              {t("payroll.expenseClaims.subtitle", "Approve manager-approved expense claims for payment in payroll")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("payroll.expenseClaims.pendingClaims", "Pending Claims")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{claims.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("payroll.expenseClaims.totalAmount", "Total Amount")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">${totalPendingAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("common.filter", "Filter")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("payroll.expenseClaims.approvedClaims", "Approved Claims")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : claims.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("payroll.expenseClaims.noClaims", "No approved expense claims pending payment")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow
                        key={claim.id}
                        className={`cursor-pointer ${selectedClaim?.id === claim.id ? "bg-muted" : ""}`}
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.profiles?.full_name}</div>
                            <div className="text-xs text-muted-foreground">{claim.companies?.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{claim.claim_number}</TableCell>
                        <TableCell>{formatDateForDisplay(claim.claim_date, "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-semibold">${claim.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClaim(claim);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {selectedClaim && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Claim {selectedClaim.claim_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedClaim.profiles?.full_name} • ${selectedClaim.total_amount.toFixed(2)}
                  </p>
                </div>
                <Button onClick={() => setApprovalDialogOpen(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve for Payment
                </Button>
              </CardHeader>
              <CardContent>
                {selectedClaim.description && (
                  <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-md">
                    {selectedClaim.description}
                  </p>
                )}
                {claimItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No items</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDateForDisplay(item.expense_date, "MMM d")}</TableCell>
                          <TableCell>
                            <div>
                              <div>{item.category}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>${item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {item.receipt_url ? (
                              <a
                                href={item.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve for Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Claim Amount</div>
                <div className="text-2xl font-bold">${selectedClaim?.total_amount.toFixed(2)}</div>
                <div className="text-sm">{selectedClaim?.profiles?.full_name}</div>
              </div>
              <div>
                <Label>Select Pay Period</Label>
                <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay period for payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {payPeriods.map((pp) => (
                      <SelectItem key={pp.id} value={pp.id}>
                        {pp.pay_groups?.name} - {pp.period_name} ({formatDateForDisplay(pp.cycle_start_date, "MMM d")} - {formatDateForDisplay(pp.cycle_end_date, "MMM d")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {payPeriods.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No pay periods available for this company
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApproveForPayment}
                disabled={isSubmitting || !selectedPayPeriod}
              >
                {isSubmitting ? "Approving..." : "Approve for Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
