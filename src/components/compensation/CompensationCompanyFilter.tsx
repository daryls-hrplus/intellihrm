import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface CompensationCompanyFilterProps {
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  showAllOption?: boolean;
}

export function CompensationCompanyFilter({ 
  selectedCompanyId, 
  onCompanyChange,
  showAllOption = true 
}: CompensationCompanyFilterProps) {
  const { isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    if (isAdminOrHR) {
      supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data);
        });
    }
  }, [isAdminOrHR]);

  if (!isAdminOrHR) {
    return null;
  }

  if (companies.length === 0) {
    return null;
  }

  return (
    <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
      <SelectTrigger className="w-[220px]">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select company" />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">All Companies</SelectItem>
        )}
        {companies.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useCompensationCompanyFilter() {
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");

  return {
    selectedCompanyId,
    setSelectedCompanyId,
    isAdminOrHR,
    userCompanyId: company?.id,
  };
}
