import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, Users, BarChart3, Settings, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SavingsProgramsList } from "@/components/payroll/savings/SavingsProgramsList";

interface Company {
  id: string;
  name: string;
}

export default function SavingsProgramsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching companies:", error);
      } else if (data) {
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      }
      setIsLoadingCompanies(false);
    };

    fetchCompanies();
  }, []);

  const breadcrumbs = [
    { label: "Payroll", href: "/payroll" },
    { label: "Savings Programs" },
  ];

  return (
    <AppLayout
      title="Savings Programs"
      description="Manage employee savings programs, enrollments, and payouts"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Company Selector */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground">
                Company
              </label>
              {isLoadingCompanies ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {selectedCompanyId ? (
          <Tabs defaultValue="programs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="programs" className="gap-2">
                <Settings className="h-4 w-4" />
                Program Types
              </TabsTrigger>
              <TabsTrigger value="enrollments" className="gap-2">
                <Users className="h-4 w-4" />
                Enrollments
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <PiggyBank className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="programs">
              <SavingsProgramsList companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="enrollments">
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Employee Enrollments</h3>
                  <p className="text-muted-foreground mt-1">
                    View and manage employee savings program enrollments
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Coming soon in Phase 3
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardContent className="py-12 text-center">
                  <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Savings Transactions</h3>
                  <p className="text-muted-foreground mt-1">
                    Track contributions, withdrawals, and releases
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Coming soon in Phase 4
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Savings Reports</h3>
                  <p className="text-muted-foreground mt-1">
                    Generate savings summaries, enrollment reports, and payout schedules
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Coming soon in Phase 7
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Please select a company to manage savings programs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
