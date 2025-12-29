import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  Users, 
  FileSpreadsheet,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Percent,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface BatchOperationsProps {
  companyId?: string;
}

export function BatchOperations({ companyId }: BatchOperationsProps) {
  const [operationType, setOperationType] = useState("salary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const employees = [
    { id: "1", name: "Maria Garcia", department: "Sales", currentSalary: 65000, position: "Sales Executive" },
    { id: "2", name: "John Smith", department: "Technology", currentSalary: 85000, position: "Senior Developer" },
    { id: "3", name: "Ana Martinez", department: "HR", currentSalary: 70000, position: "HR Analyst" },
    { id: "4", name: "Carlos Lopez", department: "Finance", currentSalary: 75000, position: "Accountant" },
    { id: "5", name: "Laura Rodriguez", department: "Sales", currentSalary: 62000, position: "Sales Executive" },
    { id: "6", name: "Peter Johnson", department: "Technology", currentSalary: 95000, position: "Tech Lead" },
  ];

  const [adjustmentType, setAdjustmentType] = useState<"percent" | "fixed">("percent");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const runBatchOperation = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsProcessing(false);
    toast.success(`Operation completed for ${selectedEmployees.length} employees`);
  };

  const calculateNewSalary = (currentSalary: number) => {
    const value = parseFloat(adjustmentValue) || 0;
    if (adjustmentType === "percent") {
      return currentSalary * (1 + value / 100);
    }
    return currentSalary + value;
  };

  const batchHistory = [
    { id: "B001", date: "2025-01-15", type: "Salary Adjustment", affected: 45, status: "completed", executedBy: "HR Admin" },
    { id: "B002", date: "2025-01-10", type: "Data Update", affected: 120, status: "completed", executedBy: "HR Admin" },
    { id: "B003", date: "2025-01-05", type: "Shift Change", affected: 30, status: "failed", executedBy: "Manager" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Batch Operations</h2>
          <p className="text-sm text-muted-foreground">
            Mass updates and changes for multiple employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
        </div>
      </div>

      <Tabs value={operationType} onValueChange={setOperationType}>
        <TabsList>
          <TabsTrigger value="salary">Salary Adjustment</TabsTrigger>
          <TabsTrigger value="data">Update Data</TabsTrigger>
          <TabsTrigger value="benefits">Change Benefits</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Mass Salary Adjustment
              </CardTitle>
              <CardDescription>
                Apply percentage increases or fixed amounts to multiple employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Adjustment Type</Label>
                  <Select 
                    value={adjustmentType} 
                    onValueChange={(v: "percent" | "fixed") => setAdjustmentType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {adjustmentType === "percent" ? "Percentage" : "Amount"}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder={adjustmentType === "percent" ? "5" : "1000"}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {adjustmentType === "percent" ? <Percent className="h-4 w-4" /> : "$"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Filter by Dept.</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedEmployees.length === employees.length}
                      onCheckedChange={selectAll}
                    />
                    <span className="text-sm font-medium">
                      Select All ({selectedEmployees.length} of {employees.length})
                    </span>
                  </div>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedEmployees.length} selected
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-right">Current Salary</TableHead>
                      <TableHead className="text-right">New Salary</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const newSalary = calculateNewSalary(emp.currentSalary);
                      const diff = newSalary - emp.currentSalary;
                      return (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedEmployees.includes(emp.id)}
                              onCheckedChange={() => toggleEmployee(emp.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell className="text-right">
                            ${emp.currentSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {adjustmentValue ? `$${newSalary.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {adjustmentValue && diff > 0 ? (
                              <span className="text-green-600">+${diff.toLocaleString()}</span>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {selectedEmployees.length > 0 && adjustmentValue && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        Applying{" "}
                        <strong>
                          {adjustmentType === "percent" 
                            ? `${adjustmentValue}%` 
                            : `$${parseFloat(adjustmentValue).toLocaleString()}`}
                        </strong>{" "}
                        adjustment to <strong>{selectedEmployees.length}</strong> employees.
                        Estimated monthly impact:{" "}
                        <strong>
                          ${selectedEmployees.reduce((acc, id) => {
                            const emp = employees.find(e => e.id === id);
                            if (!emp) return acc;
                            return acc + (calculateNewSalary(emp.currentSalary) - emp.currentSalary);
                          }, 0).toLocaleString()}
                        </strong>
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Preview</Button>
                <Button onClick={runBatchOperation} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Operation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Mass Data Update
              </CardTitle>
              <CardDescription>
                Import an Excel file to update employee data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag an Excel file here or click to select
                </p>
                <Button variant="outline">
                  Select File
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium">Updatable Fields</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Address, Phone</li>
                    <li>• Bank Account</li>
                    <li>• Emergency Contact</li>
                    <li>• Tax Information</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium">Required Format</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Excel (.xlsx) or CSV</li>
                    <li>• First row: headers</li>
                    <li>• ID column required</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium">Validations</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Email format</li>
                    <li>• Phone format</li>
                    <li>• Required fields</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mass Benefits Change</CardTitle>
              <CardDescription>
                Apply benefit changes to groups of employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Benefit Type</Label>
                  <Select defaultValue="vacation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation Days</SelectItem>
                      <SelectItem value="health">Health Insurance</SelectItem>
                      <SelectItem value="retirement">Retirement Contribution</SelectItem>
                      <SelectItem value="allowance">Allowances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>New Value</Label>
                  <Input type="number" placeholder="Enter new value" />
                </div>
              </div>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Apply Change
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operation History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Affected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchHistory.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono">{batch.id}</TableCell>
                      <TableCell>{batch.date}</TableCell>
                      <TableCell>{batch.type}</TableCell>
                      <TableCell className="text-center">{batch.affected}</TableCell>
                      <TableCell>
                        {batch.status === "completed" ? (
                          <Badge variant="default" className="bg-green-500 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{batch.executedBy}</TableCell>
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
