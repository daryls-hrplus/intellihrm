import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnablementContentStatus } from "./useEnablementData";

export interface EnablementProgress {
  // Phase 1: Create
  totalContent: number;
  draftContent: number;
  
  // Phase 2: Review
  pendingReviewCount: number;
  inReviewCount: number;
  rejectedCount: number;
  
  // Phase 3: Release
  approvedCount: number;
  readyToPublishCount: number;
  
  // Phase 4: Library
  publishedCount: number;
  totalManuals: number;
  
  // Computed metrics
  reviewedPercentage: number;
  publishedPercentage: number;
  currentPhase: "create" | "review" | "release" | "library";
  isLoading: boolean;
}

export function useEnablementProgress(): EnablementProgress {
  const { contentItems, isLoading: contentLoading } = useEnablementContentStatus();

  // Fetch pending review sections
  const { data: pendingReviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ["pending-review-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_sections")
        .select("id, review_status")
        .in("review_status", ["pending_review", "in_review", "rejected"]);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch approved sections ready to publish
  const { data: approvedSections, isLoading: approvedLoading } = useQuery({
    queryKey: ["approved-sections-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_sections")
        .select("id, review_status")
        .eq("review_status", "approved");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch published KB articles
  const { data: publishedArticles, isLoading: publishedLoading } = useQuery({
    queryKey: ["published-kb-articles-progress"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = supabase.from("kb_articles").select("id", { count: "exact" }) as any;
      const { count, error } = await query.eq("status", "published");
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Fetch total manuals
  const { data: manualsCount, isLoading: manualsLoading } = useQuery({
    queryKey: ["total-manuals-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("manual_definitions")
        .select("id", { count: "exact", head: true });
      
      if (error) throw error;
      return count ?? 0;
    },
  });

  const progress = useMemo(() => {
    const totalContent = contentItems.length;
    const readyToPublishCount = contentItems.filter(
      (i) => (i.workflow_status as string) === "ready_for_enablement"
    ).length;
    
    // Review phase counts
    const pendingReviewCount = (pendingReviewData || []).filter(
      (s) => s.review_status === "pending_review"
    ).length;
    const inReviewCount = (pendingReviewData || []).filter(
      (s) => s.review_status === "in_review"
    ).length;
    const rejectedCount = (pendingReviewData || []).filter(
      (s) => s.review_status === "rejected"
    ).length;
    
    const approvedCount = (approvedSections || []).length;
    const publishedCount = publishedArticles ?? 0;
    const totalManuals = manualsCount ?? 0;
    
    // Computed percentages
    const totalReviewable = totalContent + pendingReviewCount + approvedCount;
    const reviewedPercentage = totalReviewable > 0 
      ? Math.round(((approvedCount + publishedCount) / totalReviewable) * 100)
      : 0;
    const publishedPercentage = totalReviewable > 0
      ? Math.round((publishedCount / totalReviewable) * 100)
      : 0;
    
    // Determine current recommended phase
    let currentPhase: "create" | "review" | "release" | "library" = "create";
    if (pendingReviewCount > 5 || inReviewCount > 0) {
      currentPhase = "review";
    } else if (approvedCount > 10 || readyToPublishCount > 5) {
      currentPhase = "release";
    } else if (publishedCount > 0 && pendingReviewCount === 0 && approvedCount === 0) {
      currentPhase = "library";
    }
    
    return {
      totalContent,
      draftContent: totalContent,
      pendingReviewCount,
      inReviewCount,
      rejectedCount,
      approvedCount,
      readyToPublishCount,
      publishedCount,
      totalManuals,
      reviewedPercentage,
      publishedPercentage,
      currentPhase,
      isLoading: contentLoading || reviewLoading || approvedLoading || publishedLoading || manualsLoading,
    };
  }, [
    contentItems, 
    pendingReviewData, 
    approvedSections, 
    publishedArticles, 
    manualsCount,
    contentLoading,
    reviewLoading,
    approvedLoading,
    publishedLoading,
    manualsLoading,
  ]);

  return progress;
}
