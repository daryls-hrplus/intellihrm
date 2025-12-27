import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeBankAccountsTab } from "./EmployeeBankAccountsTab";
import { Building2, Globe, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface EmployeePayInfoTabProps {
  employeeId: string;
  companyId?: string;
}

export function EmployeePayInfoTab({ employeeId }: EmployeePayInfoTabProps) {
  const queryClient = useQueryClient();

  // Fetch employee's multi-currency setting
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ["employee-pay-settings", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("enable_multi_currency_payment")
        .eq("id", employeeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Mutation to update the setting
  const updateMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from("profiles")
        .update({ enable_multi_currency_payment: enabled })
        .eq("id", employeeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-pay-settings", employeeId] });
      toast.success("Multi-currency payment setting updated");
    },
    onError: () => {
      toast.error("Failed to update setting");
    },
  });

  const handleToggle = (checked: boolean) => {
    updateMutation.mutate(checked);
  };

  return (
    <div className="space-y-6">
      {/* Multi-Currency Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Multi-Currency Payment
          </CardTitle>
          <CardDescription>
            Configure whether this employee can receive net pay in multiple currencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="multi-currency-toggle" className="text-base">
                  Enable Multi-Currency Payments
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, this employee can set preferences for receiving net pay in different currencies.
                  The employee's pay group must also have multi-currency enabled.
                </p>
              </div>
              <Switch
                id="multi-currency-toggle"
                checked={employeeData?.enable_multi_currency_payment || false}
                onCheckedChange={handleToggle}
                disabled={updateMutation.isPending}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bank Accounts
          </CardTitle>
          <CardDescription>Manage employee bank accounts for payroll</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeBankAccountsTab employeeId={employeeId} />
        </CardContent>
      </Card>
    </div>
  );
}
