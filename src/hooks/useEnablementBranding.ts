import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface BrandColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
}

const DEFAULT_BRAND_COLORS: BrandColors = {
  primaryColor: "#2F7AC3",    // HRplus Moderate Azure
  secondaryColor: "#0C4277",  // HRplus Dark Azure
  accentColor: "#17A584",     // Teal (unique differentiator)
  companyName: "HRplus Cerebra"
};

export const useEnablementBranding = () => {
  const queryClient = useQueryClient();

  // Fetch saved brand colors from enablement_document_templates
  const { data: brandColors, isLoading } = useQuery({
    queryKey: ["enablement-brand-colors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_document_templates")
        .select("branding_config")
        .eq("name", "Default Brand Colors")
        .eq("category", "custom")
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching brand colors:", error);
        return DEFAULT_BRAND_COLORS;
      }
      
      if (data?.branding_config) {
        const config = data.branding_config as Record<string, unknown>;
        return {
          primaryColor: (config.primaryColor as string) || DEFAULT_BRAND_COLORS.primaryColor,
          secondaryColor: (config.secondaryColor as string) || DEFAULT_BRAND_COLORS.secondaryColor,
          accentColor: (config.accentColor as string) || DEFAULT_BRAND_COLORS.accentColor,
          companyName: (config.companyName as string) || DEFAULT_BRAND_COLORS.companyName
        };
      }
      
      return DEFAULT_BRAND_COLORS;
    },
  });

  // Save brand colors
  const saveBrandColors = useMutation({
    mutationFn: async (colors: BrandColors) => {
      const brandingJson = {
        primaryColor: colors.primaryColor,
        secondaryColor: colors.secondaryColor,
        accentColor: colors.accentColor,
        companyName: colors.companyName
      };
      
      // Check if record exists
      const { data: existing } = await supabase
        .from("enablement_document_templates")
        .select("id")
        .eq("name", "Default Brand Colors")
        .eq("category", "custom")
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("enablement_document_templates")
          .update({ 
            branding_config: brandingJson,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("enablement_document_templates")
          .insert([{
            name: "Default Brand Colors",
            category: "custom",
            description: "Default brand colors for all enablement templates",
            branding_config: brandingJson,
            is_active: true
          }]);
        
        if (error) throw error;
      }
      
      return colors;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-brand-colors"] });
      toast.success("Brand colors saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save brand colors");
      console.error(error);
    },
  });

  return {
    brandColors: brandColors || DEFAULT_BRAND_COLORS,
    isLoading,
    saveBrandColors,
    DEFAULT_BRAND_COLORS
  };
};
