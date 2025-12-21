import { Json } from "@/integrations/supabase/types";

export type RoleType = "system" | "seeded" | "custom" | "hr" | "business" | "commercial" | "internal";
export type TenantVisibility = "single" | "multi" | "global" | "all" | "hrplus_internal" | "client";
export type PiiLevel = "none" | "masked" | "partial" | "limited" | "full";
export type ExportPermission = "none" | "allowed" | "approval_required";
export type ContainerPermissionLevel = "none" | "view" | "configure" | "approve";
export type AdminContainerPermission = "none" | "view" | "configure" | "approve";

export interface EnhancedRole {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  is_seeded: boolean;
  role_type: RoleType;
  base_role_id: string | null;
  seeded_role_code: string | null;
  tenant_visibility: TenantVisibility;
  menu_permissions: string[];
  can_view_pii: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  is_seeded: boolean;
  role_type: RoleType;
  base_role_id: string | null;
  seeded_role_code: string | null;
  tenant_visibility: TenantVisibility;
  menu_permissions: string[];
  can_view_pii: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePiiAccess {
  id: string;
  role_id: string;
  pii_level: PiiLevel;
  access_personal_details: boolean;
  access_compensation: boolean;
  access_banking: boolean;
  access_medical: boolean;
  access_disciplinary: boolean;
  masking_enabled: boolean;
  export_permission: ExportPermission;
  jit_access_required: boolean;
  approval_required_for_full: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleContainerAccess {
  id: string;
  role_id: string;
  container_code: string;
  permission_level: ContainerPermissionLevel;
  created_at: string;
  updated_at: string;
}

export interface RoleWithDetails extends Role {
  pii_access?: RolePiiAccess;
  container_access?: RoleContainerAccess[];
  base_role?: Role | null;
  modules_count?: number;
}

// Role type badges configuration
export const ROLE_TYPE_CONFIG: Record<RoleType, { label: string; color: string }> = {
  system: { label: "System", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  seeded: { label: "Seeded", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  custom: { label: "Custom", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
  hr: { label: "HR", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  business: { label: "Business", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  commercial: { label: "Commercial", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  internal: { label: "Internal", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
};

// PII level badges configuration
export const PII_LEVEL_CONFIG: Record<PiiLevel, { label: string; color: string }> = {
  none: { label: "No PII Access", color: "bg-muted text-muted-foreground" },
  masked: { label: "Masked", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
  partial: { label: "Partial", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  limited: { label: "Limited PII", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  full: { label: "Full PII", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

// Container permission level configuration
export const CONTAINER_PERMISSION_CONFIG: Record<ContainerPermissionLevel, { label: string; color: string }> = {
  none: { label: "None", color: "bg-muted text-muted-foreground" },
  view: { label: "View", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  configure: { label: "Configure", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  approve: { label: "Approve", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
};

// Admin container definitions
export const ADMIN_CONTAINERS = [
  { code: "org_structure", label: "Organization & Structure", description: "Departments, divisions, positions, and org chart management" },
  { code: "users_roles_access", label: "Users, Roles & Access", description: "User accounts, role assignments, and access controls" },
  { code: "security_governance", label: "Security & Governance", description: "Security policies, audit logs, and governance settings" },
  { code: "system_platform_config", label: "System & Platform Configuration", description: "System settings, integrations, and platform configuration" },
  { code: "strategic_planning", label: "Strategic Planning", description: "Workforce planning, scenario modeling, and organizational design" },
  { code: "insights_analytics", label: "Insights & Analytics", description: "Workforce analytics, dashboards, and strategic insights" },
  { code: "compliance_risk", label: "Compliance & Risk", description: "Compliance monitoring, risk management, and regulatory settings" },
  { code: "documentation_enablement", label: "Documentation & Enablement", description: "Documentation, training materials, and enablement resources" },
  { code: "billing_subscriptions", label: "Billing & Subscriptions", description: "Billing, invoices, and subscription management" },
] as const;

// PII domain definitions
export const PII_DOMAINS = [
  { code: "personal_details", label: "Personal Details", description: "Name, address, date of birth, national ID" },
  { code: "compensation", label: "Compensation", description: "Salary, bonuses, pay history" },
  { code: "banking", label: "Banking", description: "Bank accounts, routing numbers" },
  { code: "medical", label: "Medical", description: "Health information, medical leave" },
  { code: "disciplinary", label: "Disciplinary", description: "Disciplinary records, warnings" },
] as const;
