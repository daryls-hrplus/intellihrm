import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Globe, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeCurrencyPreferenceForm } from "@/components/payroll/EmployeeCurrencyPreferenceForm";

export default function EssCurrencyPreferencesPage() {
  const { user } = useAuth();

  // Get employee's company and check if multi-currency is enabled for their pay group
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ["my-currency-preference-context", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get employee's profile and position
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          company_id,
          company:companies(
            id,
            name,
            local_currency_id,
            local_currency:currencies!companies_local_currency_id_fkey(id, code, name, symbol)
          )
        `)
        .eq("id", user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Get employee's active position with pay group
      const { data: position, error: posError } = await supabase
        .from("employee_positions")
        .select(`
          id,
          pay_group_id,
          pay_group:pay_groups(id, name, enable_multi_currency)
        `)
        .eq("employee_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      
      if (posError) throw posError;
      
      return {
        profile,
        position,
        isMultiCurrencyEnabled: position?.pay_group?.enable_multi_currency || false,
        localCurrency: profile?.company?.local_currency
      };
    },
    enabled: !!user?.id,
  });

  const companyId = employeeData?.profile?.company_id;
  const localCurrencyId = employeeData?.profile?.company?.local_currency_id;
  const isMultiCurrencyEnabled = employeeData?.isMultiCurrencyEnabled;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/ess" className="hover:text-foreground transition-colors">Employee Self Service</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/ess/compensation" className="hover:text-foreground transition-colors">My Compensation</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Currency Preferences</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/10 p-3">
            <Globe className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Net Pay Currency Preferences</h1>
            <p className="text-muted-foreground">Manage how your net pay is distributed across currencies</p>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ) : !isMultiCurrencyEnabled ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Multi-Currency Not Enabled</AlertTitle>
            <AlertDescription>
              Your pay group does not have multi-currency payroll enabled. 
              All payments will be made in your company's local currency 
              ({employeeData?.localCurrency?.code} - {employeeData?.localCurrency?.name}).
            </AlertDescription>
          </Alert>
        ) : companyId && localCurrencyId && user?.id ? (
          <div className="max-w-2xl">
            <EmployeeCurrencyPreferenceForm
              employeeId={user.id}
              companyId={companyId}
              localCurrencyId={localCurrencyId}
            />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>All in primary currency:</strong> Your entire net pay will be paid in your chosen primary currency.
                </p>
                <p>
                  <strong>Split by percentage:</strong> A percentage of your net pay will be converted and paid in a secondary currency. 
                  For example, 20% in USD and 80% in your local currency.
                </p>
                <p>
                  <strong>Fixed amount:</strong> A fixed amount will be paid in the secondary currency each pay period. 
                  The remainder will be paid in your primary currency.
                </p>
                <p className="pt-2 border-t">
                  <strong>Note:</strong> Exchange rates are locked at the time of payroll calculation. 
                  Your actual payment amounts may vary based on the rates applicable to each payroll run.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              Unable to load your company configuration. Please contact HR for assistance.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  );
}
