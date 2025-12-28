import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  industry: string | null;
}

interface WizardStepCompanyProps {
  selectedCompanies: string[];
  isGlobal: boolean;
  onCompanyToggle: (companyId: string) => void;
  onGlobalToggle: (isGlobal: boolean) => void;
}

export function WizardStepCompany({
  selectedCompanies,
  isGlobal,
  onCompanyToggle,
  onGlobalToggle,
}: WizardStepCompanyProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, industry")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setCompanies(data);
      }
      setLoading(false);
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Select Companies</h2>
        <p className="text-muted-foreground">
          Choose which companies these skills and competencies will apply to
        </p>
      </div>

      {/* Global Option */}
      <Card 
        className={`cursor-pointer transition-all ${
          isGlobal ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
        }`}
        onClick={() => onGlobalToggle(!isGlobal)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={isGlobal} 
              onCheckedChange={(checked) => onGlobalToggle(checked as boolean)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Global (All Companies)</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription>
            Skills and competencies will be available to all companies in the system
          </CardDescription>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or select specific companies
          </span>
        </div>
      </div>

      {/* Company List */}
      <div className="grid gap-3">
        {companies.map((company) => {
          const isSelected = selectedCompanies.includes(company.id);
          return (
            <Card
              key={company.id}
              className={`cursor-pointer transition-all ${
                isSelected && !isGlobal 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "hover:border-primary/50"
              } ${isGlobal ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => !isGlobal && onCompanyToggle(company.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={isSelected || isGlobal} 
                    disabled={isGlobal}
                    onCheckedChange={() => !isGlobal && onCompanyToggle(company.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{company.name}</p>
                    {company.industry && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {company.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No companies found</p>
        </div>
      )}
    </div>
  );
}
