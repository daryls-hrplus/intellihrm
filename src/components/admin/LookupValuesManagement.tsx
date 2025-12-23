import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import { BulkLookupValuesUpload } from "./BulkLookupValuesUpload";
import { formatDateForDisplay, parseLocalDate, getTodayString } from "@/utils/dateUtils";
import { useAuditLog } from "@/hooks/useAuditLog";

// Standard lookup_values categories
type LookupCategory = 
  | "employee_status"
  | "termination_reason"
  | "employee_type"
  | "employment_action"
  | "leave_type"
  | "contract_type"
  | "qualification_type"
  | "education_level"
  | "field_of_study"
  | "institution_name"
  | "certification_type"
  | "certification_name"
  | "accrediting_body";

// Immigration-specific table categories
type ImmigrationCategory = 
  | "immigration_document_types"
  | "immigration_categories"
  | "immigration_permit_statuses"
  | "csme_skill_categories"
  | "immigration_dependent_types"
  | "travel_document_types";

type AllCategory = LookupCategory | ImmigrationCategory;

const IMMIGRATION_CATEGORIES: ImmigrationCategory[] = [
  "immigration_document_types",
  "immigration_categories", 
  "immigration_permit_statuses",
  "csme_skill_categories",
  "immigration_dependent_types",
  "travel_document_types",
];

interface LookupValue {
  id: string;
  category: LookupCategory;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ImmigrationCode {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface LookupValueForm {
  code: string;
  name: string;
  description: string;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface ImmigrationCodeForm {
  code: string;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface CategoryConfig {
  label: string;
  description: string;
  module: string;
  subgroup?: string;
  tableName?: string; // For immigration categories that use separate tables
}

// Grouped by module, alphabetically ordered within each module/subgroup
const CATEGORY_CONFIG: Record<AllCategory, CategoryConfig> = {
  // Leave Management
  leave_type: {
    label: "Leave Types",
    description: "Types of leave available to employees",
    module: "Leave Management",
  },
  // Workforce - General
  contract_type: {
    label: "Contract Types",
    description: "Types of employment contracts",
    module: "Workforce",
  },
  employee_status: {
    label: "Employee Statuses",
    description: "Define the various employment statuses an employee can have",
    module: "Workforce",
  },
  employee_type: {
    label: "Employee Types",
    description: "Types of employment arrangements",
    module: "Workforce",
  },
  employment_action: {
    label: "Employment Actions",
    description: "Actions that can be taken on employee records",
    module: "Workforce",
  },
  termination_reason: {
    label: "Termination Reasons",
    description: "Reasons for employment termination",
    module: "Workforce",
  },
  // Workforce - Immigration subgroup
  immigration_document_types: {
    label: "Document Types",
    description: "Types of immigration documents (passports, visas, permits)",
    module: "Workforce",
    subgroup: "Immigration",
    tableName: "immigration_document_types",
  },
  immigration_categories: {
    label: "Permit Categories",
    description: "Categories for immigration permits and visas by country",
    module: "Workforce",
    subgroup: "Immigration",
    tableName: "immigration_categories",
  },
  immigration_permit_statuses: {
    label: "Permit Statuses",
    description: "Status values for work permits and immigration documents",
    module: "Workforce",
    subgroup: "Immigration",
    tableName: "immigration_permit_statuses",
  },
  csme_skill_categories: {
    label: "CSME Skills",
    description: "CARICOM Single Market skill categories for free movement",
    module: "Workforce",
    subgroup: "Immigration",
    tableName: "csme_skill_categories",
  },
  immigration_dependent_types: {
    label: "Dependent Types",
    description: "Types of dependents for immigration purposes",
    module: "Workforce",
    subgroup: "Immigration",
    tableName: "immigration_dependent_types",
  },
  travel_document_types: {
    label: "Travel Documents",
    description: "Types of travel documents (passport, travel card, etc.)",
    module: "Workforce",
    subgroup: "Immigration",
    tableName: "travel_document_types",
  },
  // Workforce - Qualifications subgroup
  accrediting_body: {
    label: "Certifying/Accrediting Bodies",
    description: "Organizations that issue certifications and accreditations",
    module: "Workforce",
    subgroup: "Qualifications",
  },
  certification_name: {
    label: "Certification/License Names",
    description: "Names of certifications and licenses",
    module: "Workforce",
    subgroup: "Qualifications",
  },
  certification_type: {
    label: "Certification Types",
    description: "Types of professional certifications",
    module: "Workforce",
    subgroup: "Qualifications",
  },
  education_level: {
    label: "Education Levels",
    description: "Levels of educational attainment",
    module: "Workforce",
    subgroup: "Qualifications",
  },
  field_of_study: {
    label: "Fields of Study",
    description: "Academic and professional fields of study",
    module: "Workforce",
    subgroup: "Qualifications",
  },
  institution_name: {
    label: "Institution Names",
    description: "Names of educational institutions",
    module: "Workforce",
    subgroup: "Qualifications",
  },
  qualification_type: {
    label: "Qualification Types",
    description: "Types of qualifications (academic, professional, etc.)",
    module: "Workforce",
    subgroup: "Qualifications",
  },
};

// Get categories grouped by module with subgroups, sorted alphabetically
const getGroupedCategories = () => {
  const moduleMap: Record<string, { general: AllCategory[]; subgroups: Record<string, AllCategory[]> }> = {};
  
  Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
    if (!moduleMap[config.module]) {
      moduleMap[config.module] = { general: [], subgroups: {} };
    }
    if (config.subgroup) {
      if (!moduleMap[config.module].subgroups[config.subgroup]) {
        moduleMap[config.module].subgroups[config.subgroup] = [];
      }
      moduleMap[config.module].subgroups[config.subgroup].push(key as AllCategory);
    } else {
      moduleMap[config.module].general.push(key as AllCategory);
    }
  });
  
  // Sort within each group
  Object.keys(moduleMap).forEach(module => {
    moduleMap[module].general.sort((a, b) => CATEGORY_CONFIG[a].label.localeCompare(CATEGORY_CONFIG[b].label));
    // Sort subgroups: Immigration first, then others alphabetically
    Object.keys(moduleMap[module].subgroups).forEach(subgroup => {
      moduleMap[module].subgroups[subgroup].sort((a, b) => CATEGORY_CONFIG[a].label.localeCompare(CATEGORY_CONFIG[b].label));
    });
  });
  
  return Object.keys(moduleMap).sort().map(module => ({
    module,
    general: moduleMap[module].general,
    subgroups: ['Immigration', ...Object.keys(moduleMap[module].subgroups).filter(s => s !== 'Immigration').sort()].filter(name => moduleMap[module].subgroups[name]).map(name => ({
      name,
      categories: moduleMap[module].subgroups[name]
    }))
  }));
};

const groupedCategories = getGroupedCategories();

const isImmigrationCategory = (category: AllCategory): category is ImmigrationCategory => {
  return IMMIGRATION_CATEGORIES.includes(category as ImmigrationCategory);
};

const defaultLookupFormValues: LookupValueForm = {
  code: "",
  name: "",
  description: "",
  display_order: 0,
  is_default: false,
  is_active: true,
  start_date: getTodayString(),
  end_date: "",
};

const defaultImmigrationFormValues: ImmigrationCodeForm = {
  code: "",
  name: "",
  description: "",
  display_order: 0,
  is_active: true,
};

export function LookupValuesManagement() {
  const [activeCategory, setActiveCategory] = useState<AllCategory>("employee_status");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<LookupValue | ImmigrationCode | null>(null);
  const [lookupFormData, setLookupFormData] = useState<LookupValueForm>(defaultLookupFormValues);
  const [immigrationFormData, setImmigrationFormData] = useState<ImmigrationCodeForm>(defaultImmigrationFormValues);
  const queryClient = useQueryClient();
  const { logAction } = useAuditLog();

  const isImmigration = isImmigrationCategory(activeCategory);
  const config = CATEGORY_CONFIG[activeCategory];

  // Query for standard lookup values
  const { data: lookupValues, isLoading: isLoadingLookup } = useQuery({
    queryKey: ["lookup-values", activeCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookup_values")
        .select("*")
        .eq("category", activeCategory as any)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as LookupValue[];
    },
    enabled: !isImmigration,
  });

  // Query for immigration codes
  const { data: immigrationCodes, isLoading: isLoadingImmigration } = useQuery({
    queryKey: ["immigration-codes", activeCategory],
    queryFn: async () => {
      const tableName = config.tableName;
      if (!tableName) return [];
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as unknown as ImmigrationCode[];
    },
    enabled: isImmigration,
  });

  const isLoading = isImmigration ? isLoadingImmigration : isLoadingLookup;
  const currentData = isImmigration ? immigrationCodes : lookupValues;

  // Lookup value mutations
  const createLookupMutation = useMutation({
    mutationFn: async (values: LookupValueForm) => {
      const { data, error } = await supabase
        .from("lookup_values")
        .insert([{
          category: activeCategory as any,
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_default: values.is_default,
          is_active: values.is_active,
          start_date: values.start_date,
          end_date: values.end_date || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] });
      logAction({
        action: "CREATE",
        entityType: "lookup_value",
        entityId: data.id,
        entityName: data.name,
        newValues: data,
      });
      toast.success("Lookup value created successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateLookupMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: LookupValueForm }) => {
      const { data, error } = await supabase
        .from("lookup_values")
        .update({
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_default: values.is_default,
          is_active: values.is_active,
          start_date: values.start_date,
          end_date: values.end_date || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] });
      logAction({
        action: "UPDATE",
        entityType: "lookup_value",
        entityId: data.id,
        entityName: data.name,
        oldValues: editingValue as unknown as Record<string, unknown>,
        newValues: data as unknown as Record<string, unknown>,
      });
      toast.success("Lookup value updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteLookupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lookup_values")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] });
      const deleted = lookupValues?.find(v => v.id === id);
      logAction({
        action: "DELETE",
        entityType: "lookup_value",
        entityId: id,
        entityName: deleted?.name,
        oldValues: deleted as unknown as Record<string, unknown>,
      });
      toast.success("Lookup value deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Immigration code mutations
  const createImmigrationMutation = useMutation({
    mutationFn: async (values: ImmigrationCodeForm) => {
      const tableName = config.tableName;
      if (!tableName) throw new Error("Invalid table");
      
      const { data, error } = await supabase
        .from(tableName as any)
        .insert([{
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_active: values.is_active,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immigration-codes", activeCategory] });
      toast.success("Immigration code created successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateImmigrationMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ImmigrationCodeForm }) => {
      const tableName = config.tableName;
      if (!tableName) throw new Error("Invalid table");
      
      const { data, error } = await supabase
        .from(tableName as any)
        .update({
          code: values.code.toUpperCase().replace(/\s+/g, "_"),
          name: values.name,
          description: values.description || null,
          display_order: values.display_order,
          is_active: values.is_active,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immigration-codes", activeCategory] });
      toast.success("Immigration code updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteImmigrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const tableName = config.tableName;
      if (!tableName) throw new Error("Invalid table");
      
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immigration-codes", activeCategory] });
      toast.success("Immigration code deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleOpenDialog = (value?: LookupValue | ImmigrationCode) => {
    if (value) {
      setEditingValue(value);
      if (isImmigration) {
        const immValue = value as ImmigrationCode;
        setImmigrationFormData({
          code: immValue.code,
          name: immValue.name,
          description: immValue.description || "",
          display_order: immValue.display_order,
          is_active: immValue.is_active,
        });
      } else {
        const lookupValue = value as LookupValue;
        setLookupFormData({
          code: lookupValue.code,
          name: lookupValue.name,
          description: lookupValue.description || "",
          display_order: lookupValue.display_order,
          is_default: lookupValue.is_default,
          is_active: lookupValue.is_active,
          start_date: lookupValue.start_date,
          end_date: lookupValue.end_date || "",
        });
      }
    } else {
      setEditingValue(null);
      if (isImmigration) {
        setImmigrationFormData({
          ...defaultImmigrationFormValues,
          display_order: (immigrationCodes?.length || 0) + 1,
        });
      } else {
        setLookupFormData({
          ...defaultLookupFormValues,
          display_order: (lookupValues?.length || 0) + 1,
        });
      }
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingValue(null);
    setLookupFormData(defaultLookupFormValues);
    setImmigrationFormData(defaultImmigrationFormValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isImmigration) {
      if (!immigrationFormData.code || !immigrationFormData.name) {
        toast.error("Code and Name are required");
        return;
      }
      if (editingValue) {
        updateImmigrationMutation.mutate({ id: editingValue.id, values: immigrationFormData });
      } else {
        createImmigrationMutation.mutate(immigrationFormData);
      }
    } else {
      if (!lookupFormData.code || !lookupFormData.name) {
        toast.error("Code and Name are required");
        return;
      }
      if (editingValue) {
        updateLookupMutation.mutate({ id: editingValue.id, values: lookupFormData });
      } else {
        createLookupMutation.mutate(lookupFormData);
      }
    }
  };

  const handleDelete = (value: LookupValue | ImmigrationCode) => {
    if (confirm(`Are you sure you want to delete "${value.name}"?`)) {
      if (isImmigration) {
        deleteImmigrationMutation.mutate(value.id);
      } else {
        deleteLookupMutation.mutate(value.id);
      }
    }
  };

  const isValid = (value: LookupValue) => {
    const today = new Date();
    const startDate = parseLocalDate(value.start_date);
    const endDate = value.end_date ? parseLocalDate(value.end_date) : null;
    return value.is_active && startDate && startDate <= today && (!endDate || endDate >= today);
  };

  const isSaving = createLookupMutation.isPending || updateLookupMutation.isPending || 
                   createImmigrationMutation.isPending || updateImmigrationMutation.isPending;

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as AllCategory)}>
        <div className="space-y-4">
          {groupedCategories.map(({ module, general, subgroups }) => (
            <div key={module}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {module}
              </h4>
              <TabsList className="flex flex-wrap h-auto gap-1 items-center">
                {general.map((key) => (
                  <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                    {CATEGORY_CONFIG[key].label}
                  </TabsTrigger>
                ))}
                {subgroups.map(({ name, categories }) => (
                  <div key={`subgroup-${name}`} className="contents">
                    <span className="text-xs text-muted-foreground px-2 border-l border-border ml-1">
                      {name}:
                    </span>
                    {categories.map((key) => (
                      <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                        {CATEGORY_CONFIG[key].label}
                      </TabsTrigger>
                    ))}
                  </div>
                ))}
              </TabsList>
            </div>
          ))}
        </div>

        {Object.keys(CATEGORY_CONFIG).map((category) => {
          const catKey = category as AllCategory;
          const isImmCat = isImmigrationCategory(catKey);
          
          return (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{CATEGORY_CONFIG[catKey].label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {CATEGORY_CONFIG[catKey].description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isImmCat && (
                    <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                  )}
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isImmCat ? (
                // Immigration codes table (simpler structure)
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Order</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {immigrationCodes?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No values defined. Click "Add Value" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        immigrationCodes?.map((value) => (
                          <TableRow key={value.id} className={!value.is_active ? "opacity-50" : ""}>
                            <TableCell className="font-mono text-xs">{value.code}</TableCell>
                            <TableCell className="font-medium">{value.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {value.description || "-"}
                            </TableCell>
                            <TableCell className="text-center">{value.display_order}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={value.is_active ? "default" : "outline"}>
                                {value.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(value)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(value)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Standard lookup values table
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Order</TableHead>
                        <TableHead className="text-center">Default</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lookupValues?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No values defined. Click "Add Value" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        lookupValues?.map((value) => (
                          <TableRow key={value.id} className={!isValid(value) ? "opacity-50" : ""}>
                            <TableCell className="font-mono text-xs">{value.code}</TableCell>
                            <TableCell className="font-medium">{value.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {value.description || "-"}
                            </TableCell>
                            <TableCell className="text-center">{value.display_order}</TableCell>
                            <TableCell className="text-center">
                              {value.is_default && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              <div>{formatDateForDisplay(value.start_date)}</div>
                              {value.end_date && (
                                <div className="text-muted-foreground">
                                  to {formatDateForDisplay(value.end_date)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={isValid(value) ? "default" : "outline"}>
                                {isValid(value) ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(value)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(value)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Edit" : "Add"} {config.label.replace(/s$/, "")}
            </DialogTitle>
            <DialogDescription>
              {editingValue 
                ? "Update the details below"
                : `Add a new value to ${config.label}`
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={isImmigration ? immigrationFormData.code : lookupFormData.code}
                  onChange={(e) => isImmigration 
                    ? setImmigrationFormData({ ...immigrationFormData, code: e.target.value })
                    : setLookupFormData({ ...lookupFormData, code: e.target.value })
                  }
                  placeholder="UNIQUE_CODE"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={isImmigration ? immigrationFormData.display_order : lookupFormData.display_order}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    isImmigration 
                      ? setImmigrationFormData({ ...immigrationFormData, display_order: val })
                      : setLookupFormData({ ...lookupFormData, display_order: val });
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={isImmigration ? immigrationFormData.name : lookupFormData.name}
                onChange={(e) => isImmigration 
                  ? setImmigrationFormData({ ...immigrationFormData, name: e.target.value })
                  : setLookupFormData({ ...lookupFormData, name: e.target.value })
                }
                placeholder="Display Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={isImmigration ? immigrationFormData.description : lookupFormData.description}
                onChange={(e) => isImmigration 
                  ? setImmigrationFormData({ ...immigrationFormData, description: e.target.value })
                  : setLookupFormData({ ...lookupFormData, description: e.target.value })
                }
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            {!isImmigration && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={lookupFormData.start_date}
                    onChange={(e) => setLookupFormData({ ...lookupFormData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={lookupFormData.end_date}
                    onChange={(e) => setLookupFormData({ ...lookupFormData, end_date: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {!isImmigration && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={lookupFormData.is_default}
                    onCheckedChange={(checked) => setLookupFormData({ ...lookupFormData, is_default: checked })}
                  />
                  <Label htmlFor="is_default">Set as Default</Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={isImmigration ? immigrationFormData.is_active : lookupFormData.is_active}
                  onCheckedChange={(checked) => isImmigration 
                    ? setImmigrationFormData({ ...immigrationFormData, is_active: checked })
                    : setLookupFormData({ ...lookupFormData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingValue ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {!isImmigration && (
        <BulkLookupValuesUpload
          open={isBulkUploadOpen}
          onOpenChange={setIsBulkUploadOpen}
          category={activeCategory as LookupCategory}
          categoryLabel={config.label}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["lookup-values", activeCategory] })}
        />
      )}
    </div>
  );
}
