import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Loader2,
  Save,
  Eye,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronRight,
  Building2,
  Tag,
  Layers,
  GitBranch,
  FolderTree,
  Briefcase,
  Container,
  Wallet,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePageAudit } from "@/hooks/usePageAudit";
import { Info } from "lucide-react";
import { RoleAccessSummary } from "@/components/permissions/RoleAccessSummary";
import { RoleInfoBanners } from "@/components/permissions/RoleInfoBanners";
import { ModuleQuickActions } from "@/components/permissions/ModuleQuickActions";
import { PermissionMatrixQuickView } from "@/components/permissions/PermissionMatrixQuickView";
import { ModuleAccessIndicator } from "@/components/permissions/ModuleAccessIndicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Role {
  id: string;
  name: string;
  code: string;
  is_system: boolean;
  role_type: string;
}

interface ModulePermission {
  id: string;
  module_code: string;
  module_name: string;
  tab_code: string | null;
  tab_name: string | null;
  display_order: number;
  container_code: string | null;
  is_container: boolean;
}

interface RolePermission {
  id: string;
  role_id: string;
  module_permission_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Company {
  id: string;
  name: string;
}

interface CompanyTag {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface Division {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  company_id: string;
}

interface Section {
  id: string;
  name: string;
  department_id: string;
}

interface PositionType {
  id: string;
  name: string;
  code: string;
  company_id: string;
}

interface PayGroup {
  id: string;
  name: string;
  code: string;
  pay_frequency: string;
  company_id: string;
}

// Modules that use container-based hierarchy (admin now includes insights and strategic planning)
const CONTAINER_BASED_MODULES = ["admin"];

// Modules that should be hidden (internal use or containers inside other modules)
const HIDDEN_MODULES = ["strategic_planning", "insights", "enablement"];

// Module display order matching main menu exactly
const MODULE_DISPLAY_ORDER = [
  "dashboard",
  "hr_hub",
  "ess",
  "mss",
  "workforce",
  "time_attendance",
  "leave",
  "payroll",
  "compensation",
  "benefits",
  "performance",
  "training",
  "succession",
  "recruitment",
  "hse",
  "employee_relations",
  "property",
  "help_center",
  "admin",
  "profile",
];

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Granular Permissions" },
];

export default function GranularPermissionsPage() {
  usePageAudit('permissions', 'Admin');
  const [searchParams] = useSearchParams();
  const roleIdFromUrl = searchParams.get("role");
  const accordionRef = useRef<HTMLDivElement>(null);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermission>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyTags, setCompanyTags] = useState<CompanyTag[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [roleCompanyAccess, setRoleCompanyAccess] = useState<string[]>([]);
  const [roleTagAccess, setRoleTagAccess] = useState<string[]>([]);
  const [roleDivisionAccess, setRoleDivisionAccess] = useState<string[]>([]);
  const [roleDepartmentAccess, setRoleDepartmentAccess] = useState<string[]>([]);
  const [roleSectionAccess, setRoleSectionAccess] = useState<string[]>([]);
  const [rolePositionTypeExclusions, setRolePositionTypeExclusions] = useState<string[]>([]);
  const [rolePayGroupAccess, setRolePayGroupAccess] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
      fetchRoleAccess(selectedRoleId);
    }
  }, [selectedRoleId]);

  const fetchInitialData = async () => {
    try {
      const [rolesRes, permissionsRes, companiesRes, tagsRes, divisionsRes, departmentsRes, sectionsRes, positionTypesRes, payGroupsRes] = await Promise.all([
        supabase.from("roles").select("id, name, code, is_system, role_type").order("name"),
        supabase.from("module_permissions").select("*").eq("is_active", true).order("display_order"),
        supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
        supabase.from("company_tags").select("*").eq("is_active", true).order("name"),
        supabase.from("divisions").select("id, name").eq("is_active", true).order("name"),
        supabase.from("departments").select("id, name, company_id").eq("is_active", true).order("name"),
        supabase.from("sections").select("id, name, department_id").eq("is_active", true).order("name"),
        supabase.from("position_types").select("id, name, code, company_id").eq("is_active", true).order("name"),
        supabase.from("pay_groups").select("id, name, code, pay_frequency, company_id").eq("is_active", true).order("name"),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (permissionsRes.error) throw permissionsRes.error;

      setRoles(rolesRes.data || []);
      setModulePermissions(permissionsRes.data || []);
      setCompanies(companiesRes.data || []);
      setCompanyTags(tagsRes.data || []);
      setDivisions(divisionsRes.data || []);
      setDepartments(departmentsRes.data || []);
      setSections(sectionsRes.data || []);
      setPositionTypes(positionTypesRes.data || []);
      setPayGroups(payGroupsRes.data || []);

      // Use role from URL if provided, otherwise first role
      if (roleIdFromUrl && rolesRes.data?.find(r => r.id === roleIdFromUrl)) {
        setSelectedRoleId(roleIdFromUrl);
      } else if (rolesRes.data && rolesRes.data.length > 0) {
        setSelectedRoleId(rolesRes.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId);

      if (error) throw error;

      const permMap: Record<string, RolePermission> = {};
      (data || []).forEach((rp) => {
        permMap[rp.module_permission_id] = rp;
      });
      setRolePermissions(permMap);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const fetchRoleAccess = async (roleId: string) => {
    try {
      const [companyRes, tagRes, divisionRes, departmentRes, sectionRes, positionTypeExclusionsRes, payGroupRes] = await Promise.all([
        supabase.from("role_company_access").select("company_id").eq("role_id", roleId),
        supabase.from("role_tag_access").select("tag_id").eq("role_id", roleId),
        supabase.from("role_division_access").select("division_id").eq("role_id", roleId),
        supabase.from("role_department_access").select("department_id").eq("role_id", roleId),
        supabase.from("role_section_access").select("section_id").eq("role_id", roleId),
        supabase.from("role_position_type_exclusions").select("position_type_id").eq("role_id", roleId),
        supabase.from("role_pay_group_access").select("pay_group_id").eq("role_id", roleId),
      ]);

      setRoleCompanyAccess((companyRes.data || []).map((c) => c.company_id));
      setRoleTagAccess((tagRes.data || []).map((t) => t.tag_id));
      setRoleDivisionAccess((divisionRes.data || []).map((d) => d.division_id));
      setRoleDepartmentAccess((departmentRes.data || []).map((d) => d.department_id));
      setRoleSectionAccess((sectionRes.data || []).map((s) => s.section_id));
      setRolePositionTypeExclusions((positionTypeExclusionsRes.data || []).map((p) => p.position_type_id));
      setRolePayGroupAccess((payGroupRes.data || []).map((p) => p.pay_group_id));
    } catch (error) {
      console.error("Error fetching role access:", error);
    }
  };

  // Helper to get permission value - defaults to FALSE (explicit grant required)
  const getPermissionValue = useCallback((modulePermissionId: string, action: string): boolean => {
    const perm = rolePermissions[modulePermissionId];
    if (!perm) return false; // Default to OFF - explicit grant required
    return !!perm[action as keyof RolePermission];
  }, [rolePermissions]);

  const togglePermission = (modulePermissionId: string, action: keyof RolePermission) => {
    setHasChanges(true);
    setRolePermissions((prev) => {
      const existing = prev[modulePermissionId];
      const currentValue = existing ? !!existing[action as keyof RolePermission] : false;
      
      if (existing) {
        return {
          ...prev,
          [modulePermissionId]: {
            ...existing,
            [action]: !currentValue,
          },
        };
      } else {
        // Creating new permission record - toggle requested action to true, others stay false
        return {
          ...prev,
          [modulePermissionId]: {
            id: "",
            role_id: selectedRoleId,
            module_permission_id: modulePermissionId,
            can_view: action === "can_view" ? true : false,
            can_create: action === "can_create" ? true : false,
            can_edit: action === "can_edit" ? true : false,
            can_delete: action === "can_delete" ? true : false,
          },
        };
      }
    });
  };

  const toggleCompanyAccess = (companyId: string) => {
    setHasChanges(true);
    setRoleCompanyAccess((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleTagAccess = (tagId: string) => {
    setHasChanges(true);
    setRoleTagAccess((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleDivisionAccess = (divisionId: string) => {
    setHasChanges(true);
    setRoleDivisionAccess((prev) =>
      prev.includes(divisionId)
        ? prev.filter((id) => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  const toggleDepartmentAccess = (departmentId: string) => {
    setHasChanges(true);
    setRoleDepartmentAccess((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const toggleSectionAccess = (sectionId: string) => {
    setHasChanges(true);
    setRoleSectionAccess((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const togglePositionTypeExclusion = (positionTypeId: string) => {
    setHasChanges(true);
    setRolePositionTypeExclusions((prev) =>
      prev.includes(positionTypeId)
        ? prev.filter((id) => id !== positionTypeId)
        : [...prev, positionTypeId]
    );
  };

  const togglePayGroupAccess = (payGroupId: string) => {
    setHasChanges(true);
    setRolePayGroupAccess((prev) =>
      prev.includes(payGroupId)
        ? prev.filter((id) => id !== payGroupId)
        : [...prev, payGroupId]
    );
  };

  const savePermissions = async () => {
    if (!selectedRoleId) return;

    setIsSaving(true);
    try {
      // Save role permissions
      const permissionsToUpsert = Object.values(rolePermissions).map((rp) => ({
        role_id: selectedRoleId,
        module_permission_id: rp.module_permission_id,
        can_view: rp.can_view,
        can_create: rp.can_create,
        can_edit: rp.can_edit,
        can_delete: rp.can_delete,
      }));

      if (permissionsToUpsert.length > 0) {
        const { error: permError } = await supabase
          .from("role_permissions")
          .upsert(permissionsToUpsert, { onConflict: "role_id,module_permission_id" });

        if (permError) throw permError;
      }

      // Save company access - delete existing and insert new
      await supabase.from("role_company_access").delete().eq("role_id", selectedRoleId);
      if (roleCompanyAccess.length > 0) {
        const { error: companyError } = await supabase
          .from("role_company_access")
          .insert(roleCompanyAccess.map((companyId) => ({ role_id: selectedRoleId, company_id: companyId })));
        if (companyError) throw companyError;
      }

      // Save tag access - delete existing and insert new
      await supabase.from("role_tag_access").delete().eq("role_id", selectedRoleId);
      if (roleTagAccess.length > 0) {
        const { error: tagError } = await supabase
          .from("role_tag_access")
          .insert(roleTagAccess.map((tagId) => ({ role_id: selectedRoleId, tag_id: tagId })));
        if (tagError) throw tagError;
      }

      // Save division access - delete existing and insert new
      await supabase.from("role_division_access").delete().eq("role_id", selectedRoleId);
      if (roleDivisionAccess.length > 0) {
        const { error: divisionError } = await supabase
          .from("role_division_access")
          .insert(roleDivisionAccess.map((divisionId) => ({ role_id: selectedRoleId, division_id: divisionId })));
        if (divisionError) throw divisionError;
      }

      // Save department access - delete existing and insert new
      await supabase.from("role_department_access").delete().eq("role_id", selectedRoleId);
      if (roleDepartmentAccess.length > 0) {
        const { error: departmentError } = await supabase
          .from("role_department_access")
          .insert(roleDepartmentAccess.map((departmentId) => ({ role_id: selectedRoleId, department_id: departmentId })));
        if (departmentError) throw departmentError;
      }

      // Save section access - delete existing and insert new
      await supabase.from("role_section_access").delete().eq("role_id", selectedRoleId);
      if (roleSectionAccess.length > 0) {
        const { error: sectionError } = await supabase
          .from("role_section_access")
          .insert(roleSectionAccess.map((sectionId) => ({ role_id: selectedRoleId, section_id: sectionId })));
        if (sectionError) throw sectionError;
      }

      // Save position type exclusions - delete existing and insert new
      await supabase.from("role_position_type_exclusions").delete().eq("role_id", selectedRoleId);
      if (rolePositionTypeExclusions.length > 0) {
        const { error: positionTypeError } = await supabase
          .from("role_position_type_exclusions")
          .insert(rolePositionTypeExclusions.map((positionTypeId) => ({ role_id: selectedRoleId, position_type_id: positionTypeId })));
        if (positionTypeError) throw positionTypeError;
      }

      // Save pay group access - delete existing and insert new
      await supabase.from("role_pay_group_access").delete().eq("role_id", selectedRoleId);
      if (rolePayGroupAccess.length > 0) {
        const { error: payGroupError } = await supabase
          .from("role_pay_group_access")
          .insert(rolePayGroupAccess.map((payGroupId) => ({ role_id: selectedRoleId, pay_group_id: payGroupId })));
        if (payGroupError) throw payGroupError;
      }

      toast({ title: "Permissions saved successfully" });
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save permissions.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Group module permissions by module
  const groupedPermissions = useMemo(() => {
    return modulePermissions.reduce((acc, mp) => {
      if (!acc[mp.module_code]) {
        acc[mp.module_code] = {
          module_code: mp.module_code,
          module_name: mp.module_name,
          tabs: [],
          containers: [],
          isContainerBased: CONTAINER_BASED_MODULES.includes(mp.module_code),
        };
      }
      
      if (mp.tab_code) {
        if (mp.is_container) {
          acc[mp.module_code].containers.push({
            ...mp,
            features: [] as ModulePermission[],
          });
        } else if (mp.container_code) {
          const container = acc[mp.module_code].containers.find(
            (c: any) => c.tab_code === mp.container_code
          );
          if (container) {
            container.features.push(mp);
          } else {
            acc[mp.module_code].tabs.push(mp);
          }
        } else {
          acc[mp.module_code].tabs.push(mp);
        }
      }
      return acc;
    }, {} as Record<string, { 
      module_code: string; 
      module_name: string; 
      tabs: ModulePermission[];
      containers: (ModulePermission & { features: ModulePermission[] })[];
      isContainerBased: boolean;
    }>);
  }, [modulePermissions]);

  // Calculate module access status
  const getModuleAccessStatus = useCallback((moduleCode: string): { status: "full" | "partial" | "none"; accessibleTabs: number; totalTabs: number } => {
    const group = groupedPermissions[moduleCode];
    if (!group) return { status: "none", accessibleTabs: 0, totalTabs: 0 };

    const allTabs = [...group.tabs];
    group.containers.forEach(c => {
      allTabs.push(c);
      allTabs.push(...c.features);
    });

    let accessibleCount = 0;
    let totalCount = allTabs.length;

    allTabs.forEach(tab => {
      if (getPermissionValue(tab.id, "can_view")) {
        accessibleCount++;
      }
    });

    if (accessibleCount === 0) return { status: "none", accessibleTabs: 0, totalTabs: totalCount };
    if (accessibleCount === totalCount) return { status: "full", accessibleTabs: accessibleCount, totalTabs: totalCount };
    return { status: "partial", accessibleTabs: accessibleCount, totalTabs: totalCount };
  }, [groupedPermissions, getPermissionValue]);

  // Calculate module permission summary (full/partial for each action)
  const getModulePermissionSummary = useCallback((moduleCode: string) => {
    const group = groupedPermissions[moduleCode];
    if (!group) return { canView: false, canCreate: false, canEdit: false, canDelete: false };

    const allTabs = [...group.tabs];
    group.containers.forEach(c => {
      allTabs.push(c);
      allTabs.push(...c.features);
    });

    const totals = { view: 0, create: 0, edit: 0, delete: 0 };
    const total = allTabs.length;

    allTabs.forEach(tab => {
      if (getPermissionValue(tab.id, "can_view")) totals.view++;
      if (getPermissionValue(tab.id, "can_create")) totals.create++;
      if (getPermissionValue(tab.id, "can_edit")) totals.edit++;
      if (getPermissionValue(tab.id, "can_delete")) totals.delete++;
    });

    const getStatus = (count: number) => {
      if (count === 0) return false;
      if (count === total) return true;
      return "partial" as const;
    };

    return {
      canView: getStatus(totals.view),
      canCreate: getStatus(totals.create),
      canEdit: getStatus(totals.edit),
      canDelete: getStatus(totals.delete),
    };
  }, [groupedPermissions, getPermissionValue]);

  // Quick action handlers
  const handleGrantAll = useCallback((moduleCode: string) => {
    const group = groupedPermissions[moduleCode];
    if (!group) return;

    const allTabs = [...group.tabs];
    group.containers.forEach(c => {
      allTabs.push(c);
      allTabs.push(...c.features);
    });

    setRolePermissions(prev => {
      const updated = { ...prev };
      allTabs.forEach(tab => {
        updated[tab.id] = {
          id: prev[tab.id]?.id || "",
          role_id: selectedRoleId,
          module_permission_id: tab.id,
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
        };
      });
      return updated;
    });
    setHasChanges(true);
    toast({ title: `All permissions granted for ${group.module_name}` });
  }, [groupedPermissions, selectedRoleId, toast]);

  const handleRevokeAll = useCallback((moduleCode: string) => {
    const group = groupedPermissions[moduleCode];
    if (!group) return;

    const allTabs = [...group.tabs];
    group.containers.forEach(c => {
      allTabs.push(c);
      allTabs.push(...c.features);
    });

    setRolePermissions(prev => {
      const updated = { ...prev };
      allTabs.forEach(tab => {
        updated[tab.id] = {
          id: prev[tab.id]?.id || "",
          role_id: selectedRoleId,
          module_permission_id: tab.id,
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false,
        };
      });
      return updated;
    });
    setHasChanges(true);
    toast({ title: `All permissions revoked for ${group.module_name}` });
  }, [groupedPermissions, selectedRoleId, toast]);

  const handleViewOnly = useCallback((moduleCode: string) => {
    const group = groupedPermissions[moduleCode];
    if (!group) return;

    const allTabs = [...group.tabs];
    group.containers.forEach(c => {
      allTabs.push(c);
      allTabs.push(...c.features);
    });

    setRolePermissions(prev => {
      const updated = { ...prev };
      allTabs.forEach(tab => {
        updated[tab.id] = {
          id: prev[tab.id]?.id || "",
          role_id: selectedRoleId,
          module_permission_id: tab.id,
          can_view: true,
          can_create: false,
          can_edit: false,
          can_delete: false,
        };
      });
      return updated;
    });
    setHasChanges(true);
    toast({ title: `View-only permissions set for ${group.module_name}` });
  }, [groupedPermissions, selectedRoleId, toast]);

  // Scroll to module in accordion
  const scrollToModule = useCallback((moduleCode: string) => {
    setOpenAccordions(prev => [...new Set([...prev, moduleCode])]);
    setTimeout(() => {
      const element = document.getElementById(`module-${moduleCode}`);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  // Calculate stats for summary
  const moduleStats = useMemo(() => {
    const visibleModules = Object.values(groupedPermissions).filter(
      g => !HIDDEN_MODULES.includes(g.module_code)
    );
    
    let accessibleModules = 0;
    let totalTabs = 0;
    let accessibleTabs = 0;

    visibleModules.forEach(group => {
      const status = getModuleAccessStatus(group.module_code);
      totalTabs += status.totalTabs;
      accessibleTabs += status.accessibleTabs;
      if (status.status !== "none") {
        accessibleModules++;
      }
    });

    return {
      totalModules: visibleModules.length,
      accessibleModules,
      totalTabs,
      accessibleTabs,
    };
  }, [groupedPermissions, getModuleAccessStatus]);

  const orgScopeStats = useMemo(() => ({
    companiesSelected: roleCompanyAccess.length,
    tagsSelected: roleTagAccess.length,
    totalCompanies: companies.length,
    isAllAccess: roleCompanyAccess.length === 0 && roleTagAccess.length === 0,
  }), [roleCompanyAccess, roleTagAccess, companies]);

  // Build matrix data
  const matrixModules = useMemo(() => {
    return Object.values(groupedPermissions)
      .filter(g => !HIDDEN_MODULES.includes(g.module_code))
      .sort((a, b) => {
        const aIndex = MODULE_DISPLAY_ORDER.indexOf(a.module_code);
        const bIndex = MODULE_DISPLAY_ORDER.indexOf(b.module_code);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      })
      .map(group => {
        const accessStatus = getModuleAccessStatus(group.module_code);
        const permSummary = getModulePermissionSummary(group.module_code);
        return {
          moduleCode: group.module_code,
          moduleName: group.module_name,
          tabCount: accessStatus.totalTabs,
          accessibleTabs: accessStatus.accessibleTabs,
          canView: permSummary.canView,
          canCreate: permSummary.canCreate,
          canEdit: permSummary.canEdit,
          canDelete: permSummary.canDelete,
          status: accessStatus.status,
        };
      });
  }, [groupedPermissions, getModuleAccessStatus, getModulePermissionSummary]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isSystemRole = selectedRole?.role_type === "system";

  // Render container-based module (admin/insights)
  const renderContainerBasedModule = (group: typeof groupedPermissions[string]) => {
    const modulePerm = modulePermissions.find(
      (mp) => mp.module_code === group.module_code && !mp.tab_code
    );
    const accessStatus = getModuleAccessStatus(group.module_code);

    return (
      <AccordionItem key={group.module_code} value={group.module_code} id={`module-${group.module_code}`}>
        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              <span className="font-semibold">{group.module_name}</span>
            </div>
            <ModuleAccessIndicator
              status={accessStatus.status}
              tabCount={accessStatus.totalTabs}
              accessibleTabCount={accessStatus.accessibleTabs}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          {/* Quick Actions */}
          <ModuleQuickActions
            moduleCode={group.module_code}
            onGrantAll={handleGrantAll}
            onRevokeAll={handleRevokeAll}
            onViewOnly={handleViewOnly}
            disabled={isSystemRole}
          />

          {/* Module-level permission row */}
          {modulePerm && (
            <div className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b bg-muted/30">
              <div className="pl-6 text-sm text-muted-foreground italic">
                All {group.module_name}
              </div>
              {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                <div key={action} className="flex justify-center">
                  <Checkbox
                    checked={getPermissionValue(modulePerm.id, action)}
                    onCheckedChange={() =>
                      togglePermission(modulePerm.id, action as keyof RolePermission)
                    }
                    disabled={isSystemRole}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Container accordion */}
          <Accordion type="multiple" className="w-full">
            {group.containers.map((container) => (
              <AccordionItem key={container.id} value={container.tab_code || container.id}>
                <AccordionTrigger className="px-4 pl-8 hover:no-underline hover:bg-muted/30 py-2">
                  <div className="flex items-center gap-2">
                    <Container className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{container.tab_name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {container.features.length} features
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {/* Container-level permission row */}
                  <div className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b bg-primary/5">
                    <div className="pl-12 text-sm text-muted-foreground italic">
                      All {container.tab_name}
                    </div>
                    {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                      <div key={action} className="flex justify-center">
                        <Checkbox
                          checked={getPermissionValue(container.id, action)}
                          onCheckedChange={() =>
                            togglePermission(container.id, action as keyof RolePermission)
                          }
                          disabled={isSystemRole}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Feature rows within container */}
                  {container.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b last:border-b-0 hover:bg-muted/20"
                    >
                      <div className="pl-16 text-sm">{feature.tab_name}</div>
                      {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                        <div key={action} className="flex justify-center">
                          <Checkbox
                            checked={getPermissionValue(feature.id, action)}
                            onCheckedChange={() =>
                              togglePermission(feature.id, action as keyof RolePermission)
                            }
                            disabled={isSystemRole}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    );
  };

  // Render regular module (flat tabs)
  const renderRegularModule = (group: typeof groupedPermissions[string]) => {
    const modulePerm = modulePermissions.find(
      (mp) => mp.module_code === group.module_code && !mp.tab_code
    );
    const accessStatus = getModuleAccessStatus(group.module_code);

    return (
      <AccordionItem key={group.module_code} value={group.module_code} id={`module-${group.module_code}`}>
        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              <span className="font-semibold">{group.module_name}</span>
            </div>
            <ModuleAccessIndicator
              status={accessStatus.status}
              tabCount={accessStatus.totalTabs}
              accessibleTabCount={accessStatus.accessibleTabs}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          {/* Quick Actions */}
          <ModuleQuickActions
            moduleCode={group.module_code}
            onGrantAll={handleGrantAll}
            onRevokeAll={handleRevokeAll}
            onViewOnly={handleViewOnly}
            disabled={isSystemRole}
          />

          {/* Module-level permission row */}
          {modulePerm && (
            <div className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b bg-muted/30">
              <div className="pl-6 text-sm text-muted-foreground italic">
                All {group.module_name}
              </div>
              {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                <div key={action} className="flex justify-center">
                  <Checkbox
                    checked={getPermissionValue(modulePerm.id, action)}
                    onCheckedChange={() =>
                      togglePermission(modulePerm.id, action as keyof RolePermission)
                    }
                    disabled={isSystemRole}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tab-level permission rows */}
          {group.tabs.map((tab) => (
            <div
              key={tab.id}
              className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b last:border-b-0 hover:bg-muted/20"
            >
              <div className="pl-10 text-sm">{tab.tab_name}</div>
              {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                <div key={action} className="flex justify-center">
                  <Checkbox
                    checked={getPermissionValue(tab.id, action)}
                    onCheckedChange={() =>
                      togglePermission(tab.id, action as keyof RolePermission)
                    }
                    disabled={isSystemRole}
                  />
                </div>
              ))}
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Module Access</h1>
              <p className="text-muted-foreground mt-1">
                Configure module, container, and action-level permissions for each role
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {role.name}
                        {role.role_type === "system" && (
                          <Badge variant="outline" className="ml-1 text-xs bg-red-500/10 text-red-600 dark:text-red-400">System</Badge>
                        )}
                        {role.role_type === "seeded" && (
                          <Badge variant="outline" className="ml-1 text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400">Template</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={savePermissions} disabled={isSaving || !hasChanges || isSystemRole}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Prominent Role Context Header */}
          {selectedRole && (
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Currently Managing</p>
                    <h2 className="text-2xl font-bold text-foreground">{selectedRole.name}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRole.role_type === "system" && (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-200">
                      System Role
                    </Badge>
                  )}
                  {selectedRole.role_type === "seeded" && (
                    <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200">
                      Template Role
                    </Badge>
                  )}
                  {selectedRole.role_type === "custom" && (
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200">
                      Custom Role
                    </Badge>
                  )}
                  {hasChanges && (
                    <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 animate-pulse">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedRole && (
          <div className="space-y-4">
            {/* Role Access Summary */}
            <RoleAccessSummary
              role={selectedRole}
              moduleStats={moduleStats}
              orgScopeStats={orgScopeStats}
              hasUnsavedChanges={hasChanges}
            />

            {/* Info Banners */}
            <RoleInfoBanners role={selectedRole} />

            <Tabs defaultValue="permissions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="permissions">Module Access</TabsTrigger>
                <TabsTrigger value="company_access">Company Scope</TabsTrigger>
                <TabsTrigger value="org_access">Organizational Scope</TabsTrigger>
                <TabsTrigger value="pay_group_access">Pay Group Restrictions</TabsTrigger>
                <TabsTrigger value="position_type_restrictions">Employment Filters</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                {/* Permission Matrix Quick View */}
                <PermissionMatrixQuickView
                  modules={matrixModules}
                  onModuleClick={scrollToModule}
                />

                <div className="rounded-lg border bg-card">
                  <TooltipProvider>
                    <div className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 p-4 border-b bg-muted/50 text-sm font-medium">
                      <div>Module / Container / Feature</div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help"><Eye className="h-4 w-4 mx-auto" /></div>
                        </TooltipTrigger>
                        <TooltipContent>View - Can see this item</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help"><PlusCircle className="h-4 w-4 mx-auto" /></div>
                        </TooltipTrigger>
                        <TooltipContent>Create - Can add new records</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help"><Pencil className="h-4 w-4 mx-auto" /></div>
                        </TooltipTrigger>
                        <TooltipContent>Edit - Can modify existing records</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help"><Trash2 className="h-4 w-4 mx-auto" /></div>
                        </TooltipTrigger>
                        <TooltipContent>Delete - Can remove records</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  <ScrollArea className="h-[600px]" ref={accordionRef}>
                    <Accordion 
                      type="multiple" 
                      className="w-full"
                      value={openAccordions}
                      onValueChange={setOpenAccordions}
                    >
                      {Object.values(groupedPermissions)
                        .filter((group) => !HIDDEN_MODULES.includes(group.module_code))
                        .sort((a, b) => {
                          const aIndex = MODULE_DISPLAY_ORDER.indexOf(a.module_code);
                          const bIndex = MODULE_DISPLAY_ORDER.indexOf(b.module_code);
                          const aOrder = aIndex === -1 ? 999 : aIndex;
                          const bOrder = bIndex === -1 ? 999 : bIndex;
                          return aOrder - bOrder;
                        })
                        .map((group) => {
                          if (group.isContainerBased && group.containers.length > 0) {
                            return renderContainerBasedModule(group);
                          } else {
                            return renderRegularModule(group);
                          }
                        })}
                    </Accordion>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="company_access" className="space-y-4">
                {/* Self-service role banner */}
                {selectedRole && (selectedRole.code === 'employee' || selectedRole.name.toLowerCase().includes('employee')) && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Self-Service Role Detected</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      Self-service roles (like Employee) access their own data via Row-Level Security (RLS). 
                      <strong> Leave all options unchecked</strong> — these scope settings only affect roles that access other employees' records.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Direct Company Access */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Direct Company Access
                      </CardTitle>
                      <CardDescription>
                        Assign specific companies this role can manage. No selection = access to all companies.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {companies.map((company) => (
                            <div
                              key={company.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                roleCompanyAccess.includes(company.id) && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Checkbox
                                id={`company-${company.id}`}
                                checked={roleCompanyAccess.includes(company.id)}
                                onCheckedChange={() => toggleCompanyAccess(company.id)}
                                disabled={isSystemRole}
                              />
                              <label
                                htmlFor={`company-${company.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {company.name}
                              </label>
                            </div>
                          ))}
                          {companies.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              No companies found
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Tag-based Access */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Tag-based Access
                      </CardTitle>
                      <CardDescription>
                        Grant access to all companies with selected tags
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {companyTags.map((tag) => (
                            <div
                              key={tag.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                roleTagAccess.includes(tag.id) && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Checkbox
                                id={`tag-${tag.id}`}
                                checked={roleTagAccess.includes(tag.id)}
                                onCheckedChange={() => toggleTagAccess(tag.id)}
                                disabled={isSystemRole}
                              />
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <label
                                htmlFor={`tag-${tag.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {tag.name}
                              </label>
                              <code className="text-xs text-muted-foreground">
                                {tag.code}
                              </code>
                            </div>
                          ))}
                          {companyTags.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              No company tags found. Create tags first.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="org_access" className="space-y-4">
                {/* Self-service role banner */}
                {selectedRole && (selectedRole.code === 'employee' || selectedRole.name.toLowerCase().includes('employee')) && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Self-Service Role Detected</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      For self-service roles, organizational scope is not applicable. Employees access their own records via their profile ID. 
                      <strong> Leave all options unchecked.</strong>
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-muted-foreground mb-4">
                  By default, roles have access to all divisions, departments, and sections. Check items below to <strong>restrict</strong> access to only the selected items.
                </p>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Divisions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Division Access
                      </CardTitle>
                      <CardDescription>
                        Limit access to specific divisions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {divisions.map((division) => (
                            <div
                              key={division.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                roleDivisionAccess.includes(division.id) && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Checkbox
                                id={`division-${division.id}`}
                                checked={roleDivisionAccess.includes(division.id)}
                                onCheckedChange={() => toggleDivisionAccess(division.id)}
                                disabled={isSystemRole}
                              />
                              <label
                                htmlFor={`division-${division.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {division.name}
                              </label>
                            </div>
                          ))}
                          {divisions.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              No divisions found
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Departments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Department Access
                      </CardTitle>
                      <CardDescription>
                        Limit access to specific departments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {departments.map((dept) => (
                            <div
                              key={dept.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                roleDepartmentAccess.includes(dept.id) && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Checkbox
                                id={`department-${dept.id}`}
                                checked={roleDepartmentAccess.includes(dept.id)}
                                onCheckedChange={() => toggleDepartmentAccess(dept.id)}
                                disabled={isSystemRole}
                              />
                              <label
                                htmlFor={`department-${dept.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {dept.name}
                              </label>
                            </div>
                          ))}
                          {departments.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              No departments found
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Sections */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderTree className="h-5 w-5" />
                        Section Access
                      </CardTitle>
                      <CardDescription>
                        Limit access to specific sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {sections.map((section) => (
                            <div
                              key={section.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                roleSectionAccess.includes(section.id) && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Checkbox
                                id={`section-${section.id}`}
                                checked={roleSectionAccess.includes(section.id)}
                                onCheckedChange={() => toggleSectionAccess(section.id)}
                                disabled={isSystemRole}
                              />
                              <label
                                htmlFor={`section-${section.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {section.name}
                              </label>
                            </div>
                          ))}
                          {sections.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              No sections found
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pay_group_access" className="space-y-4">
                {/* Self-service role banner */}
                {selectedRole && (selectedRole.code === 'employee' || selectedRole.name.toLowerCase().includes('employee')) && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Self-Service Role Detected</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      Self-service roles ignore pay group restrictions. Employees see only their own payslips regardless of pay group. 
                      <strong> Leave all options unchecked</strong> — use this for roles that process payroll across multiple employees.
                    </AlertDescription>
                  </Alert>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Pay Group Access
                    </CardTitle>
                    <CardDescription>
                      By default, this role has access to all pay groups. Check pay groups below to <strong>restrict</strong> access to only the selected pay groups. This affects payroll processing and reporting visibility.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {payGroups.map((payGroup) => {
                          const company = companies.find((c) => c.id === payGroup.company_id);
                          return (
                            <div
                              key={payGroup.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                rolePayGroupAccess.includes(payGroup.id) && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Checkbox
                                id={`paygroup-${payGroup.id}`}
                                checked={rolePayGroupAccess.includes(payGroup.id)}
                                onCheckedChange={() => togglePayGroupAccess(payGroup.id)}
                                disabled={isSystemRole}
                              />
                              <label
                                htmlFor={`paygroup-${payGroup.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="text-sm font-medium">{payGroup.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {company?.name} • {payGroup.pay_frequency}
                                </div>
                              </label>
                              <code className="text-xs text-muted-foreground">
                                {payGroup.code}
                              </code>
                            </div>
                          );
                        })}
                        {payGroups.length === 0 && (
                          <p className="col-span-full text-center text-muted-foreground py-4">
                            No pay groups found
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="position_type_restrictions" className="space-y-4">
                {/* Self-service role banner */}
                {selectedRole && (selectedRole.code === 'employee' || selectedRole.name.toLowerCase().includes('employee')) && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Self-Service Role Detected</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      Employment filters do not apply to self-service roles. Use this setting to exclude certain employee types (e.g., Executives, Contractors) from a role's visibility when accessing other employees' records.
                      <strong> Leave all options unchecked.</strong>
                    </AlertDescription>
                  </Alert>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Position Type Exclusions
                    </CardTitle>
                    <CardDescription>
                      By default, this role can access employees in all position types. Check position types below to <strong>exclude</strong> them from this role's access. This affects employee visibility and reporting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {positionTypes.map((posType) => {
                          const company = companies.find((c) => c.id === posType.company_id);
                          return (
                            <div
                              key={posType.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50",
                                rolePositionTypeExclusions.includes(posType.id) && "border-destructive/50 bg-destructive/5"
                              )}
                            >
                              <Checkbox
                                id={`postype-${posType.id}`}
                                checked={rolePositionTypeExclusions.includes(posType.id)}
                                onCheckedChange={() => togglePositionTypeExclusion(posType.id)}
                                disabled={isSystemRole}
                              />
                              <label
                                htmlFor={`postype-${posType.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="text-sm font-medium">{posType.name}</div>
                                {company && (
                                  <div className="text-xs text-muted-foreground">{company.name}</div>
                                )}
                              </label>
                              <code className="text-xs text-muted-foreground">
                                {posType.code}
                              </code>
                            </div>
                          );
                        })}
                        {positionTypes.length === 0 && (
                          <p className="col-span-full text-center text-muted-foreground py-4">
                            No position types found
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
