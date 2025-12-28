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

// Convert hex color to HSL string
export const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Derive a full color palette from 3 core colors
export const deriveFullPalette = (
  primaryHex: string,
  secondaryHex: string,
  accentHex: string
): Record<string, string> => {
  const primary = hexToHsl(primaryHex);
  const secondary = hexToHsl(secondaryHex);
  const accent = hexToHsl(accentHex);

  // Parse HSL values
  const parseHsl = (hsl: string) => {
    const parts = hsl.split(" ").map(p => parseFloat(p.replace("%", "")));
    return { h: parts[0], s: parts[1], l: parts[2] };
  };

  const primaryParsed = parseHsl(primary);
  const secondaryParsed = parseHsl(secondary);
  const accentParsed = parseHsl(accent);

  // Generate lighter/darker variants
  const lighten = (hsl: { h: number; s: number; l: number }, amount: number) =>
    `${hsl.h} ${Math.max(0, hsl.s - amount * 0.3)}% ${Math.min(98, hsl.l + amount)}%`;
  
  const darken = (hsl: { h: number; s: number; l: number }, amount: number) =>
    `${hsl.h} ${Math.min(100, hsl.s + amount * 0.2)}% ${Math.max(5, hsl.l - amount)}%`;

  // Determine if color is light or dark for foreground calculation
  const needsLightForeground = (l: number) => l < 55;

  return {
    // Base colors - derived from secondary (sidebar color becomes base)
    background: `${secondaryParsed.h} 20% 98%`,
    foreground: `${secondaryParsed.h} 47% 11%`,
    card: "0 0% 100%",
    "card-foreground": `${secondaryParsed.h} 47% 11%`,
    popover: "0 0% 100%",
    "popover-foreground": `${secondaryParsed.h} 47% 11%`,
    
    // Primary brand color
    primary,
    "primary-foreground": needsLightForeground(primaryParsed.l) ? "0 0% 100%" : "0 0% 0%",
    
    // Secondary - light version for backgrounds
    secondary: lighten(primaryParsed, 45),
    "secondary-foreground": `${secondaryParsed.h} 47% 11%`,
    
    // Muted
    muted: `${primaryParsed.h} 20% 94%`,
    "muted-foreground": `${primaryParsed.h} 16% 47%`,
    
    // Accent - light version
    accent: lighten(accentParsed, 50),
    "accent-foreground": darken(accentParsed, 15),
    
    // Status colors - keep standard but adjust
    destructive: "0 84% 60%",
    "destructive-foreground": "0 0% 100%",
    success: accent, // Use accent as success
    "success-foreground": needsLightForeground(accentParsed.l) ? "0 0% 100%" : "0 0% 0%",
    warning: "38 92% 50%",
    "warning-foreground": "0 0% 100%",
    info: `${primaryParsed.h} 89% 48%`,
    "info-foreground": "0 0% 100%",
    
    // Form elements
    border: `${primaryParsed.h} 32% 91%`,
    input: `${primaryParsed.h} 32% 91%`,
    ring: primary,
    
    // Sidebar - uses secondary (darker) color
    "sidebar-background": secondary,
    "sidebar-foreground": `${secondaryParsed.h} 40% 98%`,
    "sidebar-primary": lighten(primaryParsed, 8),
    "sidebar-primary-foreground": "0 0% 100%",
    "sidebar-accent": lighten(secondaryParsed, 6),
    "sidebar-accent-foreground": `${secondaryParsed.h} 40% 98%`,
    "sidebar-border": lighten(secondaryParsed, 9),
    "sidebar-ring": lighten(primaryParsed, 8),
  };
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
