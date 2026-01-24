import { forwardRef } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs component - clicking opens a new tab instead of navigating
 * This keeps the current tab intact while allowing users to open parent pages
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items }, ref) => {
    const { navigateToList } = useWorkspaceNavigation();

    const inferModuleFromRoute = (href: string): string => {
      const segments = href.split('/').filter(Boolean);
      return segments[0] || 'dashboard';
    };

    const handleBreadcrumbClick = (item: BreadcrumbItem) => {
      if (!item.href) return;
      
      navigateToList({
        route: item.href,
        title: item.label,
        moduleCode: inferModuleFromRoute(item.href),
      });
    };

    return (
      <nav ref={ref} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {item.href ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleBreadcrumbClick(item)}
                    className={cn(
                      "hover:text-foreground transition-colors flex items-center gap-1",
                      "hover:underline underline-offset-2"
                    )}
                  >
                    {item.label}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Opens in new tab</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    );
  }
);

Breadcrumbs.displayName = "Breadcrumbs";

