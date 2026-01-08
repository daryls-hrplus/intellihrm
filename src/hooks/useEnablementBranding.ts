import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface BrandColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
  logoUrl?: string;
}

const DEFAULT_BRAND_COLORS: BrandColors = {
  primaryColor: "#2F7AC3", // Intelli HRM Moderate Azure
  secondaryColor: "#0C4277", // Intelli HRM Dark Azure
  accentColor: "#17A584", // Teal (unique differentiator)
  companyName: "Intelli HRM",
  logoUrl: undefined,
};

export const useEnablementBranding = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const companyId = profile?.company_id ?? null;

  // Fetch saved brand colors from enablement_document_templates (company-scoped)
  const { data: brandColors, isLoading } = useQuery({
    queryKey: ["enablement-brand-colors", companyId],
    queryFn: async () => {
      if (!companyId) return DEFAULT_BRAND_COLORS;

      const { data, error } = await supabase
        .from("enablement_document_templates")
        .select("branding_config")
        .eq("name", "Default Brand Colors")
        .eq("category", "custom")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(1)
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
          companyName: (config.companyName as string) || DEFAULT_BRAND_COLORS.companyName,
          logoUrl: (config.logoUrl as string) || undefined,
        };
      }

      return DEFAULT_BRAND_COLORS;
    },
  });

  // Save brand colors (company-scoped)
  const saveBrandColors = useMutation({
    mutationFn: async (colors: BrandColors) => {
      if (!companyId || !user) {
        throw new Error("No company context available to save branding.");
      }

      const brandingJson = {
        primaryColor: colors.primaryColor,
        secondaryColor: colors.secondaryColor,
        accentColor: colors.accentColor,
        companyName: colors.companyName,
        logoUrl: colors.logoUrl || null,
      };

      const { data: existing } = await supabase
        .from("enablement_document_templates")
        .select("id")
        .eq("name", "Default Brand Colors")
        .eq("category", "custom")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("enablement_document_templates")
          .update({
            branding_config: brandingJson,
            company_id: companyId,
            created_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("enablement_document_templates").insert([
          {
            name: "Default Brand Colors",
            category: "custom",
            description: "Default brand colors for all enablement templates",
            branding_config: brandingJson,
            is_active: true,
            company_id: companyId,
            created_by: user.id,
          },
        ]);

        if (error) throw error;
      }

      return colors;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-brand-colors", companyId] });
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
    DEFAULT_BRAND_COLORS,
  };
};
