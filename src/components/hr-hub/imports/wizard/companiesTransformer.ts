import { supabase } from "@/integrations/supabase/client";

interface CompanyRow {
  code: string;
  name: string;
  legal_name?: string;
  industry?: string;
  group_code?: string;
  division_code?: string;
  country?: string;
  currency?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  first_language?: string;
  second_language?: string;
  is_active?: string | boolean;
  _rowIndex?: number;
  _id?: string;
  [key: string]: any;
}

interface CompanyInsertRecord {
  code: string;
  name: string;
  name_en?: string | null;
  industry?: string | null;
  country?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  first_language?: string | null;
  second_language?: string | null;
  is_active: boolean;
  local_currency_id?: string | null;
  group_id?: string | null;
  division_id?: string | null;
}

interface TransformResult {
  transformed: CompanyInsertRecord[];
  errors: { rowIndex: number; row: CompanyRow; error: string }[];
  warnings: { rowIndex: number; message: string }[];
}

export async function transformCompaniesData(
  rows: CompanyRow[]
): Promise<TransformResult> {
  const errors: TransformResult["errors"] = [];
  const warnings: TransformResult["warnings"] = [];
  const transformed: CompanyInsertRecord[] = [];

  // Fetch lookup data in parallel
  const [currenciesRes, groupsRes, divisionsRes] = await Promise.all([
    supabase.from("currencies").select("id, code"),
    supabase.from("company_groups").select("id, code"),
    supabase.from("divisions").select("id, code"),
  ]);

  // Build lookup maps
  const currencyMap = new Map<string, string>();
  if (currenciesRes.data) {
    currenciesRes.data.forEach((c) => {
      if (c.code) currencyMap.set(c.code.toUpperCase(), c.id);
    });
  }

  const groupMap = new Map<string, string>();
  if (groupsRes.data) {
    groupsRes.data.forEach((g) => {
      if (g.code) groupMap.set(g.code.toUpperCase(), g.id);
    });
  }

  const divisionMap = new Map<string, string>();
  if (divisionsRes.data) {
    divisionsRes.data.forEach((d) => {
      if (d.code) divisionMap.set(d.code.toUpperCase(), d.id);
    });
  }

  // Transform each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = row._rowIndex ?? i;

    // Required field validation
    if (!row.code?.trim()) {
      errors.push({ rowIndex, row, error: "Missing required field: code" });
      continue;
    }
    if (!row.name?.trim()) {
      errors.push({ rowIndex, row, error: "Missing required field: name" });
      continue;
    }

    // Resolve foreign keys
    let local_currency_id: string | null = null;
    if (row.currency?.trim()) {
      const currencyCode = row.currency.trim().toUpperCase();
      local_currency_id = currencyMap.get(currencyCode) || null;
      if (!local_currency_id) {
        warnings.push({
          rowIndex,
          message: `Currency code "${row.currency}" not found. Row will be imported without currency.`,
        });
      }
    }

    let group_id: string | null = null;
    if (row.group_code?.trim()) {
      const groupCode = row.group_code.trim().toUpperCase();
      group_id = groupMap.get(groupCode) || null;
      if (!group_id) {
        warnings.push({
          rowIndex,
          message: `Group code "${row.group_code}" not found. Row will be imported without group assignment.`,
        });
      }
    }

    let division_id: string | null = null;
    if (row.division_code?.trim()) {
      const divisionCode = row.division_code.trim().toUpperCase();
      division_id = divisionMap.get(divisionCode) || null;
      if (!division_id) {
        warnings.push({
          rowIndex,
          message: `Division code "${row.division_code}" not found. Row will be imported without division assignment.`,
        });
      }
    }

    // Parse is_active
    let is_active = true;
    if (row.is_active !== undefined && row.is_active !== null) {
      if (typeof row.is_active === "boolean") {
        is_active = row.is_active;
      } else if (typeof row.is_active === "string") {
        is_active = row.is_active.toLowerCase() !== "false" && row.is_active !== "0";
      }
    }

    // Build transformed record with only valid companies table columns
    const record: CompanyInsertRecord = {
      code: row.code.trim(),
      name: row.name.trim(),
      name_en: row.legal_name?.trim() || null,
      industry: row.industry?.trim() || null,
      country: row.country?.trim() || null,
      address: row.address?.trim() || null,
      city: row.city?.trim() || null,
      state: row.state?.trim() || null,
      postal_code: row.postal_code?.trim() || null,
      phone: row.phone?.trim() || null,
      email: row.email?.trim() || null,
      website: row.website?.trim() || null,
      first_language: row.first_language?.trim() || "en",
      second_language: row.second_language?.trim() || null,
      is_active,
      local_currency_id,
      group_id,
      division_id,
    };

    transformed.push(record);
  }

  return { transformed, errors, warnings };
}
