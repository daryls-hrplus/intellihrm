import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencies, useExchangeRate, Currency } from "@/hooks/useCurrencies";
import { useSetPayrollRunExchangeRates } from "@/hooks/useMultiCurrencyPayroll";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExchangeRateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRunId: string;
  localCurrencyId: string;
  baseCurrencyId?: string;
  foreignCurrencyIds: string[];
  onRatesConfirmed: () => void;
}

interface RateEntry {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  fromCurrency?: Currency;
  toCurrency?: Currency;
}

export function ExchangeRateSelectionDialog({
  open,
  onOpenChange,
  payrollRunId,
  localCurrencyId,
  baseCurrencyId,
  foreignCurrencyIds,
  onRatesConfirmed
}: ExchangeRateSelectionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rates, setRates] = useState<RateEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [missingRates, setMissingRates] = useState<string[]>([]);
  
  const { currencies } = useCurrencies();
  const setPayrollRates = useSetPayrollRunExchangeRates();

  // Build list of required currency pairs
  useEffect(() => {
    if (!open || !localCurrencyId) return;
    if (foreignCurrencyIds.length === 0 && (!baseCurrencyId || baseCurrencyId === localCurrencyId)) return;
    
    const requiredPairs: RateEntry[] = [];
    const localCurrency = currencies.find(c => c.id === localCurrencyId);
    const baseCurrency = baseCurrencyId ? currencies.find(c => c.id === baseCurrencyId) : null;
    
    // For each foreign currency, we need rate to local
    foreignCurrencyIds.forEach(foreignId => {
      if (foreignId !== localCurrencyId) {
        const foreignCurrency = currencies.find(c => c.id === foreignId);
        requiredPairs.push({
          fromCurrencyId: foreignId,
          toCurrencyId: localCurrencyId,
          rate: 0,
          fromCurrency: foreignCurrency,
          toCurrency: localCurrency
        });
      }
    });
    
    // If base currency differs from local, add local to base
    if (baseCurrencyId && baseCurrencyId !== localCurrencyId) {
      requiredPairs.push({
        fromCurrencyId: localCurrencyId,
        toCurrencyId: baseCurrencyId,
        rate: 0,
        fromCurrency: localCurrency,
        toCurrency: baseCurrency
      });
    }
    
    setRates(requiredPairs);
  }, [open, localCurrencyId, baseCurrencyId, foreignCurrencyIds, currencies]);

  // Fetch rates for selected date
  const fetchRatesForDate = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const missing: string[] = [];
    
    const updatedRates = await Promise.all(
      rates.map(async (entry) => {
        const { data } = await supabase
          .from("exchange_rates")
          .select("rate")
          .eq("from_currency_id", entry.fromCurrencyId)
          .eq("to_currency_id", entry.toCurrencyId)
          .lte("rate_date", dateStr)
          .order("rate_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data?.rate) {
          return { ...entry, rate: data.rate };
        } else {
          missing.push(`${entry.fromCurrency?.code || 'Unknown'} → ${entry.toCurrency?.code || 'Unknown'}`);
          return entry;
        }
      })
    );
    
    setRates(updatedRates);
    setMissingRates(missing);
    setLoading(false);
  };

  useEffect(() => {
    if (open && rates.length > 0) {
      fetchRatesForDate();
    }
  }, [selectedDate, open, rates.length]);

  const handleRateChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setRates(prev => prev.map((r, i) => i === index ? { ...r, rate: numValue } : r));
  };

  const handleConfirm = async () => {
    const ratesData = rates.map(r => ({
      from_currency_id: r.fromCurrencyId,
      to_currency_id: r.toCurrencyId,
      exchange_rate: r.rate,
      source: 'manual'
    }));
    
    await setPayrollRates.mutateAsync({
      payrollRunId,
      rates: ratesData,
      rateDate: format(selectedDate, 'yyyy-MM-dd')
    });
    
    onRatesConfirmed();
    onOpenChange(false);
  };

  const allRatesValid = rates.every(r => r.rate > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Exchange Rates for Payroll</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>Rate Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button
              variant="outline"
              onClick={fetchRatesForDate}
              disabled={loading}
              className="mt-6"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Fetch Rates
            </Button>
          </div>
          
          {missingRates.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No rates found for: {missingRates.join(", ")}. Please enter manually.
              </AlertDescription>
            </Alert>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Currency</TableHead>
                <TableHead>To Currency</TableHead>
                <TableHead>Exchange Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((entry, index) => (
                <TableRow key={`${entry.fromCurrencyId}-${entry.toCurrencyId}`}>
                  <TableCell>
                    <span className="font-medium">{entry.fromCurrency?.code}</span>
                    <span className="text-muted-foreground ml-2">{entry.fromCurrency?.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{entry.toCurrency?.code}</span>
                    <span className="text-muted-foreground ml-2">{entry.toCurrency?.name}</span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.000001"
                      value={entry.rate || ""}
                      onChange={(e) => handleRateChange(index, e.target.value)}
                      className="w-32"
                      placeholder="0.000000"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <p className="text-sm text-muted-foreground">
            These rates will be locked for this payroll run and used for all currency conversions.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!allRatesValid || setPayrollRates.isPending}
          >
            {setPayrollRates.isPending ? "Saving..." : "Confirm Rates"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
