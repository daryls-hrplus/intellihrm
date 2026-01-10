import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnablementBranding } from "./useEnablementBranding";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export type DocumentClassification = 'draft' | 'confidential' | 'internal' | 'customer' | 'sample';
export type DocumentStatus = 'draft' | 'review' | 'released';
export type WatermarkType = 'none' | 'classification' | 'logo' | 'custom' | 'date-based';

export interface RevisionHistoryEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
}

export interface ProductCapabilitiesPrintLayout {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
}

export interface ProductCapabilitiesPrintDocument {
  // Classification & Control
  classification: DocumentClassification;
  status: DocumentStatus;
  documentId: string;
  effectiveDate: string;
  reviewDate: string;
  owner: string;
  approver: string;
  distribution: string[];
  revisions: RevisionHistoryEntry[];
  
  // Cover options
  title: string;
  subtitle: string;
  version: string;
  coverStyle: 'branded' | 'minimal' | 'corporate';
  includeCover: boolean;
  
  // Legal/Disclaimer
  includeLegalPage: boolean;
  copyrightHolder: string;
  copyrightYear: string;
  disclaimerText: string;
  forwardLookingText: string;
  
  // Document control page
  includeDocumentControl: boolean;
}

export interface ProductCapabilitiesPrintHeaders {
  includeHeaders: boolean;
  headerStyle: 'branded' | 'simple' | 'none';
  headerContent: string;
  showLogo: boolean;
  showVersionInHeader: boolean;
  showSectionName: boolean;
  
  // Alternating headers
  useAlternatingHeaders: boolean;
  oddPageHeader: string;
  evenPageHeader: string;
  
  // Footers
  includeFooters: boolean;
  footerStyle: 'branded' | 'simple';
  footerContent: string;
  showDocumentId: boolean;
  showPrintDate: boolean;
  showCopyright: boolean;
  
  // Page numbers
  includePageNumbers: boolean;
  pageNumberPosition: 'left' | 'center' | 'right';
  pageNumberFormat: 'simple' | 'pageOf' | 'pageOfTotal';
  
  // Accent lines
  showHeaderAccentLine: boolean;
  showFooterAccentLine: boolean;
}

export interface ProductCapabilitiesPrintSections {
  // Front matter
  includeTableOfContents: boolean;
  tocDepth: 1 | 2 | 3;
  
  // Content structure
  includeExecutiveOverview: boolean;
  includePlatformAtGlance: boolean;
  includeModuleIntegration: boolean;
  includeActDividers: boolean;
  includeModuleDetails: boolean;
  includeCrossCutting: boolean;
  includeDependencyAnalysis: boolean;
  includeGettingStarted: boolean;
  
  // Back matter
  includeModuleIndex: boolean;
  includeGlossary: boolean;
  includeQuickReference: boolean;
  
  // Formatting
  chapterStartsNewPage: boolean;
  moduleStartsNewPage: boolean;
}

export interface ProductCapabilitiesPrintBranding {
  applyBrandColors: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  
  // Watermark
  watermarkType: WatermarkType;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkExpiryDate: string;
  
  // Act colors
  useActColors: boolean;
}

export interface ProductCapabilitiesPrintSettings {
  id?: string;
  layout: ProductCapabilitiesPrintLayout;
  document: ProductCapabilitiesPrintDocument;
  headers: ProductCapabilitiesPrintHeaders;
  sections: ProductCapabilitiesPrintSections;
  branding: ProductCapabilitiesPrintBranding;
}

export const CLASSIFICATION_WATERMARKS: Record<DocumentClassification, { text: string; opacity: number; footerText: string }> = {
  draft: { text: 'DRAFT', opacity: 0.15, footerText: 'DRAFT - Not for Distribution' },
  confidential: { text: 'CONFIDENTIAL', opacity: 0.08, footerText: 'Confidential - Authorized Use Only' },
  internal: { text: 'INTERNAL USE ONLY', opacity: 0.08, footerText: 'Internal Use Only' },
  customer: { text: '', opacity: 0, footerText: '' },
  sample: { text: 'SAMPLE', opacity: 0.12, footerText: 'Sample Documentation' },
};

export const DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS: ProductCapabilitiesPrintSettings = {
  layout: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 25, bottom: 25, left: 20, right: 20 }
  },
  document: {
    classification: 'internal',
    status: 'released',
    documentId: 'IHRM-CAP-2026-001',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: '',
    owner: 'Product Management',
    approver: '',
    distribution: ['Sales', 'Partners', 'Implementation'],
    revisions: [
      { version: '1.0.0', date: new Date().toISOString().split('T')[0], author: 'Product Team', changes: 'Initial release' }
    ],
    title: 'Intelli HRM Product Capabilities',
    subtitle: 'AI-First Human Resource Management System',
    version: '1.0.0',
    coverStyle: 'branded',
    includeCover: true,
    includeLegalPage: true,
    copyrightHolder: '',
    copyrightYear: new Date().getFullYear().toString(),
    disclaimerText: 'The information in this document is subject to change without notice. No warranty is made regarding the accuracy of this information.',
    forwardLookingText: 'This document may contain statements about future functionality. Such statements are not guarantees and actual results may vary.',
    includeDocumentControl: true,
  },
  headers: {
    includeHeaders: true,
    headerStyle: 'branded',
    headerContent: 'Intelli HRM Product Capabilities',
    showLogo: true,
    showVersionInHeader: true,
    showSectionName: true,
    useAlternatingHeaders: true,
    oddPageHeader: '',
    evenPageHeader: '',
    includeFooters: true,
    footerStyle: 'simple',
    footerContent: 'Confidential - Internal Use Only',
    showDocumentId: true,
    showPrintDate: true,
    showCopyright: true,
    includePageNumbers: true,
    pageNumberPosition: 'right',
    pageNumberFormat: 'pageOfTotal',
    showHeaderAccentLine: true,
    showFooterAccentLine: true,
  },
  sections: {
    includeTableOfContents: true,
    tocDepth: 2,
    includeExecutiveOverview: true,
    includePlatformAtGlance: true,
    includeModuleIntegration: true,
    includeActDividers: true,
    includeModuleDetails: true,
    includeCrossCutting: true,
    includeDependencyAnalysis: true,
    includeGettingStarted: true,
    includeModuleIndex: true,
    includeGlossary: true,
    includeQuickReference: true,
    chapterStartsNewPage: true,
    moduleStartsNewPage: false,
  },
  branding: {
    applyBrandColors: true,
    primaryColor: '#4f46e5',
    secondaryColor: '#1e293b',
    accentColor: '#14b8a6',
    logoUrl: '',
    watermarkType: 'classification',
    watermarkText: '',
    watermarkOpacity: 0.08,
    watermarkExpiryDate: '',
    useActColors: true,
  },
};

const parseConfig = <T>(config: Json | null, fallback: T): T => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return fallback;
  }
  return { ...fallback, ...config as unknown as T };
};

export const useProductCapabilitiesPrintSettings = () => {
  const queryClient = useQueryClient();
  const { brandColors, isLoading: isBrandLoading } = useEnablementBranding();
  const { user, profile } = useAuth();
  const companyId = profile?.company_id ?? null;

  const settingsName = 'Product Capabilities Print Settings';
  const queryKey = ["product-capabilities-print-settings", companyId];

  const { data: printSettings, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<ProductCapabilitiesPrintSettings> => {
      if (!companyId) return DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS;

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
        return DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS;
      }

      if (data) {
        // Parse the configs - we store document & headers in sections_config, sections in formatting_config
        const sectionsData = data.sections_config as Record<string, unknown> | null;
        const formattingData = data.formatting_config as Record<string, unknown> | null;
        
        return {
          id: data.id,
          layout: parseConfig(data.layout_config, DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS.layout),
          document: parseConfig(sectionsData?.document as Json, DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS.document),
          headers: parseConfig(sectionsData?.headers as Json, DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS.headers),
          sections: parseConfig(formattingData as Json, DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS.sections),
          branding: parseConfig(data.branding_config, DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS.branding),
        };
      }

      return DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS;
    },
  });

  const savePrintSettings = useMutation({
    mutationFn: async (settings: ProductCapabilitiesPrintSettings) => {
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
      const sectionsJson = { document: settings.document, headers: settings.headers } as unknown as Json;
      const formattingJson = settings.sections as unknown as Json;
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
            description: 'Print configuration for the Product Capabilities document',
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

  // Merge brand colors if available
  const effectiveSettings: ProductCapabilitiesPrintSettings = printSettings 
    ? {
        ...printSettings,
        branding: {
          ...printSettings.branding,
          primaryColor: printSettings.branding.applyBrandColors && brandColors?.primaryColor 
            ? brandColors.primaryColor 
            : printSettings.branding.primaryColor,
          secondaryColor: printSettings.branding.applyBrandColors && brandColors?.secondaryColor 
            ? brandColors.secondaryColor 
            : printSettings.branding.secondaryColor,
          accentColor: printSettings.branding.applyBrandColors && brandColors?.accentColor 
            ? brandColors.accentColor 
            : printSettings.branding.accentColor,
          logoUrl: brandColors?.logoUrl || printSettings.branding.logoUrl,
        }
      }
    : DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS;

  return {
    printSettings: effectiveSettings,
    rawSettings: printSettings || DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS,
    brandColors,
    isLoading: isLoading || isBrandLoading,
    savePrintSettings,
    DEFAULT_SETTINGS: DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS
  };
};
