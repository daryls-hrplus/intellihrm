import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  DollarSign, 
  Calendar,
  User,
  FileText,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Loan {
  id: string;
  employeeName: string;
  employeeId: string;
  loanType: string;
  principalAmount: number;
  outstandingBalance: number;
  monthlyDeduction: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "defaulted" | "pending";
  paymentsComplete: number;
  totalPayments: number;
}

export function PayrollLoansManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [loans] = useState<Loan[]>([
    {
      id: "L001",
      employeeName: "María García López",
      employeeId: "EMP001",
      loanType: "Personal Loan",
      principalAmount: 50000,
      outstandingBalance: 35000,
      monthlyDeduction: 2500,
      interestRate: 12,
      startDate: "2024-06-01",
      endDate: "2025-12-01",
      status: "active",
      paymentsComplete: 6,
      totalPayments: 18
    },
    {
      id: "L002",
      employeeName: "Juan Hernández Pérez",
      employeeId: "EMP002",
      loanType: "Emergency Loan",
      principalAmount: 15000,
      outstandingBalance: 5000,
      monthlyDeduction: 2500,
      interestRate: 0,
      startDate: "2024-09-01",
      endDate: "2025-03-01",
      status: "active",
      paymentsComplete: 4,
      totalPayments: 6
    },
    {
      id: "L003",
      employeeName: "Ana Martínez Ruiz",
      employeeId: "EMP003",
      loanType: "Education Loan",
      principalAmount: 80000,
      outstandingBalance: 80000,
      monthlyDeduction: 4000,
      interestRate: 8,
      startDate: "2025-02-01",
      endDate: "2026-10-01",
      status: "pending",
      paymentsComplete: 0,
      totalPayments: 20
    },
    {
      id: "L004",
      employeeName: "Carlos López Sánchez",
      employeeId: "EMP004",
      loanType: "Personal Loan",
      principalAmount: 30000,
      outstandingBalance: 0,
      monthlyDeduction: 2500,
      interestRate: 10,
      startDate: "2023-06-01",
      endDate: "2024-06-01",
      status: "completed",
      paymentsComplete: 12,
      totalPayments: 12
    },
  ]);

  const [newLoan, setNewLoan] = useState({
    employeeId: "",
    loanType: "",
    amount: "",
    interestRate: "",
    term: "",
    startDate: ""
  });

  const loanTypes = [
    { value: "personal", label: "Personal Loan" },
    { value: "emergency", label: "Emergency Loan" },
    { value: "education", label: "Education Loan" },
    { value: "housing", label: "Housing Advance" },
    { value: "medical", label: "Medical Loan" }
  ];

  const getStatusBadge = (status: Loan["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><Clock className="h-3 w-3 mr-1" />Active</Badge>;
      case "completed":
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "defaulted":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Defaulted</Badge>;
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (activeTab === "all") return true;
    return loan.status === activeTab;
  });

  const totalOutstanding = loans.filter(l => l.status === "active").reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalMonthlyDeductions = loans.filter(l => l.status === "active").reduce((sum, l) => sum + l.monthlyDeduction, 0);

  const createLoan = () => {
    toast.success("Loan application submitted for approval");
    setIsCreateOpen(false);
    setNewLoan({ employeeId: "", loanType: "", amount: "", interestRate: "", term: "", startDate: "" });
  };

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(newLoan.amount) || 0;
    const rate = (parseFloat(newLoan.interestRate) || 0) / 100 / 12;
    const term = parseInt(newLoan.term) || 1;
    
    if (rate === 0) return principal / term;
    return (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payroll Loans Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage employee loans with automatic payroll deductions
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Loan</DialogTitle>
              <DialogDescription>
                Set up a new employee loan with automatic payroll deductions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select 
                  value={newLoan.employeeId}
                  onValueChange={(v) => setNewLoan({...newLoan, employeeId: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP001">María García López</SelectItem>
                    <SelectItem value="EMP002">Juan Hernández Pérez</SelectItem>
                    <SelectItem value="EMP003">Ana Martínez Ruiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select 
                    value={newLoan.loanType}
                    onValueChange={(v) => setNewLoan({...newLoan, loanType: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Principal Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newLoan.amount}
                    onChange={(e) => setNewLoan({...newLoan, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newLoan.interestRate}
                    onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term (months)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={newLoan.term}
                    onChange={(e) => setNewLoan({...newLoan, term: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newLoan.startDate}
                  onChange={(e) => setNewLoan({...newLoan, startDate: e.target.value})}
                />
              </div>

              {newLoan.amount && newLoan.term && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estimated Monthly Deduction</span>
                    <span className="text-lg font-bold text-primary">
                      ${calculateMonthlyPayment().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createLoan}>
                Submit for Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loans.filter(l => l.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Active Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalMonthlyDeductions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Monthly Deductions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loans.filter(l => l.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Loans</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loan Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono">{loan.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{loan.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{loan.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{loan.loanType}</TableCell>
                      <TableCell className="text-right">
                        ${loan.principalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${loan.outstandingBalance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${loan.monthlyDeduction.toLocaleString()}
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress 
                            value={(loan.paymentsComplete / loan.totalPayments) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            {loan.paymentsComplete}/{loan.totalPayments}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}