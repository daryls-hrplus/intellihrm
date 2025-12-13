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
import { Building2, Users } from "lucide-react";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface PayGroup {
  id: string;
  name: string;
  code: string;
  pay_frequency: string;
}

interface PayrollFiltersProps {
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  selectedPayGroupId?: string;
  onPayGroupChange?: (payGroupId: string) => void;
  showPayGroupFilter?: boolean;
}

export function PayrollFilters({
  selectedCompanyId,
  onCompanyChange,
  selectedPayGroupId,
  onPayGroupChange,
  showPayGroupFilter = true,
}: PayrollFiltersProps) {
  const { isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);

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

  useEffect(() => {
    if (selectedCompanyId && showPayGroupFilter) {
      supabase
        .from("pay_groups")
        .select("id, name, code, pay_frequency")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setPayGroups(data);
        });
    } else {
      setPayGroups([]);
    }
  }, [selectedCompanyId, showPayGroupFilter]);

  if (!isAdminOrHR) {
    return null;
  }

  const formatFrequency = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      semimonthly: "Semi-monthly",
      monthly: "Monthly",
    };
    return labels[freq] || freq;
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
        <SelectTrigger className="w-[200px]">
          <Building2 className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select company" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showPayGroupFilter && (
        <Select 
          value={selectedPayGroupId || ""} 
          onValueChange={onPayGroupChange || (() => {})}
          disabled={!selectedCompanyId}
        >
          <SelectTrigger className="w-[220px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select pay group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pay Groups</SelectItem>
            {payGroups.map((pg) => (
              <SelectItem key={pg.id} value={pg.id}>
                {pg.name} ({formatFrequency(pg.pay_frequency)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function usePayrollFilters() {
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("all");

  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id, selectedCompanyId]);

  return {
    selectedCompanyId: selectedCompanyId || company?.id || "",
    setSelectedCompanyId,
    selectedPayGroupId,
    setSelectedPayGroupId,
    isAdminOrHR,
  };
}
