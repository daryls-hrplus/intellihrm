import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnablementBranding } from "./useEnablementBranding";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface PrintLayoutConfig {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
}

export interface PrintSectionsConfig {
  includeCover: boolean;
  includeTableOfContents: boolean;
  includeHeaders: boolean;
  includeFooters: boolean;
  includePageNumbers: boolean;
  headerContent: string;
  footerContent: string;
  tocDepth: 1 | 2 | 3;
  pageNumberPosition: 'left' | 'center' | 'right';
  pageNumberFormat: 'simple' | 'pageOf' | 'pageOfTotal';
}

export interface PrintFormattingConfig {
  fontFamily: string;
  baseFontSize: number;
  headingFontSize: number;
  lineHeight: number;
}

export interface PrintBrandingConfig {
  applyBrandColors: boolean;
  coverStyle: 'branded' | 'minimal' | 'corporate';
  headerStyle: 'branded' | 'simple' | 'none';
}

export interface ManualPrintSettings {
  id?: string;
  layout: PrintLayoutConfig;
  sections: PrintSectionsConfig;
  formatting: PrintFormattingConfig;
  branding: PrintBrandingConfig;
}

const DEFAULT_PRINT_SETTINGS: ManualPrintSettings = {
  layout: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 25, bottom: 25, left: 20, right: 20 }
  },
  sections: {
    includeCover: true,
    includeTableOfContents: true,
    includeHeaders: true,
    includeFooters: true,
    includePageNumbers: true,
    headerContent: 'Appraisals Administrator Manual',
    footerContent: 'Confidential - Internal Use Only',
    tocDepth: 2,
    pageNumberPosition: 'right',
    pageNumberFormat: 'pageOfTotal'
  },
  formatting: {
    fontFamily: 'Inter',
    baseFontSize: 11,
    headingFontSize: 16,
    lineHeight: 1.5
  },
  branding: {
    applyBrandColors: true,
    coverStyle: 'branded',
    headerStyle: 'branded'
  }
};

// Helper to safely parse JSON config
const parseConfig = <T>(config: Json | null, fallback: T): T => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return fallback;
  }
  return config as unknown as T;
};

export const useManualPrintSettings = (manualType: string = 'Appraisals Admin Manual') => {
  const queryClient = useQueryClient();
  const { brandColors, isLoading: isBrandLoading } = useEnablementBranding();

  const settingsName = `${manualType} Print Settings`;

  const { data: printSettings, isLoading } = useQuery({
    queryKey: ["manual-print-settings", manualType],
    queryFn: async (): Promise<ManualPrintSettings> => {
      const { data, error } = await supabase
        .from("enablement_document_templates")
        .select("id, layout_config, sections_config, formatting_config, branding_config")
        .eq("name", settingsName)
        .eq("category", "custom")
        .maybeSingle();

      if (error) {
        console.error("Error fetching print settings:", error);
        return DEFAULT_PRINT_SETTINGS;
      }

      if (data) {
        return {
          id: data.id,
          layout: parseConfig(data.layout_config, DEFAULT_PRINT_SETTINGS.layout),
          sections: parseConfig(data.sections_config, DEFAULT_PRINT_SETTINGS.sections),
          formatting: parseConfig(data.formatting_config, DEFAULT_PRINT_SETTINGS.formatting),
          branding: parseConfig(data.branding_config, DEFAULT_PRINT_SETTINGS.branding)
        };
      }

      return DEFAULT_PRINT_SETTINGS;
    }
  });

  const savePrintSettings = useMutation({
    mutationFn: async (settings: ManualPrintSettings) => {
      const { data: existing } = await supabase
        .from("enablement_document_templates")
        .select("id")
        .eq("name", settingsName)
        .eq("category", "custom")
        .maybeSingle();

      const layoutJson = settings.layout as unknown as Json;
      const sectionsJson = settings.sections as unknown as Json;
      const formattingJson = settings.formatting as unknown as Json;
      const brandingJson = settings.branding as unknown as Json;

      if (existing) {
        const { error } = await supabase
          .from("enablement_document_templates")
          .update({
            layout_config: layoutJson,
            sections_config: sectionsJson,
            formatting_config: formattingJson,
            branding_config: brandingJson,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("enablement_document_templates")
          .insert([{
            name: settingsName,
            category: "custom" as const,
            description: `Print configuration for the ${manualType}`,
            layout_config: layoutJson,
            sections_config: sectionsJson,
            formatting_config: formattingJson,
            branding_config: brandingJson,
            is_active: true
          }]);

        if (error) throw error;
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-print-settings", manualType] });
      toast.success("Print settings saved successfully");
    },
    onError: (error) => {
      console.error("Error saving print settings:", error);
      toast.error("Failed to save print settings");
    }
  });

  return {
    printSettings: printSettings || DEFAULT_PRINT_SETTINGS,
    brandColors,
    isLoading: isLoading || isBrandLoading,
    savePrintSettings,
    DEFAULT_PRINT_SETTINGS
  };
};
