import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurrencies } from "@/hooks/useCurrencies";
import { 
  useEmployeeCurrencyPreference, 
  useSaveEmployeeCurrencyPreference,
  EmployeeCurrencyPreference 
} from "@/hooks/useMultiCurrencyPayroll";
import { Loader2, DollarSign } from "lucide-react";

interface EmployeeCurrencyPreferenceFormProps {
  employeeId: string;
  companyId: string;
  localCurrencyId: string;
}

export function EmployeeCurrencyPreferenceForm({
  employeeId,
  companyId,
  localCurrencyId
}: EmployeeCurrencyPreferenceFormProps) {
  const { currencies, isLoading: currenciesLoading } = useCurrencies();
  const { data: existingPref, isLoading: prefLoading } = useEmployeeCurrencyPreference(employeeId, companyId);
  const saveMutation = useSaveEmployeeCurrencyPreference();
  
  const [splitMethod, setSplitMethod] = useState<'all_primary' | 'percentage' | 'fixed_amount'>('all_primary');
  const [primaryCurrencyId, setPrimaryCurrencyId] = useState<string>('');
  const [secondaryCurrencyId, setSecondaryCurrencyId] = useState<string>('');
  const [secondaryPercentage, setSecondaryPercentage] = useState<string>('');
  const [secondaryFixedAmount, setSecondaryFixedAmount] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Initialize form with existing preference or defaults
  useEffect(() => {
    if (existingPref) {
      setSplitMethod(existingPref.split_method);
      setPrimaryCurrencyId(existingPref.primary_currency_id);
      setSecondaryCurrencyId(existingPref.secondary_currency_id || '');
      setSecondaryPercentage(existingPref.secondary_currency_percentage?.toString() || '');
      setSecondaryFixedAmount(existingPref.secondary_currency_fixed_amount?.toString() || '');
      setEffectiveDate(existingPref.effective_date);
    } else if (localCurrencyId) {
      setPrimaryCurrencyId(localCurrencyId);
    }
  }, [existingPref, localCurrencyId]);

  const handleSave = async () => {
    const preference: Omit<EmployeeCurrencyPreference, 'id' | 'primary_currency' | 'secondary_currency'> & { id?: string } = {
      id: existingPref?.id,
      employee_id: employeeId,
      company_id: companyId,
      primary_currency_id: primaryCurrencyId,
      secondary_currency_id: splitMethod !== 'all_primary' ? secondaryCurrencyId : null,
      secondary_currency_percentage: splitMethod === 'percentage' ? parseFloat(secondaryPercentage) || null : null,
      secondary_currency_fixed_amount: splitMethod === 'fixed_amount' ? parseFloat(secondaryFixedAmount) || null : null,
      split_method: splitMethod,
      effective_date: effectiveDate,
      end_date: null
    };
    
    await saveMutation.mutateAsync(preference);
  };

  if (currenciesLoading || prefLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const localCurrency = currencies.find(c => c.id === localCurrencyId);
  const secondaryCurrency = currencies.find(c => c.id === secondaryCurrencyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Net Pay Currency Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want your net pay distributed across currencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Effective Date</Label>
          <Input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="space-y-2">
          <Label>Primary Currency (for main payment)</Label>
          <Select value={primaryCurrencyId} onValueChange={setPrimaryCurrencyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Payment Split Method</Label>
          <RadioGroup value={splitMethod} onValueChange={(v) => setSplitMethod(v as typeof splitMethod)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all_primary" id="all_primary" />
              <Label htmlFor="all_primary" className="font-normal">
                All in primary currency ({localCurrency?.code || 'Local'})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="font-normal">
                Split by percentage to a second currency
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed_amount" id="fixed_amount" />
              <Label htmlFor="fixed_amount" className="font-normal">
                Fixed amount in a second currency
              </Label>
            </div>
          </RadioGroup>
        </div>

        {splitMethod !== 'all_primary' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>Secondary Currency</Label>
              <Select value={secondaryCurrencyId} onValueChange={setSecondaryCurrencyId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.filter(c => c.id !== primaryCurrencyId).map(currency => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {splitMethod === 'percentage' && (
              <div className="space-y-2">
                <Label>Percentage to Secondary Currency</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={secondaryPercentage}
                    onChange={(e) => setSecondaryPercentage(e.target.value)}
                    className="w-24"
                    placeholder="0"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {secondaryPercentage && secondaryCurrency 
                    ? `${secondaryPercentage}% of your net pay will be converted to ${secondaryCurrency.code}`
                    : 'Enter the percentage of net pay to receive in the secondary currency'}
                </p>
              </div>
            )}

            {splitMethod === 'fixed_amount' && (
              <div className="space-y-2">
                <Label>Fixed Amount in Secondary Currency</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{secondaryCurrency?.symbol || '$'}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={secondaryFixedAmount}
                    onChange={(e) => setSecondaryFixedAmount(e.target.value)}
                    className="w-32"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {secondaryFixedAmount && secondaryCurrency
                    ? `You will receive ${secondaryCurrency.symbol}${secondaryFixedAmount} in ${secondaryCurrency.code}, remainder in primary currency`
                    : 'Enter the fixed amount to receive in the secondary currency'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
