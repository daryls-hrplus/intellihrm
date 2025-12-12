import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Building2, Calculator, DollarSign, Plus, Trash2 } from "lucide-react";

export default function BenefitCalculatorPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [calculations, setCalculations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchPlans();
    }
  }, [selectedCompany]);

  useEffect(() => {
    calculateCosts();
  }, [selectedPlans, plans]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("benefit_plans")
        .select(`
          *,
          category:benefit_categories(*)
        `)
        .eq("company_id", selectedCompany)
        .eq("is_active", true)
        .order("name");

      setPlans(data || []);
      setSelectedPlans([]);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlan = (planId: string) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const calculateCosts = () => {
    const selected = plans.filter(p => selectedPlans.includes(p.id));
    
    const monthlyEmployee = selected.reduce((sum, p) => sum + (p.employee_contribution || 0), 0);
    const monthlyEmployer = selected.reduce((sum, p) => sum + (p.employer_contribution || 0), 0);
    const monthlyTotal = monthlyEmployee + monthlyEmployer;

    const annualEmployee = monthlyEmployee * 12;
    const annualEmployer = monthlyEmployer * 12;
    const annualTotal = annualEmployee + annualEmployer;

    // Group by category
    const byCategory: Record<string, { employee: number; employer: number }> = {};
    selected.forEach(p => {
      const cat = p.category?.name || "Other";
      if (!byCategory[cat]) {
        byCategory[cat] = { employee: 0, employer: 0 };
      }
      byCategory[cat].employee += p.employee_contribution || 0;
      byCategory[cat].employer += p.employer_contribution || 0;
    });

    setCalculations({
      selectedCount: selected.length,
      monthlyEmployee,
      monthlyEmployer,
      monthlyTotal,
      annualEmployee,
      annualEmployer,
      annualTotal,
      byCategory,
      plans: selected
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Benefits Calculator</h1>
            <p className="text-muted-foreground">Calculate costs for different benefit combinations</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Benefit Plans</CardTitle>
              <CardDescription>Choose the plans you want to include in your calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No plans available</p>
              ) : (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlans.includes(plan.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => togglePlan(plan.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={selectedPlans.includes(plan.id)} />
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.category?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Your cost</p>
                      <p className="font-medium">${(plan.employee_contribution || 0).toLocaleString()}/mo</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Cost Calculation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {calculations.selectedCount === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Select plans to see cost calculations
                  </p>
                ) : (
                  <>
                    {/* Monthly Costs */}
                    <div>
                      <h4 className="font-medium mb-3">Monthly Costs</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Your Contribution</span>
                          <span className="font-medium">${calculations.monthlyEmployee?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employer Contribution</span>
                          <span className="font-medium text-green-600">${calculations.monthlyEmployer?.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Total Monthly</span>
                          <span className="font-bold">${calculations.monthlyTotal?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Annual Costs */}
                    <div>
                      <h4 className="font-medium mb-3">Annual Costs</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Your Annual Cost</span>
                          <span className="font-medium">${calculations.annualEmployee?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employer Annual Cost</span>
                          <span className="font-medium text-green-600">${calculations.annualEmployer?.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Total Annual</span>
                          <span className="font-bold">${calculations.annualTotal?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* By Category */}
                    <div>
                      <h4 className="font-medium mb-3">Cost by Category (Monthly)</h4>
                      <div className="space-y-2">
                        {calculations.byCategory && Object.entries(calculations.byCategory).map(([cat, costs]: [string, any]) => (
                          <div key={cat} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{cat}</span>
                            <div className="text-right">
                              <span className="font-medium">${costs.employee.toLocaleString()}</span>
                              <span className="text-muted-foreground text-sm"> + ${costs.employer.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Selected Plans Summary */}
            {calculations.selectedCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Plans ({calculations.selectedCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {calculations.plans?.map((plan: any) => (
                      <div key={plan.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{plan.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => togglePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
