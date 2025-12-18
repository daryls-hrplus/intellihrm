import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StatutoryType {
  id: string;
  statutory_code: string;
  statutory_name: string;
  statutory_type: string;
  country: string;
  has_employer_contribution: boolean;
}

export interface CompanyWithCountry {
  id: string;
  name: string;
  code: string;
  country: string;
}

export function useCountryStatutories(companyId: string | null) {
  const [company, setCompany] = useState<CompanyWithCountry | null>(null);
  const [statutoryTypes, setStatutoryTypes] = useState<StatutoryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      setStatutoryTypes([]);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);

      // First get the company with country
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id, name, code, country")
        .eq("id", companyId)
        .single();

      if (companyError || !companyData) {
        console.error("Error loading company:", companyError);
        setIsLoading(false);
        return;
      }

      setCompany(companyData as CompanyWithCountry);

      // Then get statutory types for the country
      const today = new Date().toISOString().split('T')[0];
      const { data: statutories, error: statError } = await supabase
        .from("statutory_deduction_types")
        .select("id, statutory_code, statutory_name, statutory_type, country")
        .eq("country", companyData.country)
        .lte("start_date", today)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order("statutory_code");

      if (statError) {
        console.error("Error loading statutories:", statError);
      } else if (statutories) {
        // Determine if each statutory has employer contribution
        const statutoryIds = statutories.map(s => s.id);
        const { data: bands } = await supabase
          .from("statutory_rate_bands")
          .select("statutory_type_id, employer_rate, employer_per_monday_amount")
          .in("statutory_type_id", statutoryIds)
          .eq("is_active", true);

        const employerContribMap = new Map<string, boolean>();
        bands?.forEach(band => {
          if ((band.employer_rate && band.employer_rate > 0) || 
              (band.employer_per_monday_amount && band.employer_per_monday_amount > 0)) {
            employerContribMap.set(band.statutory_type_id, true);
          }
        });

        setStatutoryTypes(statutories.map(s => ({
          ...s,
          has_employer_contribution: employerContribMap.get(s.id) || false
        })));
      }

      setIsLoading(false);
    };

    loadData();
  }, [companyId]);

  // Generate field names for a statutory code
  const getFieldName = (code: string, isEmployer: boolean = false) => {
    const prefix = isEmployer ? "ytd_employer_" : "ytd_";
    return `${prefix}${code.toLowerCase()}`;
  };

  // Generate CSV headers for the country's statutories
  const getStatutoryHeaders = (): string[] => {
    const headers: string[] = [];
    statutoryTypes.forEach(stat => {
      headers.push(`ytd_${stat.statutory_code.toLowerCase()}`);
      if (stat.has_employer_contribution) {
        headers.push(`ytd_employer_${stat.statutory_code.toLowerCase()}`);
      }
    });
    return headers;
  };

  return {
    company,
    statutoryTypes,
    isLoading,
    getFieldName,
    getStatutoryHeaders,
  };
}
