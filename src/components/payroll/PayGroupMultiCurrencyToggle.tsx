import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayGroupMultiCurrency, useTogglePayGroupMultiCurrency } from "@/hooks/useMultiCurrencyPayroll";
import { Globe, Loader2 } from "lucide-react";

interface PayGroupMultiCurrencyToggleProps {
  payGroupId: string;
  payGroupName?: string;
}

export function PayGroupMultiCurrencyToggle({ payGroupId, payGroupName }: PayGroupMultiCurrencyToggleProps) {
  const { data: settings, isLoading } = usePayGroupMultiCurrency(payGroupId);
  const toggleMutation = useTogglePayGroupMultiCurrency();

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate({ payGroupId, enabled: checked });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Multi-Currency Payroll</CardTitle>
          </div>
          {settings?.enable_multi_currency && (
            <Badge variant="secondary">Enabled</Badge>
          )}
        </div>
        <CardDescription>
          Enable processing pay elements in multiple currencies with automatic conversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="multi-currency-toggle" className="text-sm font-medium">
              Enable for {payGroupName || 'this pay group'}
            </Label>
            <p className="text-xs text-muted-foreground">
              When enabled, you can assign foreign currencies to pay elements and set employee net pay split preferences
            </p>
          </div>
          <Switch
            id="multi-currency-toggle"
            checked={settings?.enable_multi_currency || false}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
