import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Upload, Download, Pencil, Trash2, FileSpreadsheet, AlertCircle, CheckCircle2, Building2, Calendar, History } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface OpeningBalance {
  id: string;
  employee_id: string;
  tax_year: number;
  effective_date: string;
  previous_employer_name: string | null;
  previous_employer_tax_number: string | null;
  ytd_gross_earnings: number;
  ytd_taxable_income: number;
  ytd_non_taxable_income: number;
  ytd_income_tax: number;
  ytd_nis: number;
  ytd_nht: number;
  ytd_education_tax: number;
  ytd_employer_nis: number;
  ytd_employer_nht: number;
  ytd_employer_education_tax: number;
  ytd_employer_heart: number;
  ytd_other_statutory: Record<string, number>;
  import_source: string;
  notes: string | null;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

interface OpeningBalanceDetail {
  id: string;
  opening_balance_id: string;
  pay_element_type: string;
  pay_element_code: string;
  pay_element_name: string;
  ytd_amount: number;
  ytd_taxable_amount: number;
  ytd_employer_amount: number;
  currency: string;
  notes: string | null;
}

interface ImportResult {
  id: string;
  file_name: string;
  import_type: string;
  tax_year: number;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: string;
  created_at: string;
}

const currentYear = new Date().getFullYear();
const taxYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

const OpeningBalancesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(currentYear);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    tax_year: currentYear,
    effective_date: "",
    previous_employer_name: "",
    previous_employer_tax_number: "",
    ytd_gross_earnings: 0,
    ytd_taxable_income: 0,
    ytd_non_taxable_income: 0,
    ytd_income_tax: 0,
    ytd_nis: 0,
    ytd_nht: 0,
    ytd_education_tax: 0,
    ytd_employer_nis: 0,
    ytd_employer_nht: 0,
    ytd_employer_education_tax: 0,
    ytd_employer_heart: 0,
    notes: ""
  });
  
  // Pay element details state
  const [payElementDetails, setPayElementDetails] = useState<Omit<OpeningBalanceDetail, 'id' | 'opening_balance_id'>[]>([]);
  const [showAddElement, setShowAddElement] = useState(false);
  const [newElement, setNewElement] = useState({
    pay_element_type: "earning",
    pay_element_code: "",
    pay_element_name: "",
    ytd_amount: 0,
    ytd_taxable_amount: 0,
    ytd_employer_amount: 0,
    currency: "JMD",
    notes: ""
  });
  
  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<string>("full");
  const [importTaxYear, setImportTaxYear] = useState<number>(currentYear);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportResult[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees();
      loadOpeningBalances();
      loadImportHistory();
    }
  }, [selectedCompanyId, selectedTaxYear]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    
    if (!error && data) {
      setCompanies(data);
      if (data.length === 1) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const loadEmployees = async () => {
    if (!selectedCompanyId) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, employee_id")
      .eq("company_id", selectedCompanyId)
      .eq("status", "active");
    
    if (!error && data) {
      setEmployees(data.map((d: any) => ({
        id: d.id,
        first_name: d.full_name?.split(" ")[0] || "",
        last_name: d.full_name?.split(" ").slice(1).join(" ") || "",
        employee_id: d.employee_id || ""
      })));
    }
  };

  const loadOpeningBalances = async () => {
    if (!selectedCompanyId) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("employee_opening_balances")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .eq("tax_year", selectedTaxYear)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      const employeeIds = [...new Set(data.map(d => d.employee_id))];
      const { data: empData } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .in("id", employeeIds);
      
      const empMap = new Map((empData as any[])?.map(e => [e.id, e]) || []);
      
      const enriched = data.map(d => {
        const emp = empMap.get(d.employee_id) as any;
        return {
          ...d,
          profiles: emp ? {
            first_name: emp.full_name?.split(" ")[0] || "",
            last_name: emp.full_name?.split(" ").slice(1).join(" ") || "",
            employee_id: emp.employee_id || ""
          } : undefined
        };
      });
      setOpeningBalances(enriched as OpeningBalance[]);
    }
    setIsLoading(false);
  };

  const loadImportHistory = async () => {
    if (!selectedCompanyId) return;
    
    const { data, error } = await supabase
      .from("opening_balance_imports")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setImportHistory(data);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      tax_year: selectedTaxYear,
      effective_date: "",
      previous_employer_name: "",
      previous_employer_tax_number: "",
      ytd_gross_earnings: 0,
      ytd_taxable_income: 0,
      ytd_non_taxable_income: 0,
      ytd_income_tax: 0,
      ytd_nis: 0,
      ytd_nht: 0,
      ytd_education_tax: 0,
      ytd_employer_nis: 0,
      ytd_employer_nht: 0,
      ytd_employer_education_tax: 0,
      ytd_employer_heart: 0,
      notes: ""
    });
    setPayElementDetails([]);
    setEditingId(null);
  };

  const handleEdit = async (balance: OpeningBalance) => {
    setFormData({
      employee_id: balance.employee_id,
      tax_year: balance.tax_year,
      effective_date: balance.effective_date,
      previous_employer_name: balance.previous_employer_name || "",
      previous_employer_tax_number: balance.previous_employer_tax_number || "",
      ytd_gross_earnings: balance.ytd_gross_earnings,
      ytd_taxable_income: balance.ytd_taxable_income,
      ytd_non_taxable_income: balance.ytd_non_taxable_income,
      ytd_income_tax: balance.ytd_income_tax,
      ytd_nis: balance.ytd_nis,
      ytd_nht: balance.ytd_nht,
      ytd_education_tax: balance.ytd_education_tax,
      ytd_employer_nis: balance.ytd_employer_nis,
      ytd_employer_nht: balance.ytd_employer_nht,
      ytd_employer_education_tax: balance.ytd_employer_education_tax,
      ytd_employer_heart: balance.ytd_employer_heart,
      notes: balance.notes || ""
    });
    
    // Load pay element details
    const { data: details } = await supabase
      .from("employee_opening_balance_details")
      .select("*")
      .eq("opening_balance_id", balance.id);
    
    if (details) {
      setPayElementDetails(details.map(d => ({
        pay_element_type: d.pay_element_type,
        pay_element_code: d.pay_element_code,
        pay_element_name: d.pay_element_name,
        ytd_amount: d.ytd_amount,
        ytd_taxable_amount: d.ytd_taxable_amount || 0,
        ytd_employer_amount: d.ytd_employer_amount || 0,
        currency: d.currency || "JMD",
        notes: d.notes || ""
      })));
    }
    
    setEditingId(balance.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.employee_id || !formData.effective_date) {
      toast.error("Please fill in required fields");
      return;
    }
    
    setIsLoading(true);
    
    const payload = {
      company_id: selectedCompanyId,
      employee_id: formData.employee_id,
      tax_year: formData.tax_year,
      effective_date: formData.effective_date,
      previous_employer_name: formData.previous_employer_name || null,
      previous_employer_tax_number: formData.previous_employer_tax_number || null,
      ytd_gross_earnings: formData.ytd_gross_earnings,
      ytd_taxable_income: formData.ytd_taxable_income,
      ytd_non_taxable_income: formData.ytd_non_taxable_income,
      ytd_income_tax: formData.ytd_income_tax,
      ytd_nis: formData.ytd_nis,
      ytd_nht: formData.ytd_nht,
      ytd_education_tax: formData.ytd_education_tax,
      ytd_employer_nis: formData.ytd_employer_nis,
      ytd_employer_nht: formData.ytd_employer_nht,
      ytd_employer_education_tax: formData.ytd_employer_education_tax,
      ytd_employer_heart: formData.ytd_employer_heart,
      notes: formData.notes || null,
      import_source: "manual"
    };
    
    let balanceId = editingId;
    
    if (editingId) {
      const { error } = await supabase
        .from("employee_opening_balances")
        .update(payload)
        .eq("id", editingId);
      
      if (error) {
        console.error("Update error:", error);
        toast.error("Failed to update opening balance");
        setIsLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("employee_opening_balances")
        .insert(payload)
        .select()
        .single();
      
      if (error) {
        console.error("Insert error:", error);
        if (error.code === "23505") {
          toast.error("An opening balance already exists for this employee and tax year");
        } else {
          toast.error("Failed to create opening balance");
        }
        setIsLoading(false);
        return;
      }
      balanceId = data.id;
    }
    
    // Save pay element details
    if (balanceId && payElementDetails.length > 0) {
      // Delete existing details first
      await supabase
        .from("employee_opening_balance_details")
        .delete()
        .eq("opening_balance_id", balanceId);
      
      // Insert new details
      const detailsPayload = payElementDetails.map(d => ({
        opening_balance_id: balanceId,
        ...d
      }));
      
      const { error: detailsError } = await supabase
        .from("employee_opening_balance_details")
        .insert(detailsPayload);
      
      if (detailsError) {
        console.error("Details error:", detailsError);
        toast.warning("Opening balance saved, but some pay element details failed");
      }
    }
    
    toast.success(editingId ? "Opening balance updated" : "Opening balance created");
    setShowForm(false);
    resetForm();
    loadOpeningBalances();
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opening balance?")) return;
    
    const { error } = await supabase
      .from("employee_opening_balances")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete opening balance");
      return;
    }
    
    toast.success("Opening balance deleted");
    loadOpeningBalances();
  };

  const addPayElement = () => {
    if (!newElement.pay_element_code || !newElement.pay_element_name) {
      toast.error("Please fill in element code and name");
      return;
    }
    
    setPayElementDetails([...payElementDetails, { ...newElement }]);
    setNewElement({
      pay_element_type: "earning",
      pay_element_code: "",
      pay_element_name: "",
      ytd_amount: 0,
      ytd_taxable_amount: 0,
      ytd_employer_amount: 0,
      currency: "JMD",
      notes: ""
    });
    setShowAddElement(false);
  };

  const removePayElement = (index: number) => {
    setPayElementDetails(payElementDetails.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const headers = [
      "employee_id",
      "tax_year",
      "effective_date",
      "previous_employer_name",
      "previous_employer_tax_number",
      "ytd_gross_earnings",
      "ytd_taxable_income",
      "ytd_non_taxable_income",
      "ytd_income_tax",
      "ytd_nis",
      "ytd_nht",
      "ytd_education_tax",
      "ytd_employer_nis",
      "ytd_employer_nht",
      "ytd_employer_education_tax",
      "ytd_employer_heart",
      "notes"
    ];
    
    const sampleRow = [
      "EMP001",
      currentYear.toString(),
      format(new Date(), "yyyy-MM-dd"),
      "Previous Company Ltd",
      "TAX123456",
      "500000.00",
      "450000.00",
      "50000.00",
      "75000.00",
      "25000.00",
      "10000.00",
      "15000.00",
      "25000.00",
      "15000.00",
      "20000.00",
      "15000.00",
      "Imported from previous employer"
    ];
    
    const csv = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opening_balances_template_${currentYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    
    setIsImporting(true);
    
    try {
      const text = await importFile.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      // Create import record
      const { data: importRecord, error: importError } = await supabase
        .from("opening_balance_imports")
        .insert({
          company_id: selectedCompanyId,
          file_name: importFile.name,
          import_type: importType,
          tax_year: importTaxYear,
          total_records: lines.length - 1,
          status: "processing",
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (importError) throw importError;
      
      let successful = 0;
      let failed = 0;
      const errors: { row: number; error: string }[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });
        
        // Find employee by employee_id
        const emp = employees.find(e => e.employee_id === row.employee_id);
        if (!emp) {
          errors.push({ row: i + 1, error: `Employee ${row.employee_id} not found` });
          failed++;
          continue;
        }
        
        const { error } = await supabase
          .from("employee_opening_balances")
          .upsert({
            company_id: selectedCompanyId,
            employee_id: emp.id,
            tax_year: parseInt(row.tax_year) || importTaxYear,
            effective_date: row.effective_date || new Date().toISOString().split("T")[0],
            previous_employer_name: row.previous_employer_name || null,
            previous_employer_tax_number: row.previous_employer_tax_number || null,
            ytd_gross_earnings: parseFloat(row.ytd_gross_earnings) || 0,
            ytd_taxable_income: parseFloat(row.ytd_taxable_income) || 0,
            ytd_non_taxable_income: parseFloat(row.ytd_non_taxable_income) || 0,
            ytd_income_tax: parseFloat(row.ytd_income_tax) || 0,
            ytd_nis: parseFloat(row.ytd_nis) || 0,
            ytd_nht: parseFloat(row.ytd_nht) || 0,
            ytd_education_tax: parseFloat(row.ytd_education_tax) || 0,
            ytd_employer_nis: parseFloat(row.ytd_employer_nis) || 0,
            ytd_employer_nht: parseFloat(row.ytd_employer_nht) || 0,
            ytd_employer_education_tax: parseFloat(row.ytd_employer_education_tax) || 0,
            ytd_employer_heart: parseFloat(row.ytd_employer_heart) || 0,
            notes: row.notes || null,
            import_source: "csv_import",
            import_batch_id: importRecord.id
          }, { onConflict: "employee_id,tax_year" });
        
        if (error) {
          errors.push({ row: i + 1, error: error.message });
          failed++;
        } else {
          successful++;
        }
      }
      
      // Update import record
      await supabase
        .from("opening_balance_imports")
        .update({
          successful_records: successful,
          failed_records: failed,
          errors: errors,
          status: failed === lines.length - 1 ? "failed" : "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", importRecord.id);
      
      if (failed > 0) {
        toast.warning(`Import completed: ${successful} succeeded, ${failed} failed`);
      } else {
        toast.success(`Successfully imported ${successful} opening balances`);
      }
      
      setShowImport(false);
      setImportFile(null);
      loadOpeningBalances();
      loadImportHistory();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import file");
    }
    
    setIsImporting(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-JM", {
      style: "currency",
      currency: "JMD",
      minimumFractionDigits: 2
    }).format(amount);
  };

  const breadcrumbItems = [
    { label: t("nav.payroll"), href: "/payroll" },
    { label: "Opening Balances" }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Opening Balances</h1>
            <p className="text-muted-foreground">
              Manage brought forward balances for mid-year employee transfers and historical imports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/payroll/historical-import')}>
              <History className="w-4 h-4 mr-2" />
              Full Payroll Import
            </Button>
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Balance
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Company</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tax Year</Label>
                <Select value={selectedTaxYear.toString()} onValueChange={(v) => setSelectedTaxYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taxYears.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Opening Balances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Opening Balances</CardTitle>
            <CardDescription>
              YTD brought forward amounts for tax year {selectedTaxYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : openingBalances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No opening balances found for {selectedTaxYear}</p>
                <p className="text-sm">Add balances manually or import from CSV</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Previous Employer</TableHead>
                    <TableHead className="text-right">YTD Gross</TableHead>
                    <TableHead className="text-right">YTD Tax</TableHead>
                    <TableHead className="text-right">YTD NIS</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openingBalances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {balance.profiles?.first_name} {balance.profiles?.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {balance.profiles?.employee_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(balance.effective_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {balance.previous_employer_name ? (
                          <div>
                            <div className="text-sm">{balance.previous_employer_name}</div>
                            {balance.previous_employer_tax_number && (
                              <div className="text-xs text-muted-foreground">
                                Tax #: {balance.previous_employer_tax_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(balance.ytd_gross_earnings)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(balance.ytd_income_tax)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(balance.ytd_nis)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={balance.import_source === "csv_import" ? "secondary" : "outline"}>
                          {balance.import_source === "csv_import" ? "Import" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(balance)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(balance.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Import History */}
        {importHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Imports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory.map((imp) => (
                    <TableRow key={imp.id}>
                      <TableCell className="font-medium">{imp.file_name}</TableCell>
                      <TableCell>{imp.import_type}</TableCell>
                      <TableCell>{imp.tax_year}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{imp.successful_records}</span>
                        {imp.failed_records > 0 && (
                          <span className="text-red-600"> / {imp.failed_records} failed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={imp.status === "completed" ? "default" : imp.status === "failed" ? "destructive" : "secondary"}>
                          {imp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(imp.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Opening Balance" : "Add Opening Balance"}
              </DialogTitle>
              <DialogDescription>
                Enter brought forward YTD amounts for an employee joining mid-year
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="statutory">Statutory Deductions</TabsTrigger>
                <TabsTrigger value="elements">Pay Elements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employee *</Label>
                    <Select 
                      value={formData.employee_id} 
                      onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                      disabled={!!editingId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.first_name} {e.last_name} ({e.employee_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tax Year *</Label>
                    <Select 
                      value={formData.tax_year.toString()} 
                      onValueChange={(v) => setFormData({ ...formData, tax_year: parseInt(v) })}
                      disabled={!!editingId}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taxYears.map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Effective Date *</Label>
                    <Input 
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <Label className="text-base font-semibold">Previous Employer</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employer Name</Label>
                      <Input 
                        value={formData.previous_employer_name}
                        onChange={(e) => setFormData({ ...formData, previous_employer_name: e.target.value })}
                        placeholder="Previous Company Ltd"
                      />
                    </div>
                    <div>
                      <Label>Tax Registration Number</Label>
                      <Input 
                        value={formData.previous_employer_tax_number}
                        onChange={(e) => setFormData({ ...formData, previous_employer_tax_number: e.target.value })}
                        placeholder="TAX123456"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-base font-semibold">YTD Earnings</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Gross Earnings</Label>
                      <Input 
                        type="number"
                        value={formData.ytd_gross_earnings}
                        onChange={(e) => setFormData({ ...formData, ytd_gross_earnings: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Taxable Income</Label>
                      <Input 
                        type="number"
                        value={formData.ytd_taxable_income}
                        onChange={(e) => setFormData({ ...formData, ytd_taxable_income: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Non-Taxable Income</Label>
                      <Input 
                        type="number"
                        value={formData.ytd_non_taxable_income}
                        onChange={(e) => setFormData({ ...formData, ytd_non_taxable_income: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this opening balance..."
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="statutory" className="space-y-4 mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Enter the YTD statutory deductions from the employee's previous employer. These will be included in tax calculations.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Employee Deductions</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>Income Tax (PAYE)</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_income_tax}
                          onChange={(e) => setFormData({ ...formData, ytd_income_tax: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>NIS (Employee)</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_nis}
                          onChange={(e) => setFormData({ ...formData, ytd_nis: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>NHT (Employee)</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_nht}
                          onChange={(e) => setFormData({ ...formData, ytd_nht: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Education Tax</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_education_tax}
                          onChange={(e) => setFormData({ ...formData, ytd_education_tax: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base font-semibold">Employer Contributions</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>NIS (Employer)</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_employer_nis}
                          onChange={(e) => setFormData({ ...formData, ytd_employer_nis: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>NHT (Employer)</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_employer_nht}
                          onChange={(e) => setFormData({ ...formData, ytd_employer_nht: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Education Tax (Employer)</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_employer_education_tax}
                          onChange={(e) => setFormData({ ...formData, ytd_employer_education_tax: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>HEART/NSTA</Label>
                        <Input 
                          type="number"
                          value={formData.ytd_employer_heart}
                          onChange={(e) => setFormData({ ...formData, ytd_employer_heart: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="elements" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-semibold">Pay Element Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Add YTD balances for specific pay elements (allowances, deductions, benefits)
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowAddElement(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Element
                  </Button>
                </div>
                
                {payElementDetails.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No pay elements added yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">YTD Amount</TableHead>
                        <TableHead className="text-right">YTD Taxable</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payElementDetails.map((elem, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline">{elem.pay_element_type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{elem.pay_element_code}</TableCell>
                          <TableCell>{elem.pay_element_name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(elem.ytd_amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(elem.ytd_taxable_amount)}
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => removePayElement(idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Add Element Dialog */}
                <Dialog open={showAddElement} onOpenChange={setShowAddElement}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Pay Element</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Element Type</Label>
                          <Select 
                            value={newElement.pay_element_type}
                            onValueChange={(v) => setNewElement({ ...newElement, pay_element_type: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="earning">Earning</SelectItem>
                              <SelectItem value="allowance">Allowance</SelectItem>
                              <SelectItem value="deduction">Deduction</SelectItem>
                              <SelectItem value="benefit">Benefit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Element Code *</Label>
                          <Input 
                            value={newElement.pay_element_code}
                            onChange={(e) => setNewElement({ ...newElement, pay_element_code: e.target.value })}
                            placeholder="e.g., TRAVEL_ALW"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Element Name *</Label>
                        <Input 
                          value={newElement.pay_element_name}
                          onChange={(e) => setNewElement({ ...newElement, pay_element_name: e.target.value })}
                          placeholder="e.g., Travel Allowance"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>YTD Amount</Label>
                          <Input 
                            type="number"
                            value={newElement.ytd_amount}
                            onChange={(e) => setNewElement({ ...newElement, ytd_amount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>YTD Taxable Amount</Label>
                          <Input 
                            type="number"
                            value={newElement.ytd_taxable_amount}
                            onChange={(e) => setNewElement({ ...newElement, ytd_taxable_amount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddElement(false)}>Cancel</Button>
                      <Button onClick={addPayElement}>Add Element</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : (editingId ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Import Dialog */}
        <Dialog open={showImport} onOpenChange={setShowImport}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Import Opening Balances</DialogTitle>
              <DialogDescription>
                Upload a CSV file with brought forward balances for multiple employees
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Import Type</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full (Statutory + Earnings)</SelectItem>
                      <SelectItem value="statutory">Statutory Only</SelectItem>
                      <SelectItem value="earnings">Earnings Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tax Year</Label>
                  <Select value={importTaxYear.toString()} onValueChange={(v) => setImportTaxYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taxYears.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                {importFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{importFile.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => setImportFile(null)}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Click to select or drag and drop a CSV file
                    </p>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                  </>
                )}
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-center">
                    <span>Need the template? Download and fill it in with your data.</span>
                    <Button size="sm" variant="link" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-1" />
                      Download Template
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImport(false); setImportFile(null); }}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importFile || isImporting}>
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default OpeningBalancesPage;
