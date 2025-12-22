import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Building2, Loader2, ArrowLeft } from "lucide-react";
import { HeadcountRequestWorkflow } from "@/components/admin/HeadcountRequestWorkflow";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function HeadcountRequestsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompanyId(data[0].id);
      }
      setIsLoading(false);
    };
    fetchCompanies();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Workforce", href: "/workforce" },
            { label: "Headcount Requests" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink
              to="/workforce"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Headcount Requests
                </h1>
                <p className="text-muted-foreground">
                  Manage headcount request workflows
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Company
            </CardTitle>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedCompanyId ? (
          <HeadcountRequestWorkflow companyId={selectedCompanyId} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No companies found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
