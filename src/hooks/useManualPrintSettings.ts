import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnablementBranding } from "./useEnablementBranding";
import { useAuth } from "@/contexts/AuthContext";
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
  // Document metadata
  documentId: string;
  effectiveDate: string;
  showVersionInHeader: boolean;
  showPrintDate: boolean;
  showLastUpdated: boolean;
  copyrightText: string;
  // Section formatting
  chapterStartsNewPage: boolean;
  includeSectionDividers: boolean;
  // Revision history
  includeRevisionHistory: boolean;
  // Alternating headers
  useAlternatingHeaders: boolean;
  alternateHeaderLeft: string;
  alternateHeaderRight: string;
}

export interface PrintFormattingConfig {
  fontFamily: 'Inter' | 'Arial' | 'Times New Roman' | 'Georgia';
  baseFontSize: number;
  headingFontSize: number;
  lineHeight: number;
  headingFontFamily: 'inherit' | 'Georgia' | 'Arial';
  showBulletColors: boolean;
  calloutStyle: 'boxed' | 'bordered' | 'highlighted';
}

export interface PrintBrandingConfig {
  applyBrandColors: boolean;
  coverStyle: 'branded' | 'minimal' | 'corporate';
  headerStyle: 'branded' | 'simple' | 'none';
  footerStyle: 'branded' | 'simple';
  // Watermark
  watermarkText: string;
  watermarkOpacity: number;
  // Accents
  showBottomBorderAccent: boolean;
  showHeaderAccentLine: boolean;
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
    headerContent: 'Performance Appraisal - Administrator Guide',
    footerContent: 'Confidential - Internal Use Only',
    tocDepth: 2,
    pageNumberPosition: 'right',
    pageNumberFormat: 'pageOfTotal',
    // Document metadata
    documentId: '',
    effectiveDate: '',
    showVersionInHeader: true,
    showPrintDate: true,
    showLastUpdated: true,
    copyrightText: '',
    // Section formatting
    chapterStartsNewPage: true,
    includeSectionDividers: true,
    // Revision history
    includeRevisionHistory: false,
    // Alternating headers
    useAlternatingHeaders: false,
    alternateHeaderLeft: '',
    alternateHeaderRight: ''
  },
  formatting: {
    fontFamily: 'Inter',
    baseFontSize: 11,
    headingFontSize: 16,
    lineHeight: 1.5,
    headingFontFamily: 'inherit',
    showBulletColors: true,
    calloutStyle: 'boxed'
  },
  branding: {
    applyBrandColors: true,
    coverStyle: 'branded',
    headerStyle: 'branded',
    footerStyle: 'simple',
    watermarkText: '',
    watermarkOpacity: 0.08,
    showBottomBorderAccent: false,
    showHeaderAccentLine: true
  }
};

// Helper to safely parse JSON config
const parseConfig = <T>(config: Json | null, fallback: T): T => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return fallback;
  }
  return { ...fallback, ...config as unknown as T };
};

export const useManualPrintSettings = (manualType: string = 'Appraisals Admin Manual') => {
  const queryClient = useQueryClient();
  const { brandColors, isLoading: isBrandLoading } = useEnablementBranding();
  const { user, profile } = useAuth();
  const companyId = profile?.company_id ?? null;

  const settingsName = `${manualType} Print Settings`;
  const queryKey = ["manual-print-settings", manualType, companyId];

  const { data: printSettings, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<ManualPrintSettings> => {
      if (!companyId) return DEFAULT_PRINT_SETTINGS;

      const { data, error } = await supabase
        .from("enablement_document_templates")
        .select("id, layout_config, sections_config, formatting_config, branding_config")
        .eq("name", settingsName)
        .eq("category", "custom")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(1)
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
          branding: parseConfig(data.branding_config, DEFAULT_PRINT_SETTINGS.branding),
        };
      }

      return DEFAULT_PRINT_SETTINGS;
    },
  });

  const savePrintSettings = useMutation({
    mutationFn: async (settings: ManualPrintSettings) => {
      if (!companyId || !user) {
        throw new Error("No company context available to save print settings.");
      }

      const { data: existing } = await supabase
        .from("enablement_document_templates")
        .select("id")
        .eq("name", settingsName)
        .eq("category", "custom")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(1)
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
            company_id: companyId,
            created_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("enablement_document_templates").insert([
          {
            name: settingsName,
            category: "custom" as const,
            description: `Print configuration for the ${manualType}`,
            layout_config: layoutJson,
            sections_config: sectionsJson,
            formatting_config: formattingJson,
            branding_config: brandingJson,
            is_active: true,
            company_id: companyId,
            created_by: user.id,
          },
        ]);

        if (error) throw error;
      }

      return settings;
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey });

      const previousSettings = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, newSettings);

      return { previousSettings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Print settings saved successfully");
    },
    onError: (error, _newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKey, context.previousSettings);
      }
      console.error("Error saving print settings:", error);
      toast.error("Failed to save print settings");
    },
  });

  return {
    printSettings: printSettings || DEFAULT_PRINT_SETTINGS,
    brandColors,
    isLoading: isLoading || isBrandLoading,
    savePrintSettings,
    DEFAULT_PRINT_SETTINGS
  };
};
