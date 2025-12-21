import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, Landmark, Users, Loader2 } from "lucide-react";
import { GovernanceManagement } from "@/components/admin/GovernanceManagement";
import { CompanyBoardsTab } from "@/components/governance/CompanyBoardsTab";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function GovernancePage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl || "boards");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
      
      if (data && data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && companies.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Workforce", href: "/workforce" },
            { label: "Governance" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Governance
            </h1>
            <p className="text-muted-foreground">
              Manage company boards, management teams, and committees
            </p>
          </div>
        </div>

        {/* Company Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Company</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCompanyId && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="boards" className="flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                Company Boards
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Management Team & Committees
              </TabsTrigger>
            </TabsList>

            <TabsContent value="boards">
              <CompanyBoardsTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="management">
              <GovernanceManagement companyId={selectedCompanyId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
