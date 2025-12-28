import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ColorScheme {
  id: string;
  company_id: string | null;
  name: string;
  is_active: boolean;
  colors: Record<string, string>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const DEFAULT_COLORS = {
  // Light mode - HRplus Brand Colors
  background: "210 20% 98%",
  foreground: "222 47% 11%",
  card: "0 0% 100%",
  "card-foreground": "222 47% 11%",
  popover: "0 0% 100%",
  "popover-foreground": "222 47% 11%",
  // HRplus Moderate Azure (#2F7AC3)
  primary: "210 61% 47%",
  "primary-foreground": "0 0% 100%",
  secondary: "210 30% 95%",
  "secondary-foreground": "222 47% 11%",
  muted: "210 20% 94%",
  "muted-foreground": "210 16% 47%",
  // Light azure accent
  accent: "210 61% 94%",
  "accent-foreground": "210 61% 35%",
  destructive: "0 84% 60%",
  "destructive-foreground": "0 0% 100%",
  // Teal repurposed as success (unique differentiator)
  success: "168 76% 36%",
  "success-foreground": "0 0% 100%",
  warning: "38 92% 50%",
  "warning-foreground": "0 0% 100%",
  info: "199 89% 48%",
  "info-foreground": "0 0% 100%",
  border: "210 32% 91%",
  input: "210 32% 91%",
  ring: "210 61% 47%",
  // Sidebar - HRplus Dark Azure (#0C4277)
  "sidebar-background": "211 81% 26%",
  "sidebar-foreground": "210 40% 98%",
  "sidebar-primary": "210 61% 55%",
  "sidebar-primary-foreground": "0 0% 100%",
  "sidebar-accent": "211 81% 32%",
  "sidebar-accent-foreground": "210 40% 98%",
  "sidebar-border": "211 81% 35%",
  "sidebar-ring": "210 61% 55%",
};

export const useColorScheme = () => {
  const queryClient = useQueryClient();

  // Fetch active color scheme
  const { data: activeScheme, isLoading } = useQuery({
    queryKey: ["color-scheme-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("color_schemes")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as ColorScheme | null;
    },
  });

  // Fetch all color schemes
  const { data: schemes } = useQuery({
    queryKey: ["color-schemes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("color_schemes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ColorScheme[];
    },
  });

  // Save color scheme
  const saveScheme = useMutation({
    mutationFn: async (colors: Record<string, string>) => {
      // Deactivate all existing schemes first
      await supabase
        .from("color_schemes")
        .update({ is_active: false })
        .eq("is_active", true);

      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("color_schemes")
        .insert([{
          name: "Custom Theme",
          colors,
          is_active: true,
          created_by: userData.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-scheme-active"] });
      queryClient.invalidateQueries({ queryKey: ["color-schemes"] });
      toast.success("Color scheme saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save color scheme");
      console.error(error);
    },
  });

  // Reset to default colors
  const resetToDefault = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("color_schemes")
        .update({ is_active: false })
        .eq("is_active", true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-scheme-active"] });
      queryClient.invalidateQueries({ queryKey: ["color-schemes"] });
      applyColors(DEFAULT_COLORS);
      toast.success("Reset to default colors");
    },
    onError: (error) => {
      toast.error("Failed to reset colors");
      console.error(error);
    },
  });

  return {
    activeScheme,
    schemes,
    isLoading,
    saveScheme,
    resetToDefault,
  };
};

// Apply colors to CSS variables
export const applyColors = (colors: Record<string, string>) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};

// Initialize colors on app load
export const initializeColorScheme = async () => {
  const { data } = await supabase
    .from("color_schemes")
    .select("colors")
    .eq("is_active", true)
    .maybeSingle();

  if (data?.colors) {
    applyColors(data.colors as Record<string, string>);
  }
};
