import { supabase } from "@/integrations/supabase/client";

export type ViolationType = 
  | "unauthorized_data_access"
  | "role_escalation"
  | "pii_query"
  | "restricted_module"
  | "budget_exceeded"
  | "disabled_user";

export type ViolationSeverity = "low" | "medium" | "high" | "critical";

interface LogViolationParams {
  userId: string;
  companyId?: string | null;
  violationType: ViolationType;
  severity: ViolationSeverity;
  userQuery: string;
  attemptedResource?: string;
  blockedReason?: string;
  aiResponse?: string;
  sessionId?: string;
}

/**
 * Log an AI security violation attempt
 * Call this when a user tries to access data they shouldn't via AI
 */
export async function logAISecurityViolation(params: LogViolationParams): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("log_ai_security_violation", {
      p_user_id: params.userId,
      p_company_id: params.companyId || null,
      p_violation_type: params.violationType,
      p_severity: params.severity,
      p_user_query: params.userQuery,
      p_attempted_resource: params.attemptedResource || null,
      p_blocked_reason: params.blockedReason || null,
      p_ai_response: params.aiResponse || null,
      p_session_id: params.sessionId || null,
    });

    if (error) {
      console.error("Failed to log AI security violation:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error logging AI security violation:", error);
    return null;
  }
}

/**
 * Determine violation severity based on type and context
 */
export function determineViolationSeverity(
  violationType: ViolationType,
  attemptedResource?: string
): ViolationSeverity {
  // Critical: attempts to access highly sensitive data
  if (
    violationType === "pii_query" ||
    (violationType === "unauthorized_data_access" && 
      attemptedResource?.includes("salary")) ||
    (violationType === "unauthorized_data_access" && 
      attemptedResource?.includes("compensation"))
  ) {
    return "critical";
  }

  // High: role escalation or access to restricted modules
  if (violationType === "role_escalation" || violationType === "restricted_module") {
    return "high";
  }

  // Medium: budget exceeded or general unauthorized access
  if (violationType === "budget_exceeded" || violationType === "unauthorized_data_access") {
    return "medium";
  }

  // Low: disabled user attempts
  return "low";
}

/**
 * Check if a query might be attempting to access restricted data
 * Returns the type of violation if detected, null otherwise
 */
export function detectPotentialViolation(
  query: string,
  userRole: string,
  allowedModules: string[]
): { type: ViolationType; resource: string } | null {
  const lowerQuery = query.toLowerCase();
  
  // Detect PII-related queries
  const piiPatterns = [
    "social security",
    "ssn",
    "bank account",
    "routing number",
    "credit card",
    "national id",
    "passport number",
    "date of birth",
    "home address",
    "personal phone",
  ];
  
  for (const pattern of piiPatterns) {
    if (lowerQuery.includes(pattern)) {
      return { type: "pii_query", resource: pattern };
    }
  }

  // Detect salary/compensation queries if user is not HR/Admin
  const salaryPatterns = ["salary", "compensation", "pay rate", "wages", "bonus amount"];
  if (!["admin", "hr_manager"].includes(userRole)) {
    for (const pattern of salaryPatterns) {
      if (lowerQuery.includes(pattern) && lowerQuery.includes("other") || 
          lowerQuery.includes("all employees") ||
          lowerQuery.includes("everyone")) {
        return { type: "unauthorized_data_access", resource: "salary_data" };
      }
    }
  }

  // Detect module access violations
  const modulePatterns: Record<string, string> = {
    payroll: "payroll",
    recruitment: "recruitment",
    performance: "performance",
    "time off": "leave",
    leave: "leave",
    benefits: "benefits",
  };

  for (const [pattern, module] of Object.entries(modulePatterns)) {
    if (lowerQuery.includes(pattern) && !allowedModules.includes(module)) {
      return { type: "restricted_module", resource: module };
    }
  }

  return null;
}
