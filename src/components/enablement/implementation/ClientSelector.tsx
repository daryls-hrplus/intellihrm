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

export function ClientSelector({ value, onValueChange }: ClientSelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        // Fetch all client companies
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

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v === "none" ? undefined : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading clients..." : "Select a client"}>
          {value && companies.find(c => c.id === value)?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
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
