import { supabase } from "@/integrations/supabase/client";

interface EmployeeRow {
  company_code?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  [key: string]: string | undefined;
}

interface EmployeeInsertRecord {
  email: string;
  full_name: string;
  first_name: string | null;
  first_last_name: string | null;
  company_id: string | null;
  nationality: string | null;
  gender: string | null;
  marital_status: string | null;
  date_of_birth: string | null;
}

interface TransformResult {
  transformed: EmployeeInsertRecord[];
  errors: Array<{ rowIndex: number; row: EmployeeRow; error: string }>;
  warnings: Array<{ rowIndex: number; field: string; message: string }>;
  addressRecords: Array<{ email: string; address: string; city: string | null; country: string | null }>;
  contactRecords: Array<{ email: string; phone: string }>;
}

interface ProfileRecord {
  email: string | null;
}

interface CompanyRecord {
  id: string;
  code: string | null;
}

interface LookupRecord {
  code: string;
  name: string | null;
  category: string;
}

// Common country name to ISO2 code mapping (Caribbean, Africa, and major countries)
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  // Caribbean
  "trinidad and tobago": "TT", "trinidad": "TT", "tobago": "TT",
  "jamaica": "JM",
  "barbados": "BB",
  "bahamas": "BS", "the bahamas": "BS",
  "guyana": "GY",
  "suriname": "SR",
  "haiti": "HT",
  "dominican republic": "DO",
  "cuba": "CU",
  "puerto rico": "PR",
  "antigua and barbuda": "AG", "antigua": "AG",
  "saint lucia": "LC", "st lucia": "LC", "st. lucia": "LC",
  "grenada": "GD",
  "saint vincent and the grenadines": "VC", "st vincent": "VC",
  "dominica": "DM",
  "saint kitts and nevis": "KN", "st kitts": "KN",
  "belize": "BZ",
  "cayman islands": "KY",
  "turks and caicos": "TC",
  "british virgin islands": "VG",
  "us virgin islands": "VI",
  "aruba": "AW",
  "curacao": "CW",
  "sint maarten": "SX",
  // Africa
  "nigeria": "NG",
  "ghana": "GH",
  "south africa": "ZA",
  "kenya": "KE",
  "egypt": "EG",
  "morocco": "MA",
  "ethiopia": "ET",
  "tanzania": "TZ",
  "uganda": "UG",
  "algeria": "DZ",
  "sudan": "SD",
  "zimbabwe": "ZW",
  "rwanda": "RW",
  "senegal": "SN",
  "cameroon": "CM",
  "ivory coast": "CI", "cote d'ivoire": "CI",
  // Major countries
  "united states": "US", "usa": "US", "united states of america": "US",
  "united kingdom": "GB", "uk": "GB", "great britain": "GB", "england": "GB",
  "canada": "CA",
  "india": "IN",
  "china": "CN",
  "brazil": "BR",
  "mexico": "MX",
  "germany": "DE",
  "france": "FR",
  "italy": "IT",
  "spain": "ES",
  "australia": "AU",
  "japan": "JP",
  "venezuela": "VE",
  "colombia": "CO",
  "panama": "PA",
  "costa rica": "CR",
};

// UUID generation removed - auth.users will provide the ID via trigger

export async function transformEmployeesData(
  rows: EmployeeRow[],
  defaultCompanyId?: string | null
): Promise<TransformResult> {
  const transformed: EmployeeInsertRecord[] = [];
  const errors: Array<{ rowIndex: number; row: EmployeeRow; error: string }> = [];
  const warnings: Array<{ rowIndex: number; field: string; message: string }> = [];
  const addressRecords: Array<{ email: string; address: string; city: string | null; country: string | null }> = [];
  const contactRecords: Array<{ email: string; phone: string }> = [];

  // Fetch existing emails to check for duplicates - use any to avoid type depth issues
  const { data: existingProfiles } = await (supabase as any)
    .from("profiles")
    .select("email");
  
  const existingEmails = new Set(
    ((existingProfiles as ProfileRecord[]) || [])
      .filter(p => p.email)
      .map((p) => p.email!.toLowerCase())
  );

  // Fetch companies for company_code lookup
  const { data: companiesData } = await (supabase as any)
    .from("companies")
    .select("id, code");
  
  const companyCodeToId = new Map(
    ((companiesData as CompanyRecord[]) || [])
      .filter(c => c.code)
      .map((c) => [c.code!.toLowerCase(), c.id])
  );

  // Fetch lookup values for gender and marital_status
  const { data: lookupData } = await (supabase as any)
    .from("lookup_values")
    .select("code, name, category")
    .in("category", ["gender", "marital_status"]);
  
  const genderLookup = new Map<string, string>();
  const maritalStatusLookup = new Map<string, string>();
  
  ((lookupData as LookupRecord[]) || []).forEach((lv) => {
    const displayKey = (lv.name || lv.code)?.toLowerCase();
    if (lv.category === "gender" && displayKey) {
      genderLookup.set(displayKey, lv.code);
      genderLookup.set(lv.code.toLowerCase(), lv.code);
    }
    if (lv.category === "marital_status" && displayKey) {
      maritalStatusLookup.set(displayKey, lv.code);
      maritalStatusLookup.set(lv.code.toLowerCase(), lv.code);
    }
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2; // +2 for 1-indexed and header row

    // Validate required fields
    if (!row.email?.trim()) {
      errors.push({ rowIndex, row, error: "Email is required" });
      continue;
    }

    if (!row.first_name?.trim()) {
      errors.push({ rowIndex, row, error: "First name is required" });
      continue;
    }

    if (!row.last_name?.trim()) {
      errors.push({ rowIndex, row, error: "Last name is required" });
      continue;
    }

    const email = row.email.trim().toLowerCase();

    // Check for duplicate email
    if (existingEmails.has(email)) {
      errors.push({ rowIndex, row, error: `Employee with email '${email}' already exists` });
      continue;
    }

    // Resolve company_id
    let companyId: string | null = defaultCompanyId || null;
    if (row.company_code?.trim()) {
      const resolvedCompanyId = companyCodeToId.get(row.company_code.trim().toLowerCase());
      if (resolvedCompanyId) {
        companyId = resolvedCompanyId;
      } else {
        warnings.push({
          rowIndex,
          field: "company_code",
          message: `Company code '${row.company_code}' not found, using default company`,
        });
      }
    }

    // Resolve gender
    let gender: string | null = null;
    if (row.gender?.trim()) {
      const genderKey = row.gender.trim().toLowerCase();
      gender = genderLookup.get(genderKey) || null;
      if (!gender) {
        warnings.push({
          rowIndex,
          field: "gender",
          message: `Gender '${row.gender}' not recognized, skipping`,
        });
      }
    }

    // Resolve marital status
    let maritalStatus: string | null = null;
    if (row.marital_status?.trim()) {
      const msKey = row.marital_status.trim().toLowerCase();
      maritalStatus = maritalStatusLookup.get(msKey) || null;
      if (!maritalStatus) {
        warnings.push({
          rowIndex,
          field: "marital_status",
          message: `Marital status '${row.marital_status}' not recognized, skipping`,
        });
      }
    }

    // Parse date of birth
    let dateOfBirth: string | null = null;
    if (row.date_of_birth?.trim()) {
      const parsed = new Date(row.date_of_birth.trim());
      if (!isNaN(parsed.getTime())) {
        dateOfBirth = parsed.toISOString().split("T")[0];
      } else {
        warnings.push({
          rowIndex,
          field: "date_of_birth",
          message: `Invalid date format '${row.date_of_birth}', expected YYYY-MM-DD`,
        });
      }
    }

    // Build full name
    const fullName = `${row.first_name.trim()} ${row.last_name.trim()}`;

    // Handle nationality - convert to ISO2 code (varchar(2))
    let nationality: string | null = null;
    if (row.nationality?.trim()) {
      const natInput = row.nationality.trim();
      // Check if it's already a 2-letter code
      if (natInput.length === 2) {
        nationality = natInput.toUpperCase();
      } else {
        // Try to map from country name
        const mapped = COUNTRY_NAME_TO_ISO2[natInput.toLowerCase()];
        if (mapped) {
          nationality = mapped;
        } else {
          warnings.push({
            rowIndex,
            field: "nationality",
            message: `Could not convert nationality '${natInput}' to country code. Use 2-letter ISO code (e.g., TT, JM, GY).`,
          });
        }
      }
    }

    // Add to transformed records (no ID - auth.users will provide it via trigger)
    transformed.push({
      email,
      full_name: fullName,
      first_name: row.first_name.trim(),
      first_last_name: row.last_name.trim(),
      company_id: companyId,
      nationality,
      gender,
      marital_status: maritalStatus,
      date_of_birth: dateOfBirth,
    });

    // Track this email as now "existing" to prevent duplicates within the same import
    existingEmails.add(email);

    // Collect address record if provided
    if (row.address?.trim()) {
      addressRecords.push({
        email,
        address: row.address.trim(),
        city: row.city?.trim() || null,
        country: row.country?.trim() || null,
      });
    }

    // Collect contact record if phone provided
    if (row.phone?.trim()) {
      contactRecords.push({
        email,
        phone: row.phone.trim(),
      });
    }
  }

  return { transformed, errors, warnings, addressRecords, contactRecords };
}

export function generateEmployeesFailureReport(
  errors: Array<{ rowIndex: number; row: any; error: string }>,
  warnings: Array<{ rowIndex: number; field: string; message: string }>
): string {
  let report = "=== EMPLOYEES IMPORT FAILURE REPORT ===\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;

  if (errors.length > 0) {
    report += "=== ERRORS (Records Not Imported) ===\n\n";
    errors.forEach((err) => {
      report += `Row ${err.rowIndex}: ${err.error}\n`;
      report += `  Email: ${err.row.email || "(not provided)"}\n`;
      report += `  Name: ${err.row.first_name || ""} ${err.row.last_name || ""}\n\n`;
    });
  }

  if (warnings.length > 0) {
    report += "=== WARNINGS (Records Imported with Issues) ===\n\n";
    warnings.forEach((warn) => {
      report += `Row ${warn.rowIndex} - ${warn.field}: ${warn.message}\n`;
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    report += "No errors or warnings to report.\n";
  }

  return report;
}
