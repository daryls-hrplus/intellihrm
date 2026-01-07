import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Calendar, Edit2, Plus, Search } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

interface CountryFiscalYear {
  id: string;
  country_code: string;
  country_name: string;
  fiscal_year_start_month: number;
  fiscal_year_start_day: number;
  tax_year_same_as_fiscal: boolean;
  tax_year_start_month: number | null;
  tax_year_start_day: number | null;
  currency_code: string;
  date_format: string;
  week_start_day: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const DATE_FORMATS = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "MM-DD-YYYY",
];

export default function CountryPayrollYearSetupPage() {
  usePageAudit('country_payroll_year_setup', 'Payroll');
  const { t } = useTranslation();
  const [countries, setCountries] = useState<CountryFiscalYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryFiscalYear | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    country_code: "",
    country_name: "",
    fiscal_year_start_month: 1,
    fiscal_year_start_day: 1,
    tax_year_same_as_fiscal: true,
    tax_year_start_month: null as number | null,
    tax_year_start_day: null as number | null,
    currency_code: "",
    date_format: "DD/MM/YYYY",
    week_start_day: 1,
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("country_fiscal_years")
        .select("*")
        .order("country_name");
      
      if (error) throw error;
      setCountries(data || []);
    } catch (error: any) {
      toast.error("Failed to load country configurations: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (country: CountryFiscalYear) => {
    setSelectedCountry(country);
    setFormData({
      country_code: country.country_code,
      country_name: country.country_name,
      fiscal_year_start_month: country.fiscal_year_start_month,
      fiscal_year_start_day: country.fiscal_year_start_day,
      tax_year_same_as_fiscal: country.tax_year_same_as_fiscal,
      tax_year_start_month: country.tax_year_start_month,
      tax_year_start_day: country.tax_year_start_day,
      currency_code: country.currency_code,
      date_format: country.date_format,
      week_start_day: country.week_start_day,
      is_active: country.is_active,
      notes: country.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      country_code: "",
      country_name: "",
      fiscal_year_start_month: 1,
      fiscal_year_start_day: 1,
      tax_year_same_as_fiscal: true,
      tax_year_start_month: null,
      tax_year_start_day: null,
      currency_code: "",
      date_format: "DD/MM/YYYY",
      week_start_day: 1,
      is_active: true,
      notes: "",
    });
    setCreateDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.country_code || !formData.country_name || !formData.currency_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        tax_year_start_month: formData.tax_year_same_as_fiscal ? null : formData.tax_year_start_month,
        tax_year_start_day: formData.tax_year_same_as_fiscal ? null : formData.tax_year_start_day,
        notes: formData.notes || null,
      };

      if (selectedCountry) {
        const { error } = await supabase
          .from("country_fiscal_years")
          .update(payload)
          .eq("id", selectedCountry.id);
        
        if (error) throw error;
        toast.success("Country configuration updated");
      } else {
        const { error } = await supabase
          .from("country_fiscal_years")
          .insert([payload]);
        
        if (error) throw error;
        toast.success("Country configuration created");
      }

      setEditDialogOpen(false);
      setCreateDialogOpen(false);
      setSelectedCountry(null);
      loadCountries();
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFiscalYearDisplay = (month: number, day: number) => {
    return `${MONTHS[month - 1]} ${day}`;
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Country Code *</Label>
          <Input
            value={formData.country_code}
            onChange={(e) => setFormData(prev => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
            placeholder="e.g., TT, US, GB"
            maxLength={2}
            disabled={!!selectedCountry}
          />
        </div>
        <div className="space-y-2">
          <Label>Country Name *</Label>
          <Input
            value={formData.country_name}
            onChange={(e) => setFormData(prev => ({ ...prev, country_name: e.target.value }))}
            placeholder="e.g., Trinidad and Tobago"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fiscal Year Start Month</Label>
          <Select
            value={String(formData.fiscal_year_start_month)}
            onValueChange={(val) => setFormData(prev => ({ ...prev, fiscal_year_start_month: parseInt(val) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx + 1} value={String(idx + 1)}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Fiscal Year Start Day</Label>
          <Input
            type="number"
            min={1}
            max={31}
            value={formData.fiscal_year_start_day}
            onChange={(e) => setFormData(prev => ({ ...prev, fiscal_year_start_day: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.tax_year_same_as_fiscal}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, tax_year_same_as_fiscal: checked }))}
        />
        <Label>Tax year same as fiscal year</Label>
      </div>

      {!formData.tax_year_same_as_fiscal && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Year Start Month</Label>
            <Select
              value={String(formData.tax_year_start_month || 1)}
              onValueChange={(val) => setFormData(prev => ({ ...prev, tax_year_start_month: parseInt(val) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, idx) => (
                  <SelectItem key={idx + 1} value={String(idx + 1)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tax Year Start Day</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={formData.tax_year_start_day || 1}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_year_start_day: parseInt(e.target.value) || 1 }))}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Currency Code *</Label>
          <Input
            value={formData.currency_code}
            onChange={(e) => setFormData(prev => ({ ...prev, currency_code: e.target.value.toUpperCase() }))}
            placeholder="e.g., TTD, USD"
            maxLength={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Date Format</Label>
          <Select
            value={formData.date_format}
            onValueChange={(val) => setFormData(prev => ({ ...prev, date_format: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map(fmt => (
                <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Week Starts On</Label>
          <Select
            value={String(formData.week_start_day)}
            onValueChange={(val) => setFormData(prev => ({ ...prev, week_start_day: parseInt(val) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map(day => (
                <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label>Active</Label>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this country's payroll configuration..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title", "Payroll"), href: "/payroll" },
            { label: "Country Payroll Year Setup" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Country Payroll Year Setup
              </h1>
              <p className="text-muted-foreground">
                Configure fiscal years, tax years, and regional settings for each country
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Country Configurations
                </CardTitle>
                <CardDescription>
                  {countries.length} countries configured
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Fiscal Year Start</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Date Format</TableHead>
                    <TableHead>Week Start</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCountries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No countries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{country.country_name}</div>
                            <div className="text-sm text-muted-foreground">{country.country_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatFiscalYearDisplay(country.fiscal_year_start_month, country.fiscal_year_start_day)}
                        </TableCell>
                        <TableCell>
                          {country.tax_year_same_as_fiscal ? (
                            <span className="text-muted-foreground">Same as fiscal</span>
                          ) : (
                            formatFiscalYearDisplay(country.tax_year_start_month || 1, country.tax_year_start_day || 1)
                          )}
                        </TableCell>
                        <TableCell>{country.currency_code}</TableCell>
                        <TableCell>{country.date_format}</TableCell>
                        <TableCell>{DAYS_OF_WEEK.find(d => d.value === country.week_start_day)?.label || "Monday"}</TableCell>
                        <TableCell>
                          <Badge variant={country.is_active ? "default" : "secondary"}>
                            {country.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(country)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Country Configuration</DialogTitle>
            </DialogHeader>
            {renderForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Country Configuration</DialogTitle>
            </DialogHeader>
            {renderForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Creating..." : "Create Country"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
