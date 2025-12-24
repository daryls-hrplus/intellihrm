import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface ClientSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
}

const PLACEHOLDER_VALUE = "__none__";

export function ClientSelector({ value, onValueChange }: ClientSelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Always use a string value for the Select (never undefined)
  const selectValue = value || PLACEHOLDER_VALUE;
  const selectedCompany = value ? companies.find(c => c.id === value) : null;

  const handleValueChange = (newValue: string) => {
    if (newValue === PLACEHOLDER_VALUE) {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading clients..." : "Select a client"}>
          {selectedCompany ? selectedCompany.name : (isLoading ? "Loading clients..." : "Select a client")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover z-50">
        <SelectItem value={PLACEHOLDER_VALUE}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Select a client...
          </div>
        </SelectItem>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{company.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
