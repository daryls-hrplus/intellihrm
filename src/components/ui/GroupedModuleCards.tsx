import { useState, forwardRef, useImperativeHandle } from "react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LucideIcon, 
  ChevronDown, 
  User, 
  Sparkles, 
  Clock, 
  CreditCard, 
  Target, 
  GraduationCap, 
  Rocket, 
  Building2, 
  CheckSquare, 
  HelpCircle,
  Compass,
  ChevronsUpDown
} from "lucide-react";

export interface ActionBadge {
  count: number;
  label: string;
  variant: "default" | "warning" | "destructive";
}

export interface GroupedModuleItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  tabCode?: string;
  badge?: string; // Static label (e.g., "New", "Recommended")
  actionBadge?: ActionBadge; // Dynamic pending action badge
}

export interface SectionBadge {
  count: number;
  label: string;
  variant: "default" | "warning" | "destructive";
}

export interface ModuleSection {
  titleKey: string;
  items: GroupedModuleItem[];
}

export interface GroupedModuleCardsHandle {
  expandAll: () => void;
  collapseAll: () => void;
  toggleAll: () => void;
  isAllExpanded: boolean;
}

interface GroupedModuleCardsProps {
  sections: ModuleSection[];
  defaultOpen?: boolean;
  sectionBadges?: Record<string, SectionBadge | null>;
  showToggleButton?: boolean;
}

// Map section titles to icons
const sectionIcons: Record<string, LucideIcon> = {
  "Company": Building2,
  "My Profile": User,
  "My Skills": Sparkles,
  "Career": Compass,
  "Time & Absence": Clock,
  "Pay & Benefits": CreditCard,
  "Performance": Target,
  "Learning & Development": GraduationCap,
  "My Journey": Rocket,
  "Work Environment": Building2,
  "Tasks & Approvals": CheckSquare,
  "Help & Settings": HelpCircle,
};

export const GroupedModuleCards = forwardRef<GroupedModuleCardsHandle, GroupedModuleCardsProps>(
  function GroupedModuleCards({ sections, defaultOpen = false, sectionBadges = {}, showToggleButton = false }, ref) {
  const { navigateToList } = useWorkspaceNavigation();
  
  // Track open sections - default state based on defaultOpen prop
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(defaultOpen);
  
  // Helper to infer module code from route
  const inferModuleFromRoute = (route: string): string => {
    const segments = route.split('/').filter(Boolean);
    return segments[0] || 'dashboard';
  };

  // Filter out empty sections
  const nonEmptySections = sections.filter(section => section.items.length > 0);

  // Determine if a section is open - use state if set, otherwise use defaultOpen prop
  const isSectionOpen = (titleKey: string) => {
    return openSections[titleKey] ?? defaultOpen;
  };

  const toggleSection = (titleKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [titleKey]: !(prev[titleKey] ?? defaultOpen)
    }));
  };

  const expandAll = () => {
    const newState: Record<string, boolean> = {};
    nonEmptySections.forEach(section => {
      newState[section.titleKey] = true;
    });
    setOpenSections(newState);
    setAllExpanded(true);
  };

  const collapseAll = () => {
    const newState: Record<string, boolean> = {};
    nonEmptySections.forEach(section => {
      newState[section.titleKey] = false;
    });
    setOpenSections(newState);
    setAllExpanded(false);
  };

  const toggleAll = () => {
    if (allExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    expandAll,
    collapseAll,
    toggleAll,
    isAllExpanded: allExpanded,
  }));

  const getBadgeVariantClass = (variant: SectionBadge["variant"]) => {
    switch (variant) {
      case "destructive":
        return "bg-destructive text-destructive-foreground";
      case "warning":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-4">
      {showToggleButton && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
            className="gap-2"
          >
            <ChevronsUpDown className="h-4 w-4" />
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start">
      {nonEmptySections.map((section) => {
        const SectionIcon = sectionIcons[section.titleKey];
        const badge = sectionBadges[section.titleKey];

        return (
          <Card key={section.titleKey} className={`overflow-hidden transition-all duration-200 ${
            !isSectionOpen(section.titleKey) ? 'h-auto' : ''
          }`}>
            <Collapsible 
              open={isSectionOpen(section.titleKey)} 
              onOpenChange={() => toggleSection(section.titleKey)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {SectionIcon && (
                        <SectionIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg font-semibold">{section.titleKey}</CardTitle>
                      {badge && (
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs font-medium ${getBadgeVariantClass(badge.variant)}`}
                        >
                          {badge.label}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                        isSectionOpen(section.titleKey) ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                <CardContent className="space-y-2 pt-4">
                  {section.items.map((item) => (
                    <div
                      key={item.href}
                      onClick={() => navigateToList({
                        route: item.href,
                        title: item.title,
                        moduleCode: inferModuleFromRoute(item.href),
                        icon: item.icon,
                      })}
                      className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-muted hover:shadow-sm cursor-pointer group"
                    >
                      <div className={`p-2 rounded-lg ${item.color} transition-transform group-hover:scale-105`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.badge && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                              {item.badge}
                            </Badge>
                          )}
                          {item.actionBadge && (
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0 h-4 font-medium ${getBadgeVariantClass(item.actionBadge.variant)}`}
                            >
                              {item.actionBadge.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
      </div>
    </div>
  );
});
