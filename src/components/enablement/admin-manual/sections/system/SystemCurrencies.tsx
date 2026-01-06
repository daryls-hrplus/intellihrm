import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, RefreshCw, Settings } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

export function SystemCurrencies() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure currencies for multi-country operations",
          "Set up exchange rate management",
          "Understand currency display and conversion",
          "Enable multi-currency payroll support"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Currency Configuration Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Currency configuration is essential for organizations operating across 
            multiple countries. HRplus supports multi-currency operations for 
            payroll, compensation benchmarking, and financial reporting.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Base Currency</h4>
              <p className="text-sm text-muted-foreground">
                The primary currency for consolidated reporting. All amounts 
                can be converted to base currency for comparison.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Local Currencies</h4>
              <p className="text-sm text-muted-foreground">
                Employee salaries and payroll are processed in local currencies 
                based on company/country configuration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 5.3.1: Currency configuration and exchange rate management"
        alt="Currencies page showing active currencies, base currency selection, and exchange rate table"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Exchange Rate Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Exchange rates can be managed manually or synced automatically 
              from external sources.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left font-medium">Currency</th>
                    <th className="border p-2 text-left font-medium">Symbol</th>
                    <th className="border p-2 text-left font-medium">To USD Rate</th>
                    <th className="border p-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Jamaican Dollar</td>
                    <td className="border p-2">JMD</td>
                    <td className="border p-2">0.0065</td>
                    <td className="border p-2"><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border p-2">Trinidad Dollar</td>
                    <td className="border p-2">TTD</td>
                    <td className="border p-2">0.1473</td>
                    <td className="border p-2"><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr>
                    <td className="border p-2">Ghana Cedi</td>
                    <td className="border p-2">GHS</td>
                    <td className="border p-2">0.0625</td>
                    <td className="border p-2"><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border p-2">Nigerian Naira</td>
                    <td className="border p-2">NGN</td>
                    <td className="border p-2">0.0006</td>
                    <td className="border p-2"><Badge variant="default">Active</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="Payroll Currency">
        Employees are always paid in their assigned payroll currency. Exchange 
        rates are used for reporting and comparison purposes only, not for 
        actual salary conversions.
      </InfoCallout>

      <TipCallout title="Rate Update Frequency">
        For organizations with significant currency exposure, consider daily 
        or weekly rate updates. For reporting-only purposes, monthly updates 
        are typically sufficient.
      </TipCallout>
    </div>
  );
}
