import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrphanedSection {
  section_id: string;
  section_number: string;
  section_title: string;
  manual_code: string;
  orphaned_codes: string[];
  valid_codes: string[];
  severity: 'critical' | 'warning';
}

export interface UnmappedSection {
  section_id: string;
  section_number: string;
  title: string;
  manual_code: string;
}

export interface DocumentationValidation {
  totalSections: number;
  validMappings: number;
  orphanedDocumentation: OrphanedSection[];
  unmappedSections: UnmappedSection[];
  summary: {
    orphanedCount: number;
    unmappedCount: number;
    healthScore: number;
  };
}

export interface ManualCoverage {
  totalSections: number;
  sectionsWithContent: number;
  featuresWithDocumentation: number;
  featuresWithoutDocumentation: number;
  undocumentedFeatures: Array<{
    feature_code: string;
    feature_name: string;
    module_code: string;
    suggested_section: string;
  }>;
}

export interface DocumentationHealth {
  orphanedReferences: number;
  unmappedSections: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export function useDocumentationValidation() {
  const [validation, setValidation] = useState<DocumentationValidation | null>(null);
  const [manualCoverage, setManualCoverage] = useState<ManualCoverage | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRemovingOrphanedCodes, setIsRemovingOrphanedCodes] = useState(false);

  /**
   * Validate documentation - bi-directional check between features and manual sections
   */
  const validateDocumentation = useCallback(async (): Promise<DocumentationValidation | null> => {
    setIsValidating(true);
    try {
      // 1. Get all valid feature codes from application_features
      const { data: dbFeatures, error: featuresError } = await supabase
        .from("application_features")
        .select("feature_code, feature_name, application_modules!inner(module_code)")
        .eq("is_active", true);

      if (featuresError) throw featuresError;

      const validFeatureCodes = new Set(dbFeatures?.map(f => f.feature_code) || []);

      // 2. Get all manual sections with their feature code mappings
      const { data: manualSections, error: sectionsError } = await supabase
        .from("manual_sections")
        .select(`
          id, section_number, title, source_feature_codes,
          manual_definitions!inner(manual_code, title)
        `)
        .not("source_feature_codes", "is", null);

      if (sectionsError) throw sectionsError;

      // 3. Find orphaned references (in docs but not in DB)
      const orphanedDocumentation: OrphanedSection[] = [];
      let validMappings = 0;

      for (const section of manualSections || []) {
        const codes = (section.source_feature_codes as string[]) || [];
        if (codes.length === 0) continue;

        const orphanedCodes = codes.filter(code => !validFeatureCodes.has(code));
        const validCodes = codes.filter(code => validFeatureCodes.has(code));

        if (orphanedCodes.length > 0) {
          orphanedDocumentation.push({
            section_id: section.id,
            section_number: section.section_number || '',
            section_title: section.title || '',
            manual_code: (section.manual_definitions as any)?.manual_code || '',
            orphaned_codes: orphanedCodes,
            valid_codes: validCodes,
            severity: orphanedCodes.length === codes.length ? 'critical' : 'warning'
          });
        } else if (validCodes.length > 0) {
          validMappings++;
        }
      }

      // 4. Find sections with no feature mapping at all
      const { data: unmappedSectionsData, error: unmappedError } = await supabase
        .from("manual_sections")
        .select("id, section_number, title, manual_definitions!inner(manual_code)")
        .or("source_feature_codes.is.null,source_feature_codes.eq.{}");

      if (unmappedError) throw unmappedError;

      const unmappedSections: UnmappedSection[] = (unmappedSectionsData || []).map(section => ({
        section_id: section.id,
        section_number: section.section_number || '',
        title: section.title || '',
        manual_code: (section.manual_definitions as any)?.manual_code || ''
      }));

      // 5. Calculate health score
      const totalMappedSections = (manualSections?.length || 0);
      const orphanedCount = orphanedDocumentation.length;
      const unmappedCount = unmappedSections.length;
      
      // Health score calculation:
      // - Start at 100
      // - Deduct 10 points per orphaned section (max -50)
      // - Deduct 2 points per unmapped section (max -30)
      // - Bonus for valid mappings
      const orphanPenalty = Math.min(50, orphanedCount * 10);
      const unmappedPenalty = Math.min(30, unmappedCount * 2);
      const validBonus = validMappings > 0 ? Math.min(20, validMappings) : 0;
      const healthScore = Math.max(0, 100 - orphanPenalty - unmappedPenalty + validBonus);

      const result: DocumentationValidation = {
        totalSections: totalMappedSections,
        validMappings,
        orphanedDocumentation,
        unmappedSections,
        summary: {
          orphanedCount,
          unmappedCount,
          healthScore: Math.round(healthScore)
        }
      };

      setValidation(result);
      return result;
    } catch (error) {
      console.error("Documentation validation failed:", error);
      toast.error("Failed to validate documentation");
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Calculate manual coverage - features with/without documentation
   */
  const calculateManualCoverage = useCallback(async (): Promise<ManualCoverage | null> => {
    try {
      // Get all features
      const { data: features, error: featuresError } = await supabase
        .from("application_features")
        .select("feature_code, feature_name, application_modules!inner(module_code)")
        .eq("is_active", true);

      if (featuresError) throw featuresError;

      // Get manual sections with content
      const { data: sections, error: sectionsError } = await supabase
        .from("manual_sections")
        .select("id, source_feature_codes, markdown_content");

      if (sectionsError) throw sectionsError;

      // Build feature-to-documentation map
      const documentedFeatures = new Set<string>();
      let sectionsWithContent = 0;

      for (const section of sections || []) {
        if (section.markdown_content) {
          sectionsWithContent++;
        }
        const codes = (section.source_feature_codes as string[]) || [];
        for (const code of codes) {
          if (section.markdown_content) {
            documentedFeatures.add(code);
          }
        }
      }

      // Find undocumented features
      const undocumentedFeatures: ManualCoverage['undocumentedFeatures'] = [];
      for (const feature of features || []) {
        if (!documentedFeatures.has(feature.feature_code)) {
          undocumentedFeatures.push({
            feature_code: feature.feature_code,
            feature_name: feature.feature_name || '',
            module_code: (feature.application_modules as any)?.module_code || '',
            suggested_section: `New section for ${feature.feature_name}`
          });
        }
      }

      const result: ManualCoverage = {
        totalSections: sections?.length || 0,
        sectionsWithContent,
        featuresWithDocumentation: documentedFeatures.size,
        featuresWithoutDocumentation: undocumentedFeatures.length,
        undocumentedFeatures: undocumentedFeatures.slice(0, 50)
      };

      setManualCoverage(result);
      return result;
    } catch (error) {
      console.error("Manual coverage calculation failed:", error);
      return null;
    }
  }, []);

  /**
   * Get documentation health status for dashboard
   */
  const getDocumentationHealth = useCallback((): DocumentationHealth => {
    if (!validation) {
      return {
        orphanedReferences: 0,
        unmappedSections: 0,
        healthStatus: 'healthy'
      };
    }

    const { orphanedCount, unmappedCount, healthScore } = validation.summary;

    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (healthScore < 60 || orphanedCount > 5) {
      healthStatus = 'critical';
    } else if (healthScore < 80 || orphanedCount > 0 || unmappedCount > 10) {
      healthStatus = 'warning';
    }

    return {
      orphanedReferences: orphanedCount,
      unmappedSections: unmappedCount,
      healthStatus
    };
  }, [validation]);

  /**
   * Remove orphaned codes from a section
   */
  const removeOrphanedCodes = useCallback(async (
    sectionId: string, 
    orphanedCodes: string[]
  ): Promise<boolean> => {
    setIsRemovingOrphanedCodes(true);
    try {
      // Get current codes
      const { data: section, error: fetchError } = await supabase
        .from("manual_sections")
        .select("source_feature_codes")
        .eq("id", sectionId)
        .single();

      if (fetchError) throw fetchError;

      const currentCodes = (section.source_feature_codes as string[]) || [];
      const orphanedSet = new Set(orphanedCodes);
      const cleanedCodes = currentCodes.filter(code => !orphanedSet.has(code));

      // Update the section
      const { error: updateError } = await supabase
        .from("manual_sections")
        .update({ source_feature_codes: cleanedCodes })
        .eq("id", sectionId);

      if (updateError) throw updateError;

      toast.success(`Removed ${orphanedCodes.length} orphaned code(s)`);
      return true;
    } catch (error) {
      console.error("Failed to remove orphaned codes:", error);
      toast.error("Failed to remove orphaned codes");
      return false;
    } finally {
      setIsRemovingOrphanedCodes(false);
    }
  }, []);

  /**
   * Link features to a manual section
   */
  const linkFeaturesToSection = useCallback(async (
    sectionId: string,
    featureCodes: string[]
  ): Promise<boolean> => {
    try {
      // Get current codes
      const { data: section, error: fetchError } = await supabase
        .from("manual_sections")
        .select("source_feature_codes")
        .eq("id", sectionId)
        .single();

      if (fetchError) throw fetchError;

      const currentCodes = (section.source_feature_codes as string[]) || [];
      const mergedCodes = [...new Set([...currentCodes, ...featureCodes])];

      // Update the section
      const { error: updateError } = await supabase
        .from("manual_sections")
        .update({ source_feature_codes: mergedCodes })
        .eq("id", sectionId);

      if (updateError) throw updateError;

      toast.success(`Linked ${featureCodes.length} feature(s) to section`);
      return true;
    } catch (error) {
      console.error("Failed to link features:", error);
      toast.error("Failed to link features");
      return false;
    }
  }, []);

  return {
    // State
    validation,
    manualCoverage,
    isValidating,
    isRemovingOrphanedCodes,

    // Actions
    validateDocumentation,
    calculateManualCoverage,
    getDocumentationHealth,
    removeOrphanedCodes,
    linkFeaturesToSection,
  };
}
