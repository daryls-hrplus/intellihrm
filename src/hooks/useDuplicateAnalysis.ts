import { OrphanEntry, DuplicateAnalysis, DuplicateType, DuplicateRecommendation, OrphanDuplicate } from "@/types/orphanTypes";

/**
 * Analyzes duplicate entries to determine if they are true duplicates
 * or same name with different contexts
 */
export function analyzeDuplicate(duplicate: OrphanDuplicate): DuplicateAnalysis {
  const { featureName, entries } = duplicate;
  
  // Extract unique modules
  const moduleList = [...new Set(entries.map(e => e.moduleCode || 'unassigned'))];
  const hasDifferentModules = moduleList.length > 1;
  
  // Extract route patterns (first segment after /)
  const routePatternList = [...new Set(
    entries
      .filter(e => e.routePath)
      .map(e => {
        const parts = e.routePath!.split('/').filter(Boolean);
        return parts[0] || 'none';
      })
  )];
  const hasDifferentRoutePatterns = routePatternList.length > 1;
  
  // Check descriptions
  const descriptions = entries.map(e => e.description?.toLowerCase().trim() || '');
  const uniqueDescriptions = [...new Set(descriptions.filter(d => d.length > 0))];
  const hasDifferentDescriptions = uniqueDescriptions.length > 1;
  
  // Determine type and recommendation
  let type: DuplicateType;
  let recommendation: DuplicateRecommendation;
  let reason: string;
  let suggestedAction: string;
  
  if (hasDifferentModules && hasDifferentRoutePatterns) {
    // Different modules AND different route patterns = different contexts
    type = 'same_name_different_context';
    recommendation = 'keep_both';
    reason = `These are ${entries.length} distinct features with the same name, serving different purposes in different modules (${moduleList.join(', ')}).`;
    suggestedAction = 'Consider renaming to make names unique if confusion is likely, or keep as-is if context is clear.';
  } else if (hasDifferentModules) {
    // Different modules but similar routes = might need renaming
    type = 'same_name_different_context';
    recommendation = 'rename_one';
    reason = `Same feature name across ${moduleList.length} modules. Route patterns are similar, which may cause confusion.`;
    suggestedAction = 'Rename to include module context (e.g., "Employee Attendance Records" vs "Team Attendance Records").';
  } else if (hasDifferentRoutePatterns) {
    // Same module but different routes = review needed
    type = 'same_name_different_context';
    recommendation = 'review';
    reason = `Same name in the same module but pointing to different routes. May be intentional variants or accidental duplicates.`;
    suggestedAction = 'Review to determine if these serve different purposes or if one should be removed.';
  } else {
    // Same module, same route pattern = true duplicate
    type = 'true_duplicate';
    recommendation = 'merge';
    reason = `True duplicates: Same name, same module (${moduleList[0]}), similar route patterns. Only one entry should exist.`;
    suggestedAction = 'Keep the primary entry (usually the first created) and delete/archive the others.';
  }
  
  return {
    featureName,
    entries,
    type,
    recommendation,
    reason,
    suggestedAction,
    differences: {
      hasDifferentModules,
      hasDifferentRoutePatterns,
      hasDifferentDescriptions,
      moduleList,
      routePatternList
    }
  };
}

export function useDuplicateAnalysis() {
  const analyze = (duplicate: OrphanDuplicate): DuplicateAnalysis => {
    return analyzeDuplicate(duplicate);
  };
  
  const analyzeAll = (duplicates: OrphanDuplicate[]): DuplicateAnalysis[] => {
    return duplicates.map(analyze);
  };
  
  return { analyze, analyzeAll };
}
