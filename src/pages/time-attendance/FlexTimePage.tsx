import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, Plus, Search, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface FlexBalance {
  id: string;
  employee_id: string;
  balance_hours: number;
  max_accrual_hours: number;
  min_balance_hours: number;
  last_accrual_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; email: string };
}

interface FlexTransaction {
  id: string;
  employee_id: string;
  balance_id: string;
  transaction_date: string;
  transaction_type: string;
  hours: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  approved_by: string | null;
}

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Flex Time" },
];

export default function FlexTimePage() {
  const { company, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState("credit");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");

  const { data: balances = [], isLoading } = useQuery({
    queryKey: ["flex-balances", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flex_time_balances")
        .select(`*, profiles!flex_time_balances_employee_id_fkey(full_name, email)`)
        .eq("company_id", company?.id)
        .order("current_balance_minutes", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as FlexBalance[];
    },
    enabled: !!company?.id,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["flex-transactions", selectedEmployeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flex_time_transactions")
        .select("*")
        .eq("employee_id", selectedEmployeeId)
        .order("transaction_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as FlexTransaction[];
    },
    enabled: !!selectedEmployeeId,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployeeId || !minutes) throw new Error("Missing data");
      
      const balance = balances.find(b => b.employee_id === selectedEmployeeId);
      if (!balance) throw new Error("No balance record found");
      
      const hoursValue = parseFloat(minutes) / 60;
      const adjustedHours = transactionType === "debit" ? -hoursValue : hoursValue;
      const newBalanceHours = balance.balance_hours + adjustedHours;

      const { error } = await supabase.from("flex_time_transactions").insert({
        employee_id: selectedEmployeeId,
        company_id: company?.id,
        balance_id: balance.id,
        transaction_type: transactionType,
        hours: adjustedHours,
        balance_before: balance.balance_hours,
        balance_after: newBalanceHours,
        description,
        approved_by: user?.id,
        transaction_date: new Date().toISOString().split("T")[0],
      });
      if (error) throw error;

      // Update balance
      await supabase.from("flex_time_balances").update({
        balance_hours: newBalanceHours,
        updated_at: new Date().toISOString(),
      }).eq("id", balance.id);
    },
    onSuccess: () => {
      toast.success("Flex time transaction added");
      setShowTransactionDialog(false);
      setMinutes("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["flex-balances"] });
      queryClient.invalidateQueries({ queryKey: ["flex-transactions"] });
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const formatHours = (hours: number) => {
    const h = Math.floor(Math.abs(hours));
    const m = Math.round((Math.abs(hours) - h) * 60);
    const sign = hours < 0 ? "-" : "+";
    return `${sign}${h}h ${m}m`;
  };

  const filteredBalances = balances.filter(b =>
    b.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalPositive: balances.filter(b => b.balance_hours > 0).length,
    totalNegative: balances.filter(b => b.balance_hours < 0).length,
    avgBalance: balances.length > 0 
      ? balances.reduce((s, b) => s + b.balance_hours, 0) / balances.length
      : 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Flex Time Management</h1>
            <p className="text-muted-foreground">
              Track and manage flexible working hour balances
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Positive Balances</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPositive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negative Balances</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalNegative}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Balance</p>
                  <p className="text-2xl font-bold">{formatHours(stats.avgBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Flex Time Balances</CardTitle>
            <CardDescription>View and manage employee flexible working hour balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center">Current Balance</TableHead>
                    <TableHead className="text-center">Min Allowed</TableHead>
                    <TableHead className="text-center">Max Allowed</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No flex time balances found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBalances.map((balance) => (
                      <TableRow key={balance.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{balance.profiles?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{balance.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={balance.balance_hours >= 0 ? "default" : "destructive"}>
                            {formatHours(balance.balance_hours)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {formatHours(balance.min_balance_hours)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {formatHours(balance.max_accrual_hours)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(balance.updated_at), "PP")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployeeId(balance.employee_id);
                              setShowTransactionDialog(true);
                            }}
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-1" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Dialog */}
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Flex Time Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Add Time)</SelectItem>
                    <SelectItem value="debit">Debit (Subtract Time)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="Enter minutes"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for adjustment..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => addTransactionMutation.mutate()}
                disabled={addTransactionMutation.isPending || !minutes}
              >
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
