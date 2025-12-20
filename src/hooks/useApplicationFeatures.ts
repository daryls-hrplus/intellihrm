import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ApplicationModule {
  id: string;
  module_code: string;
  module_name: string;
  description: string | null;
  icon_name: string | null;
  route_path: string;
  display_order: number | null;
  is_active: boolean | null;
  role_requirements: string[] | null;
  parent_module_code: string | null;
}

export interface ApplicationFeature {
  id: string;
  module_id: string;
  feature_code: string;
  feature_name: string;
  description: string | null;
  route_path: string | null;
  display_order: number | null;
  is_active: boolean | null;
  role_requirements: string[] | null;
  workflow_steps: any | null;
  ui_elements: any | null;
}

export function useApplicationModules() {
  const [modules, setModules] = useState<ApplicationModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("application_modules")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("Failed to load modules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, isLoading, refetch: fetchModules };
}

export function useApplicationFeatures(moduleId?: string) {
  const [features, setFeatures] = useState<ApplicationFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("application_features")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (moduleId) {
        query = query.eq("module_id", moduleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error("Error fetching features:", error);
      toast.error("Failed to load features");
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return { features, isLoading, refetch: fetchFeatures };
}

export function useModulesWithFeatures() {
  const [data, setData] = useState<(ApplicationModule & { features: ApplicationFeature[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: modules, error: modulesError } = await supabase
        .from("application_modules")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (modulesError) throw modulesError;

      const { data: features, error: featuresError } = await supabase
        .from("application_features")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (featuresError) throw featuresError;

      const modulesWithFeatures = (modules || []).map(module => ({
        ...module,
        features: (features || []).filter(f => f.module_id === module.id)
      }));

      setData(modulesWithFeatures);
    } catch (error) {
      console.error("Error fetching modules with features:", error);
      toast.error("Failed to load feature data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
}
