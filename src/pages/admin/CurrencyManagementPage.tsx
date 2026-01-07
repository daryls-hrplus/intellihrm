import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, DollarSign, ArrowRightLeft, Building2, Globe } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { usePageAudit } from "@/hooks/usePageAudit";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
  is_group_base: boolean;
}

interface ExchangeRate {
  id: string;
  from_currency_id: string;
  to_currency_id: string;
  rate: number;
  rate_date: string;
  source: string | null;
  notes: string | null;
  from_currency?: Currency;
  to_currency?: Currency;
}

export default function CurrencyManagementPage() {
  usePageAudit('currencies', 'Admin');
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("currencies");
  
  // Currency dialog state
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [currencyForm, setCurrencyForm] = useState({
    code: "",
    name: "",
    symbol: "",
    decimal_places: 2,
    is_active: true,
    is_group_base: false
  });

  // Exchange rate dialog state
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [rateForm, setRateForm] = useState({
    from_currency_id: "",
    to_currency_id: "",
    rate: "",
    rate_date: getTodayString(),
    source: "manual",
    notes: ""
  });

  // Fetch currencies
  const { data: currencies = [], isLoading: currenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .order("code");
      if (error) throw error;
      return data as Currency[];
    }
  });

  // Fetch exchange rates
  const { data: exchangeRates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select(`
          *,
          from_currency:currencies!exchange_rates_from_currency_id_fkey(*),
          to_currency:currencies!exchange_rates_to_currency_id_fkey(*)
        `)
        .order("rate_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ExchangeRate[];
    }
  });

  // Save currency mutation
  const saveCurrencyMutation = useMutation({
    mutationFn: async (data: typeof currencyForm) => {
      if (editingCurrency) {
        const { error } = await supabase
          .from("currencies")
          .update(data)
          .eq("id", editingCurrency.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("currencies")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      setCurrencyDialogOpen(false);
      setEditingCurrency(null);
      toast.success(editingCurrency ? t("common.updated") : t("common.created"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Delete currency mutation
  const deleteCurrencyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("currencies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success(t("common.deleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Save exchange rate mutation
  const saveRateMutation = useMutation({
    mutationFn: async (data: typeof rateForm) => {
      const payload = {
        from_currency_id: data.from_currency_id,
        to_currency_id: data.to_currency_id,
        rate: parseFloat(data.rate),
        rate_date: data.rate_date,
        source: data.source || null,
        notes: data.notes || null
      };
      
      if (editingRate) {
        const { error } = await supabase
          .from("exchange_rates")
          .update(payload)
          .eq("id", editingRate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("exchange_rates")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      setRateDialogOpen(false);
      setEditingRate(null);
      toast.success(editingRate ? t("common.updated") : t("common.created"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Delete exchange rate mutation
  const deleteRateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exchange_rates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      toast.success(t("common.deleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const openCurrencyDialog = (currency?: Currency) => {
    if (currency) {
      setEditingCurrency(currency);
      setCurrencyForm({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        decimal_places: currency.decimal_places || 2,
        is_active: currency.is_active,
        is_group_base: currency.is_group_base || false
      });
    } else {
      setEditingCurrency(null);
      setCurrencyForm({
        code: "",
        name: "",
        symbol: "",
        decimal_places: 2,
        is_active: true,
        is_group_base: false
      });
    }
    setCurrencyDialogOpen(true);
  };

  const openRateDialog = (rate?: ExchangeRate) => {
    if (rate) {
      setEditingRate(rate);
      setRateForm({
        from_currency_id: rate.from_currency_id,
        to_currency_id: rate.to_currency_id,
        rate: rate.rate.toString(),
        rate_date: rate.rate_date,
        source: rate.source || "manual",
        notes: rate.notes || ""
      });
    } else {
      setEditingRate(null);
      setRateForm({
        from_currency_id: "",
        to_currency_id: "",
        rate: "",
        rate_date: getTodayString(),
        source: "manual",
        notes: ""
      });
    }
    setRateDialogOpen(true);
  };

  const baseCurrency = currencies.find(c => c.is_group_base);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.currencyManagement.title") || "Currency Management"}</h1>
            <p className="text-muted-foreground">
              {t("admin.currencyManagement.subtitle") || "Manage currencies and exchange rates for multi-currency operations"}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("admin.currencyManagement.totalCurrencies") || "Total Currencies"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{currencies.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("admin.currencyManagement.activeCurrencies") || "Active Currencies"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{currencies.filter(c => c.is_active).length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("admin.currencyManagement.groupBaseCurrency") || "Group Base Currency"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {baseCurrency ? `${baseCurrency.code} (${baseCurrency.symbol})` : "Not Set"}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("admin.currencyManagement.exchangeRates") || "Exchange Rates"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{exchangeRates.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="currencies">
              <DollarSign className="h-4 w-4 mr-2" />
              {t("admin.currencyManagement.currencies") || "Currencies"}
            </TabsTrigger>
            <TabsTrigger value="exchange-rates">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              {t("admin.currencyManagement.exchangeRates") || "Exchange Rates"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="currencies" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("admin.currencyManagement.currencies") || "Currencies"}</CardTitle>
                  <CardDescription>
                    {t("admin.currencyManagement.currenciesDescription") || "Define currencies used across the organization"}
                  </CardDescription>
                </div>
                <Button onClick={() => openCurrencyDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("common.add")}
                </Button>
              </CardHeader>
              <CardContent>
                {currenciesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.code")}</TableHead>
                        <TableHead>{t("common.name")}</TableHead>
                        <TableHead>{t("admin.currencyManagement.symbol") || "Symbol"}</TableHead>
                        <TableHead>{t("admin.currencyManagement.decimals") || "Decimals"}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("admin.currencyManagement.groupBase") || "Group Base"}</TableHead>
                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currencies.map(currency => (
                        <TableRow key={currency.id}>
                          <TableCell className="font-medium">{currency.code}</TableCell>
                          <TableCell>{currency.name}</TableCell>
                          <TableCell>{currency.symbol}</TableCell>
                          <TableCell>{currency.decimal_places || 2}</TableCell>
                          <TableCell>
                            <Badge variant={currency.is_active ? "default" : "secondary"}>
                              {currency.is_active ? t("common.active") : t("common.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {currency.is_group_base && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {t("admin.currencyManagement.baseCurrency") || "Base"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openCurrencyDialog(currency)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteCurrencyMutation.mutate(currency.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchange-rates" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("admin.currencyManagement.exchangeRates") || "Exchange Rates"}</CardTitle>
                  <CardDescription>
                    {t("admin.currencyManagement.exchangeRatesDescription") || "Historical exchange rates for currency conversion"}
                  </CardDescription>
                </div>
                <Button onClick={() => openRateDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("common.add")}
                </Button>
              </CardHeader>
              <CardContent>
                {ratesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.currencyManagement.fromCurrency") || "From"}</TableHead>
                        <TableHead>{t("admin.currencyManagement.toCurrency") || "To"}</TableHead>
                        <TableHead>{t("admin.currencyManagement.rate") || "Rate"}</TableHead>
                        <TableHead>{t("admin.currencyManagement.rateDate") || "Date"}</TableHead>
                        <TableHead>{t("admin.currencyManagement.source") || "Source"}</TableHead>
                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exchangeRates.map(rate => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">
                            {rate.from_currency?.code} ({rate.from_currency?.symbol})
                          </TableCell>
                          <TableCell>
                            {rate.to_currency?.code} ({rate.to_currency?.symbol})
                          </TableCell>
                          <TableCell>{rate.rate}</TableCell>
                          <TableCell>{formatDateForDisplay(rate.rate_date, "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rate.source || "manual"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openRateDialog(rate)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteRateMutation.mutate(rate.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Currency Dialog */}
        <Dialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCurrency 
                  ? t("admin.currencyManagement.editCurrency") || "Edit Currency"
                  : t("admin.currencyManagement.addCurrency") || "Add Currency"
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.code")} *</Label>
                  <Input
                    value={currencyForm.code}
                    onChange={e => setCurrencyForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="USD"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.currencyManagement.symbol") || "Symbol"} *</Label>
                  <Input
                    value={currencyForm.symbol}
                    onChange={e => setCurrencyForm(prev => ({ ...prev, symbol: e.target.value }))}
                    placeholder="$"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.name")} *</Label>
                <Input
                  value={currencyForm.name}
                  onChange={e => setCurrencyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="US Dollar"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.currencyManagement.decimalPlaces") || "Decimal Places"}</Label>
                <Input
                  type="number"
                  min={0}
                  max={8}
                  value={currencyForm.decimal_places}
                  onChange={e => setCurrencyForm(prev => ({ ...prev, decimal_places: parseInt(e.target.value) || 2 }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t("common.active")}</Label>
                <Switch
                  checked={currencyForm.is_active}
                  onCheckedChange={checked => setCurrencyForm(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("admin.currencyManagement.groupBaseCurrency") || "Group Base Currency"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.currencyManagement.groupBaseDescription") || "Used for consolidation and reporting"}
                  </p>
                </div>
                <Switch
                  checked={currencyForm.is_group_base}
                  onCheckedChange={checked => setCurrencyForm(prev => ({ ...prev, is_group_base: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrencyDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={() => saveCurrencyMutation.mutate(currencyForm)}
                disabled={!currencyForm.code || !currencyForm.name || !currencyForm.symbol}
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exchange Rate Dialog */}
        <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRate 
                  ? t("admin.currencyManagement.editRate") || "Edit Exchange Rate"
                  : t("admin.currencyManagement.addRate") || "Add Exchange Rate"
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.currencyManagement.fromCurrency") || "From Currency"} *</Label>
                  <Select
                    value={rateForm.from_currency_id}
                    onValueChange={value => setRateForm(prev => ({ ...prev, from_currency_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.filter(c => c.is_active).map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.currencyManagement.toCurrency") || "To Currency"} *</Label>
                  <Select
                    value={rateForm.to_currency_id}
                    onValueChange={value => setRateForm(prev => ({ ...prev, to_currency_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.filter(c => c.is_active).map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.currencyManagement.rate") || "Exchange Rate"} *</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={rateForm.rate}
                    onChange={e => setRateForm(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder="1.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.currencyManagement.rateDate") || "Rate Date"} *</Label>
                  <Input
                    type="date"
                    value={rateForm.rate_date}
                    onChange={e => setRateForm(prev => ({ ...prev, rate_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.currencyManagement.source") || "Source"}</Label>
                <Select
                  value={rateForm.source}
                  onValueChange={value => setRateForm(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="central_bank">Central Bank</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="market">Market Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("common.notes")}</Label>
                <Input
                  value={rateForm.notes}
                  onChange={e => setRateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t("common.optional") || "Optional"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRateDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={() => saveRateMutation.mutate(rateForm)}
                disabled={!rateForm.from_currency_id || !rateForm.to_currency_id || !rateForm.rate || !rateForm.rate_date}
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
