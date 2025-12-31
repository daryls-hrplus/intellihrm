import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMinimumWageCompliance, MinimumWageRate } from "@/hooks/useMinimumWageCompliance";
import { useCurrencies } from "@/hooks/useCurrencies";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Settings, 
  Globe, 
  ArrowLeft,
  ExternalLink,
  Calendar,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type WageType = "hourly" | "daily" | "weekly" | "monthly";

interface RateFormData {
  country: string;
  region: string;
  wage_type: string;
  rate: string;
  currency_id: string;
  effective_from: Date | undefined;
  effective_to: Date | undefined;
  source_reference: string;
  notes: string;
}

const COUNTRIES = [
  "Jamaica", "Trinidad and Tobago", "Barbados", "Bahamas", "Guyana",
  "Dominican Republic", "Ghana", "Nigeria", "Kenya", "South Africa",
  "United States", "Canada", "United Kingdom"
];

export default function MinimumWageConfigPage() {
  const { rates, isLoading, createRate, updateRate, deleteRate } = useMinimumWageCompliance();
  const { currencies } = useCurrencies();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<MinimumWageRate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MinimumWageRate | null>(null);
  const [formData, setFormData] = useState<RateFormData>({
    country: "",
    region: "",
    wage_type: "monthly",
    rate: "",
    currency_id: "",
    effective_from: undefined,
    effective_to: undefined,
    source_reference: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      country: "",
      region: "",
      wage_type: "monthly",
      rate: "",
      currency_id: "",
      effective_from: undefined,
      effective_to: undefined,
      source_reference: "",
      notes: "",
    });
    setEditingRate(null);
  };

  const handleOpenDialog = (rate?: MinimumWageRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        country: rate.country,
        region: rate.region || "",
        wage_type: rate.wage_type,
        rate: rate.rate.toString(),
        currency_id: rate.currency_id || "",
        effective_from: rate.effective_from ? new Date(rate.effective_from) : undefined,
        effective_to: rate.effective_to ? new Date(rate.effective_to) : undefined,
        source_reference: rate.source_reference || "",
        notes: rate.notes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const rateData = {
      country: formData.country,
      region: formData.region || null,
      wage_type: formData.wage_type,
      rate: parseFloat(formData.rate),
      currency_id: formData.currency_id || null,
      effective_from: formData.effective_from ? format(formData.effective_from, "yyyy-MM-dd") : getTodayString(),
      effective_to: formData.effective_to ? format(formData.effective_to, "yyyy-MM-dd") : null,
      source_reference: formData.source_reference || null,
      notes: formData.notes || null,
      is_active: true,
      applicable_to: {},
    };

    if (editingRate) {
      await updateRate(editingRate.id, rateData);
    } else {
      await createRate(rateData as Omit<MinimumWageRate, "id" | "created_at" | "updated_at">);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteRate(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const formatCurrency = (rate: MinimumWageRate) => {
    const symbol = rate.currency?.symbol || "$";
    return `${symbol}${rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const getWageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hourly: "Hourly",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    };
    return labels[type] || type;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/compensation/minimum-wage-compliance">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Minimum Wage Configuration
              </h1>
              <p className="text-muted-foreground">
                Manage minimum wage rates by country and region
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Button>
        </div>

        {/* Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Minimum Wage Rates</CardTitle>
            <CardDescription>
              Active minimum wage rates used for compliance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : rates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Rates Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add minimum wage rates for the countries where your employees work.
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Rate
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Effective From</TableHead>
                      <TableHead>Effective To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.country}</TableCell>
                        <TableCell>{rate.region || "-"}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(rate)}</TableCell>
                        <TableCell>{getWageTypeLabel(rate.wage_type)}</TableCell>
                        <TableCell>{formatDateForDisplay(rate.effective_from)}</TableCell>
                        <TableCell>
                          {rate.effective_to ? formatDateForDisplay(rate.effective_to) : "Ongoing"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={rate.is_active ? "default" : "secondary"}
                            className={rate.is_active ? "bg-success/10 text-success border-success/20" : ""}
                          >
                            {rate.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {rate.source_reference && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={rate.source_reference} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rate)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => setDeleteConfirm(rate)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRate ? "Edit Rate" : "Add Minimum Wage Rate"}</DialogTitle>
            <DialogDescription>
              Configure the minimum wage rate for a country or region.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region/State</Label>
                <Input
                  id="region"
                  placeholder="e.g., California"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Rate *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wage_type">Wage Type *</Label>
                <Select
                  value={formData.wage_type}
                  onValueChange={(value: WageType) => setFormData({ ...formData, wage_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency_id}
                  onValueChange={(value) => setFormData({ ...formData, currency_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        {currency.code} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.effective_from && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.effective_from ? format(formData.effective_from, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.effective_from}
                      onSelect={(date) => setFormData({ ...formData, effective_from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Effective To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.effective_to && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.effective_to ? format(formData.effective_to, "PPP") : "Ongoing"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.effective_to}
                      onSelect={(date) => setFormData({ ...formData, effective_to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_reference">Source Reference URL</Label>
              <Input
                id="source_reference"
                placeholder="https://..."
                value={formData.source_reference}
                onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this rate..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.country || !formData.rate || !formData.effective_from}
            >
              {editingRate ? "Update" : "Add Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Minimum Wage Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the minimum wage rate for {deleteConfirm?.country}
              {deleteConfirm?.region ? ` (${deleteConfirm.region})` : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
