import { useEnablementProgress } from "@/hooks/useEnablementProgress";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardCheck, Rocket, BookOpen, X, PartyPopper } from "lucide-react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TransitionConfig {
  condition: (progress: ReturnType<typeof useEnablementProgress>) => boolean;
  storageKey: string;
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
  href: string;
  variant: "info" | "success" | "celebration";
}

const TRANSITIONS: TransitionConfig[] = [
  {
    condition: (p) => p.pendingReviewCount >= 5 && p.publishedCount === 0,
    storageKey: "enablement-transition-review-shown",
    icon: ClipboardCheck,
    title: "Ready to review?",
    description: "You have content awaiting approval. Review it to ensure quality before publishing.",
    href: "/enablement/review",
    variant: "info",
  },
  {
    condition: (p) => p.approvedCount >= 10,
    storageKey: "enablement-transition-publish-shown",
    icon: Rocket,
    title: "Ready to publish!",
    description: "You have approved content ready to go live in your Help Center.",
    href: "/enablement/release-center?activeTab=publishing",
    variant: "success",
  },
  {
    condition: (p) => p.publishedCount > 0 && p.publishedCount <= 5,
    storageKey: "enablement-transition-first-publish",
    icon: PartyPopper,
    title: "Congratulations on your first publish!",
    description: "Your content is now live. View it in the Help Center.",
    href: "/help/kb",
    variant: "celebration",
  },
];

export function PhaseTransitionBanner() {
  const progress = useEnablementProgress();
  const { navigateToList } = useWorkspaceNavigation();
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load dismissed banners from localStorage
    const dismissed = new Set<string>();
    TRANSITIONS.forEach((t) => {
      if (localStorage.getItem(t.storageKey) === "true") {
        dismissed.add(t.storageKey);
      }
    });
    setDismissedBanners(dismissed);
  }, []);

  if (progress.isLoading) return null;

  // Find the first matching transition that hasn't been dismissed
  const activeTransition = TRANSITIONS.find(
    (t) => t.condition(progress) && !dismissedBanners.has(t.storageKey)
  );

  if (!activeTransition) return null;

  const handleDismiss = () => {
    localStorage.setItem(activeTransition.storageKey, "true");
    setDismissedBanners((prev) => new Set([...prev, activeTransition.storageKey]));
  };

  const Icon = activeTransition.icon;

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-lg border p-4",
        activeTransition.variant === "info" && "border-primary/30 bg-primary/5",
        activeTransition.variant === "success" && "border-emerald-500/30 bg-emerald-500/5",
        activeTransition.variant === "celebration" && "border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-primary/5 to-emerald-500/10"
      )}
    >
      <Icon
        className={cn(
          "h-8 w-8 shrink-0",
          activeTransition.variant === "info" && "text-primary",
          activeTransition.variant === "success" && "text-emerald-500",
          activeTransition.variant === "celebration" && "text-amber-500"
        )}
      />
      
      <div className="flex-1">
        <h4 className="font-medium">{activeTransition.title}</h4>
        <p className="text-sm text-muted-foreground">{activeTransition.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigateToList({
            route: activeTransition.href,
            title: activeTransition.title,
            moduleCode: "enablement",
            icon: activeTransition.icon,
          })}
        >
          Go Now
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
