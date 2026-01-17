import { supabase } from "@/integrations/supabase/client";

export interface ReportingValidationResult {
  isValid: boolean;
  relationshipType: "primary" | "matrix" | "both" | null;
  reason: string;
  isCrossCompany: boolean;
  sourceCompany?: { id: string; code: string; name: string };
  targetCompany?: { id: string; code: string; name: string };
}

interface CompanyWithGroup {
  id: string;
  code: string;
  name: string;
  group_id: string | null;
}

/**
 * Validates if a reporting relationship between two positions is allowed.
 * This function checks:
 * 1. Same company (always allowed)
 * 2. Same corporate group (always allowed)
 * 3. Configured cross-company relationships
 */
export async function validateReportingRelationship(
  sourcePositionId: string,
  targetPositionId: string,
  reportingType: "primary" | "matrix" = "primary"
): Promise<ReportingValidationResult> {
  try {
    // Get both positions with their companies
    const { data: positions, error: posError } = await supabase
      .from("positions")
      .select(`
        id,
        company_id,
        company:companies(id, code, name, group_id)
      `)
      .in("id", [sourcePositionId, targetPositionId]);

    if (posError || !positions || positions.length !== 2) {
      return {
        isValid: false,
        relationshipType: null,
        reason: "Could not find one or both positions",
        isCrossCompany: false,
      };
    }

    const sourcePosition = positions.find(p => p.id === sourcePositionId);
    const targetPosition = positions.find(p => p.id === targetPositionId);

    if (!sourcePosition || !targetPosition) {
      return {
        isValid: false,
        relationshipType: null,
        reason: "Could not find one or both positions",
        isCrossCompany: false,
      };
    }

    const sourceCompany = sourcePosition.company as unknown as CompanyWithGroup;
    const targetCompany = targetPosition.company as unknown as CompanyWithGroup;

    // Same company - always allowed
    if (sourcePosition.company_id === targetPosition.company_id) {
      return {
        isValid: true,
        relationshipType: "both",
        reason: "Same company",
        isCrossCompany: false,
        sourceCompany,
        targetCompany,
      };
    }

    // Same corporate group - always allowed
    if (sourceCompany.group_id && sourceCompany.group_id === targetCompany.group_id) {
      return {
        isValid: true,
        relationshipType: "both",
        reason: "Same corporate group",
        isCrossCompany: true,
        sourceCompany,
        targetCompany,
      };
    }

    // Check configured relationships
    const now = new Date().toISOString();
    const { data: relationships } = await supabase
      .from("company_reporting_relationships")
      .select("*")
      .eq("is_active", true)
      .or(`source_company_id.eq.${sourcePosition.company_id},target_company_id.eq.${sourcePosition.company_id}`)
      .or(`and(effective_date.is.null,end_date.is.null),and(effective_date.lte.${now},or(end_date.is.null,end_date.gte.${now}))`);

    for (const rel of relationships || []) {
      const typeMatches = 
        rel.relationship_type === "both" || 
        rel.relationship_type === reportingType;

      if (!typeMatches) continue;

      // Check source -> target
      if (rel.source_company_id === sourcePosition.company_id && 
          rel.target_company_id === targetPosition.company_id) {
        return {
          isValid: true,
          relationshipType: rel.relationship_type as "primary" | "matrix" | "both",
          reason: `Configured relationship: ${rel.relationship_reason}`,
          isCrossCompany: true,
          sourceCompany,
          targetCompany,
        };
      }

      // Check bidirectional
      if (rel.is_bidirectional && 
          rel.target_company_id === sourcePosition.company_id && 
          rel.source_company_id === targetPosition.company_id) {
        return {
          isValid: true,
          relationshipType: rel.relationship_type as "primary" | "matrix" | "both",
          reason: `Configured relationship (bidirectional): ${rel.relationship_reason}`,
          isCrossCompany: true,
          sourceCompany,
          targetCompany,
        };
      }
    }

    // No valid relationship found
    return {
      isValid: false,
      relationshipType: null,
      reason: `No reporting relationship configured between ${sourceCompany.name} and ${targetCompany.name}`,
      isCrossCompany: true,
      sourceCompany,
      targetCompany,
    };
  } catch (error) {
    console.error("Error validating reporting relationship:", error);
    return {
      isValid: false,
      relationshipType: null,
      reason: "Error validating relationship",
      isCrossCompany: false,
    };
  }
}

/**
 * Parse a position code that may include a company prefix.
 * Format: COMPANY_CODE:POSITION_CODE or just POSITION_CODE
 */
export function parsePositionCode(code: string): { companyCode: string | null; positionCode: string } {
  const trimmed = code.trim();
  const colonIndex = trimmed.indexOf(":");
  
  if (colonIndex > 0) {
    return {
      companyCode: trimmed.substring(0, colonIndex).toUpperCase(),
      positionCode: trimmed.substring(colonIndex + 1),
    };
  }
  
  return {
    companyCode: null,
    positionCode: trimmed,
  };
}

/**
 * Fetch all positions from companies that have valid reporting relationships with the given company.
 * This is useful for lookups when importing positions with cross-company reporting.
 */
export async function fetchValidReportingPositions(
  companyId: string,
  reportingType: "primary" | "matrix" = "primary"
): Promise<Map<string, { id: string; code: string; title: string; companyId: string; companyCode: string }>> {
  const positionMap = new Map<string, any>();

  try {
    // Get the company's group_id
    const { data: company } = await supabase
      .from("companies")
      .select("id, code, group_id")
      .eq("id", companyId)
      .single();

    if (!company) return positionMap;

    // Get all valid company IDs
    const validCompanyIds = new Set<string>([companyId]);

    // Add companies from same group
    if (company.group_id) {
      const { data: groupCompanies } = await supabase
        .from("companies")
        .select("id")
        .eq("group_id", company.group_id)
        .eq("is_active", true);

      groupCompanies?.forEach(c => validCompanyIds.add(c.id));
    }

    // Add companies from configured relationships
    const { data: relationships } = await supabase
      .from("company_reporting_relationships")
      .select("source_company_id, target_company_id, is_bidirectional, relationship_type")
      .eq("is_active", true);

    relationships?.forEach(rel => {
      const typeMatches = rel.relationship_type === "both" || rel.relationship_type === reportingType;
      if (!typeMatches) return;

      if (rel.source_company_id === companyId) {
        validCompanyIds.add(rel.target_company_id);
      }
      if (rel.is_bidirectional && rel.target_company_id === companyId) {
        validCompanyIds.add(rel.source_company_id);
      }
    });

    // Fetch all positions from valid companies
    const { data: positions } = await supabase
      .from("positions")
      .select(`
        id, 
        code, 
        title, 
        company_id,
        company:companies(code)
      `)
      .in("company_id", Array.from(validCompanyIds))
      .eq("is_active", true);

    positions?.forEach(p => {
      const companyCode = (p.company as any)?.code || "";
      // Key by COMPANY_CODE:POSITION_CODE for explicit lookups
      const explicitKey = `${companyCode.toUpperCase()}:${p.code?.toUpperCase()}`;
      positionMap.set(explicitKey, {
        id: p.id,
        code: p.code,
        title: p.title,
        companyId: p.company_id,
        companyCode,
      });

      // Also key by just position code for same-company lookups
      // Only if it's from the original company (to avoid conflicts)
      if (p.company_id === companyId) {
        positionMap.set(p.code?.toUpperCase() || "", {
          id: p.id,
          code: p.code,
          title: p.title,
          companyId: p.company_id,
          companyCode,
        });
      }
    });

    return positionMap;
  } catch (error) {
    console.error("Error fetching valid reporting positions:", error);
    return positionMap;
  }
}
