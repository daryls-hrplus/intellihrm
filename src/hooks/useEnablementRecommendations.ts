import { useMemo } from "react";
import { useEnablementProgress } from "./useEnablementProgress";
import { ClipboardCheck, Rocket, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface EnablementRecommendation {
  action: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low" | "success";
  icon: LucideIcon;
}

export function useEnablementRecommendations(): {
  recommendation: EnablementRecommendation;
  secondaryActions: EnablementRecommendation[];
  isLoading: boolean;
} {
  const progress = useEnablementProgress();

  const result = useMemo(() => {
    const secondaryActions: EnablementRecommendation[] = [];
    let primaryRecommendation: EnablementRecommendation;

    // Priority 1: Items pending review (most urgent)
    if (progress.pendingReviewCount > 0) {
      primaryRecommendation = {
        action: "Review pending content",
        description: `${progress.pendingReviewCount} AI-generated section${progress.pendingReviewCount > 1 ? 's' : ''} awaiting your approval`,
        href: "/enablement/review",
        priority: progress.pendingReviewCount > 5 ? "high" : "medium",
        icon: ClipboardCheck,
      };
      
      // Secondary: generate more content if not much pending
      if (progress.pendingReviewCount < 10) {
        secondaryActions.push({
          action: "Generate more documentation",
          description: "Use AI to create KB articles and training content",
          href: "/enablement/create",
          priority: "low",
          icon: Sparkles,
        });
      }
    }
    // Priority 2: Approved content ready to publish
    else if (progress.approvedCount > 0) {
      primaryRecommendation = {
        action: "Publish to Help Center",
        description: `${progress.approvedCount} approved section${progress.approvedCount > 1 ? 's' : ''} ready to publish`,
        href: "/enablement/release-center?activeTab=publishing",
        priority: progress.approvedCount > 10 ? "high" : "medium",
        icon: Rocket,
      };
      
      secondaryActions.push({
        action: "Generate more documentation",
        description: "Continue building your content library",
        href: "/enablement/create",
        priority: "low",
        icon: Sparkles,
      });
    }
    // Priority 3: No content - encourage creation
    else if (progress.totalContent === 0 && progress.publishedCount === 0) {
      primaryRecommendation = {
        action: "Create your first documentation",
        description: "Use AI to generate KB articles, training guides, and SOPs",
        href: "/enablement/create",
        priority: "medium",
        icon: Sparkles,
      };
      
      secondaryActions.push({
        action: "Browse Administrator Manuals",
        description: "Explore 10 comprehensive guides with 515+ sections",
        href: "/enablement/manuals",
        priority: "low",
        icon: BookOpen,
      });
    }
    // Priority 4: Has content but nothing pending - suggest more creation
    else if (progress.publishedCount > 0 && progress.pendingReviewCount === 0 && progress.approvedCount === 0) {
      primaryRecommendation = {
        action: "All caught up!",
        description: `${progress.publishedCount} article${progress.publishedCount > 1 ? 's' : ''} published. Generate more content to expand your Help Center.`,
        href: "/enablement/create",
        priority: "success",
        icon: CheckCircle2,
      };
      
      secondaryActions.push({
        action: "View published content",
        description: "Browse your Help Center articles",
        href: "/help/kb",
        priority: "low",
        icon: BookOpen,
      });
    }
    // Default: suggest creation
    else {
      primaryRecommendation = {
        action: "Generate documentation",
        description: "Use AI to create content for your features",
        href: "/enablement/create",
        priority: "medium",
        icon: Sparkles,
      };
    }

    return {
      recommendation: primaryRecommendation,
      secondaryActions,
      isLoading: progress.isLoading,
    };
  }, [progress]);

  return result;
}
