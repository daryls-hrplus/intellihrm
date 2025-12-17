import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString } from "@/utils/dateUtils";

export interface PropertyCategory {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  description: string | null;
  depreciation_years: number | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyItem {
  id: string;
  company_id: string;
  category_id: string;
  asset_tag: string;
  name: string;
  description: string | null;
  serial_number: string | null;
  model: string | null;
  manufacturer: string | null;
  purchase_date: string | null;
  purchase_cost: number | null;
  currency: string;
  warranty_expiry: string | null;
  condition: string;
  status: string;
  location: string | null;
  notes: string | null;
  specifications: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: PropertyCategory;
}

export interface PropertyAssignment {
  id: string;
  property_id: string;
  employee_id: string;
  assigned_by: string | null;
  assigned_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  condition_at_assignment: string | null;
  condition_at_return: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  property?: PropertyItem;
  employee?: { id: string; full_name: string; email: string };
  assigned_by_user?: { id: string; full_name: string };
}

export interface PropertyRequest {
  id: string;
  company_id: string;
  employee_id: string;
  category_id: string | null;
  request_type: string;
  priority: string;
  title: string;
  description: string | null;
  justification: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  fulfilled_property_id: string | null;
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; email: string };
  category?: PropertyCategory;
}

export interface PropertyMaintenance {
  id: string;
  property_id: string;
  maintenance_type: string;
  title: string;
  description: string | null;
  vendor: string | null;
  cost: number | null;
  currency: string;
  scheduled_date: string | null;
  completed_date: string | null;
  status: string;
  performed_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  property?: PropertyItem;
}

export const usePropertyManagement = (companyId?: string) => {
  const queryClient = useQueryClient();

  // Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["property-categories", companyId],
    queryFn: async () => {
      let query = supabase
        .from("property_categories")
        .select("*")
        .order("name");
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyCategory[];
    },
  });

  // Items
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["property-items", companyId],
    queryFn: async () => {
      let query = supabase
        .from("property_items")
        .select("*, category:property_categories(*)")
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyItem[];
    },
  });

  // Assignments
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ["property-assignments", companyId],
    queryFn: async () => {
      let query = supabase
        .from("property_assignments")
        .select(`
          *,
          property:property_items(*, category:property_categories(*)),
          employee:profiles!property_assignments_employee_id_fkey(id, full_name, email),
          assigned_by_user:profiles!property_assignments_assigned_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("property.company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyAssignment[];
    },
  });

  // Requests
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["property-requests", companyId],
    queryFn: async () => {
      let query = supabase
        .from("property_requests")
        .select(`
          *,
          employee:profiles!property_requests_employee_id_fkey(id, full_name, email),
          category:property_categories(*)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyRequest[];
    },
  });

  // Maintenance
  const { data: maintenance = [], isLoading: loadingMaintenance } = useQuery({
    queryKey: ["property-maintenance", companyId],
    queryFn: async () => {
      let query = supabase
        .from("property_maintenance")
        .select("*, property:property_items(*)")
        .order("created_at", { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyMaintenance[];
    },
  });

  // Create Category
  const createCategory = useMutation({
    mutationFn: async (category: {
      company_id?: string | null;
      name: string;
      code: string;
      description?: string | null;
      depreciation_years?: number | null;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("property_categories")
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create category");
      console.error(error);
    },
  });

  // Create Item
  const createItem = useMutation({
    mutationFn: async (item: {
      company_id: string;
      category_id: string;
      asset_tag: string;
      name: string;
      description?: string | null;
      serial_number?: string | null;
      model?: string | null;
      manufacturer?: string | null;
      purchase_date?: string | null;
      purchase_cost?: number | null;
      currency?: string;
      warranty_expiry?: string | null;
      condition?: string;
      status?: string;
      location?: string | null;
      notes?: string | null;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("property_items")
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-items"] });
      toast.success("Property item created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create property item");
      console.error(error);
    },
  });

  // Update Item
  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; condition?: string; location?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("property_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-items"] });
      toast.success("Property item updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update property item");
      console.error(error);
    },
  });

  // Create Assignment
  const createAssignment = useMutation({
    mutationFn: async (assignment: {
      property_id: string;
      employee_id: string;
      assigned_by?: string | null;
      assigned_date?: string;
      expected_return_date?: string | null;
      condition_at_assignment?: string | null;
      notes?: string | null;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("property_assignments")
        .insert([assignment])
        .select()
        .single();
      if (error) throw error;
      
      // Update item status to assigned
      await supabase
        .from("property_items")
        .update({ status: "assigned" })
        .eq("id", assignment.property_id);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["property-items"] });
      toast.success("Property assigned successfully");
    },
    onError: (error) => {
      toast.error("Failed to assign property");
      console.error(error);
    },
  });

  // Return Assignment
  const returnAssignment = useMutation({
    mutationFn: async ({ id, condition_at_return, notes }: { id: string; condition_at_return: string; notes?: string }) => {
      const { data: assignment, error: fetchError } = await supabase
        .from("property_assignments")
        .select("property_id")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("property_assignments")
        .update({
          status: "returned",
          actual_return_date: getTodayString(),
          condition_at_return,
          notes,
        })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update item status to available
      await supabase
        .from("property_items")
        .update({ status: "available", condition: condition_at_return })
        .eq("id", assignment.property_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["property-items"] });
      toast.success("Property returned successfully");
    },
    onError: (error) => {
      toast.error("Failed to return property");
      console.error(error);
    },
  });

  // Create Request
  const createRequest = useMutation({
    mutationFn: async (request: {
      company_id: string;
      employee_id: string;
      category_id?: string | null;
      request_type?: string;
      priority?: string;
      title: string;
      description?: string | null;
      justification?: string | null;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("property_requests")
        .insert([request])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-requests"] });
      toast.success("Request submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit request");
      console.error(error);
    },
  });

  // Update Request
  const updateRequest = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; reviewed_by?: string; reviewed_at?: string; review_notes?: string | null }) => {
      const { data, error } = await supabase
        .from("property_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-requests"] });
      toast.success("Request updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update request");
      console.error(error);
    },
  });

  // Create Maintenance
  const createMaintenance = useMutation({
    mutationFn: async (record: {
      property_id: string;
      maintenance_type?: string;
      title: string;
      description?: string | null;
      vendor?: string | null;
      cost?: number | null;
      currency?: string;
      scheduled_date?: string | null;
      performed_by?: string | null;
      notes?: string | null;
      status?: string;
      created_by?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("property_maintenance")
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-maintenance"] });
      toast.success("Maintenance record created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create maintenance record");
      console.error(error);
    },
  });

  // Update Maintenance
  const updateMaintenance = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; completed_date?: string }) => {
      const { data, error } = await supabase
        .from("property_maintenance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-maintenance"] });
      toast.success("Maintenance record updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update maintenance record");
      console.error(error);
    },
  });

  return {
    categories,
    items,
    assignments,
    requests,
    maintenance,
    loadingCategories,
    loadingItems,
    loadingAssignments,
    loadingRequests,
    loadingMaintenance,
    createCategory,
    createItem,
    updateItem,
    createAssignment,
    returnAssignment,
    createRequest,
    updateRequest,
    createMaintenance,
    updateMaintenance,
  };
};
