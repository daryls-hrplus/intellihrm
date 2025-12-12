import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, X, Scale } from "lucide-react";

export default function PlanComparisonPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchPlans();
    }
  }, [selectedCompany]);

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

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : prev.length < 4 ? [...prev, planId] : prev
    );
  };

  const comparisonPlans = plans.filter(p => selectedPlans.includes(p.id));

  const renderValue = (value: any, type: "currency" | "text" | "boolean" | "days" = "text") => {
    if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
    
    switch (type) {
      case "currency":
        return <span className="font-medium">${Number(value).toLocaleString()}</span>;
      case "boolean":
        return value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />;
      case "days":
        return <span>{value} days</span>;
      default:
        return <span>{value}</span>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Plan Comparison</h1>
            <p className="text-muted-foreground">Compare benefit plans side by side</p>
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

        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Plans to Compare (max 4)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlans.includes(plan.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => togglePlanSelection(plan.id)}
                >
                  <Checkbox
                    checked={selectedPlans.includes(plan.id)}
                    disabled={!selectedPlans.includes(plan.id) && selectedPlans.length >= 4}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.category?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedPlans.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Plan Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Feature</th>
                      {comparisonPlans.map((plan) => (
                        <th key={plan.id} className="text-left py-3 px-4">
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <Badge variant="outline" className="mt-1">{plan.code}</Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground">Category</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">{plan.category?.name}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground">Plan Type</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">{plan.plan_type}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground">Enrollment Type</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          <Badge variant="secondary">{plan.enrollment_type}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="py-3 px-4 font-medium">Contributions</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4"></td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">Employer Contribution</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          {renderValue(plan.employer_contribution, "currency")}
                          {plan.contribution_frequency && (
                            <span className="text-sm text-muted-foreground"> /{plan.contribution_frequency}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">Employee Contribution</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          {renderValue(plan.employee_contribution, "currency")}
                          {plan.contribution_frequency && (
                            <span className="text-sm text-muted-foreground"> /{plan.contribution_frequency}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="py-3 px-4 font-medium">Eligibility</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4"></td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">Waiting Period</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          {renderValue(plan.waiting_period_days, "days")}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="py-3 px-4 font-medium">Provider</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4"></td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">Provider Name</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          {renderValue(plan.provider_name)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">Contact</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          {renderValue(plan.provider_contact)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="py-3 px-4 font-medium">Validity</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4"></td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">Start Date</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">{plan.start_date}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-muted-foreground pl-8">End Date</td>
                      {comparisonPlans.map((plan) => (
                        <td key={plan.id} className="py-3 px-4">
                          {renderValue(plan.end_date)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPlans.length === 1 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Select at least 2 plans to compare
            </CardContent>
          </Card>
        )}

        {selectedPlans.length === 0 && plans.length > 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Select plans from the list above to compare them
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
