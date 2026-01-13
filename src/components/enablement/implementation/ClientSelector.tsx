import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
}

interface ClientSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  required?: boolean;
}

const PLACEHOLDER_VALUE = "__none__";

export function ClientSelector({ value, onValueChange, required = false }: ClientSelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccessibleCompanies = async () => {
      setIsLoading(true);
      try {
        // Use RPC function that returns only companies the user has access to
        const { data, error } = await supabase
          .rpc('get_user_accessible_companies');

        if (error) throw error;
        setCompanies(data || []);
        
        // Auto-select if user only has access to one company
        if (data?.length === 1 && !value) {
          onValueChange(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching accessible companies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessibleCompanies();
  }, []);

  // Always use a string value for the Select (never undefined)
  const selectValue = value || PLACEHOLDER_VALUE;
  const selectedCompany = value ? companies.find(c => c.id === value) : null;
  const showRequired = required && !value;

  const handleValueChange = (newValue: string) => {
    if (newValue === PLACEHOLDER_VALUE) {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger 
        className={cn(
          "w-full",
          showRequired && "border-amber-500 ring-2 ring-amber-200 dark:ring-amber-500/30"
        )}
      >
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
