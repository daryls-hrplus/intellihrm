import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, FileText, Search, Sparkles, BookOpen, FileStack, Printer, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CountrySelect } from "@/components/ui/country-select";
import { getCountryName, countries } from "@/lib/countries";
import { StatutoryDocumentUpload } from "@/components/payroll/StatutoryDocumentUpload";
import { ComprehensiveStatutoryDocumentation } from "@/components/payroll/ComprehensiveStatutoryDocumentation";
import { StatutoryReportingDocuments } from "@/components/payroll/StatutoryReportingDocuments";
import { StatutoryReportPrint } from "@/components/payroll/StatutoryReportPrint";
import { getTodayString } from "@/utils/dateUtils";

interface StatutoryDeductionType {
  id: string;
  country: string;
  statutory_type: string;
  statutory_code: string;
  statutory_name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reference_document_url?: string | null;
  ai_calculation_rules?: any;
  ai_sample_document?: string | null;
  ai_dependencies?: any;
  ai_analyzed_at?: string | null;
}

const STATUTORY_TYPES = [
  { value: "income_tax", label: "Income Tax" },
  { value: "social_security", label: "Social Security" },
  { value: "national_insurance", label: "National Insurance" },
  { value: "pension", label: "Pension" },
  { value: "health_insurance", label: "Health Insurance" },
  { value: "unemployment", label: "Unemployment Insurance" },
  { value: "disability", label: "Disability Insurance" },
  { value: "workers_comp", label: "Workers Compensation" },
  { value: "local_tax", label: "Local Tax" },
  { value: "other", label: "Other" },
];

export default function StatutoryDeductionTypesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<StatutoryDeductionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StatutoryDeductionType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedStatutory, setSelectedStatutory] = useState<StatutoryDeductionType | null>(null);
  const [comprehensiveDocOpen, setComprehensiveDocOpen] = useState(false);
  const [reportingDocsOpen, setReportingDocsOpen] = useState(false);
  const [printReportOpen, setPrintReportOpen] = useState(false);

  const [form, setForm] = useState({
    country: "",
    statutory_type: "",
    statutory_code: "",
    statutory_name: "",
    description: "",
    start_date: getTodayString(),
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("statutory_deduction_types")
      .select("*")
      .order("country", { ascending: true })
      .order("statutory_type", { ascending: true });

    if (error) {
      toast.error("Failed to load statutory deduction types");
      console.error(error);
    } else {
      setItems(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.country || !form.statutory_type || !form.statutory_code || !form.statutory_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      country: form.country,
      statutory_type: form.statutory_type,
      statutory_code: form.statutory_code,
      statutory_name: form.statutory_name,
      description: form.description || null,
      start_date: form.start_date,
      end_date: form.end_date || null,
      is_active: form.is_active,
    };

    let error;
    if (editing) {
      const result = await supabase
        .from("statutory_deduction_types")
        .update(payload)
        .eq("id", editing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("statutory_deduction_types")
        .insert(payload);
      error = result.error;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing ? "Updated successfully" : "Created successfully");
      setDialogOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this statutory deduction type?")) return;

    const { error } = await supabase
      .from("statutory_deduction_types")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Deleted successfully");
      loadData();
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      country: "",
      statutory_type: "",
      statutory_code: "",
      statutory_name: "",
      description: "",
      start_date: getTodayString(),
      end_date: "",
      is_active: true,
    });
  };

  const openEdit = (item: StatutoryDeductionType) => {
    setEditing(item);
    setForm({
      country: item.country,
      statutory_type: item.statutory_type,
      statutory_code: item.statutory_code,
      statutory_name: item.statutory_name,
      description: item.description || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const countryName = getCountryName(item.country).toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.statutory_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.statutory_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      countryName.includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === "all" || item.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const getStatutoryTypeLabel = (type: string) => {
    return STATUTORY_TYPES.find((t) => t.value === type)?.label || type;
  };

  const openAiDialog = (item: StatutoryDeductionType) => {
    setSelectedStatutory(item);
    setAiDialogOpen(true);
  };

  const openReportingDocs = (item: StatutoryDeductionType) => {
    setSelectedStatutory(item);
    setReportingDocsOpen(true);
  };

  const countryStatutories = countryFilter !== "all" 
    ? items.filter((i) => i.country === countryFilter)
    : items;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: "Statutory Deduction Types" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Statutory Deduction Types</h1>
              <p className="text-muted-foreground">
                Manage country-level statutory deductions for tax and social security
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {countryFilter !== "all" && (
              <Button variant="outline" onClick={() => setComprehensiveDocOpen(true)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Country Documentation
              </Button>
            )}
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Statutory Type
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No statutory deduction types found
                    </TableCell>
                  </TableRow>
                ) : (
                  // Group items by country
                  Object.entries(
                    filteredItems.reduce((acc, item) => {
                      if (!acc[item.country]) acc[item.country] = [];
                      acc[item.country].push(item);
                      return acc;
                    }, {} as Record<string, StatutoryDeductionType[]>)
                  ).map(([countryCode, countryItems]) => (
                    <>
                      {/* Country Header Row */}
                      <TableRow key={`header-${countryCode}`} className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={7} className="py-3">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {getCountryName(countryCode)}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {countryItems.length} {countryItems.length === 1 ? 'type' : 'types'}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* Country Items */}
                      {countryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{getStatutoryTypeLabel(item.statutory_type)}</TableCell>
                          <TableCell><code className="text-xs">{item.statutory_code}</code></TableCell>
                          <TableCell>{item.statutory_name}</TableCell>
                          <TableCell>{item.start_date}</TableCell>
                          <TableCell>{item.end_date || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={item.is_active ? "default" : "secondary"}>
                              {item.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedStatutory(item);
                                  setPrintReportOpen(true);
                                }}
                                title="Print Report"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openReportingDocs(item)}
                                title="Reporting Documents"
                              >
                                <FileStack className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openAiDialog(item)}
                                title="AI Analysis"
                              >
                                <Sparkles className={`h-4 w-4 ${item.ai_analyzed_at ? "text-primary" : ""}`} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Statutory Deduction Type" : "Add Statutory Deduction Type"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <CountrySelect
                    value={form.country}
                    onChange={(v) => setForm({ ...form, country: v })}
                    valueType="code"
                    placeholder="Select country"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statutory Type *</Label>
                  <Select value={form.statutory_type} onValueChange={(v) => setForm({ ...form, statutory_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTORY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Statutory Code *</Label>
                  <Input
                    value={form.statutory_code}
                    onChange={(e) => setForm({ ...form, statutory_code: e.target.value.toUpperCase() })}
                    placeholder="e.g., FICA, NI, PAYE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statutory Name *</Label>
                  <Input
                    value={form.statutory_name}
                    onChange={(e) => setForm({ ...form, statutory_name: e.target.value })}
                    placeholder="e.g., Social Security Tax"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Analysis Dialog */}
        <StatutoryDocumentUpload
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          statutory={selectedStatutory}
          onAnalysisComplete={loadData}
        />

        {/* Comprehensive Documentation Dialog */}
        <ComprehensiveStatutoryDocumentation
          open={comprehensiveDocOpen}
          onOpenChange={setComprehensiveDocOpen}
          country={countryFilter !== "all" ? countryFilter : ""}
          statutories={countryStatutories}
        />

        {/* Reporting Documents Dialog */}
        {selectedStatutory && (
          <StatutoryReportingDocuments
            open={reportingDocsOpen}
            onOpenChange={setReportingDocsOpen}
            statutoryTypeId={selectedStatutory.id}
            statutoryName={selectedStatutory.statutory_name}
            countryCode={selectedStatutory.country}
          />
        )}

        {/* Print Report Dialog */}
        {selectedStatutory && (
          <StatutoryReportPrint
            open={printReportOpen}
            onOpenChange={setPrintReportOpen}
            statutoryTypeId={selectedStatutory.id}
            statutoryName={selectedStatutory.statutory_name}
            statutoryCode={selectedStatutory.statutory_code}
            countryCode={selectedStatutory.country}
          />
        )}
      </div>
    </AppLayout>
  );
}
