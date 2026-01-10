import { useState } from "react";
import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TOCSection {
  id: string;
  title: string;
  level: number;
  children?: TOCSection[];
}

interface TableOfContentsProps {
  sections: TOCSection[];
  activeSection?: string;
  onNavigate?: (id: string) => void;
}

export function TableOfContents({ sections, activeSection, onNavigate }: TableOfContentsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const handleNavigate = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const renderSection = (section: TOCSection, depth: number = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isActive = activeSection === section.id;

    return (
      <div key={section.id}>
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors",
            isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
            depth > 0 && "ml-4"
          )}
          onClick={() => handleNavigate(section.id)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(section.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <FileText className="h-3 w-3 text-muted-foreground ml-0.5 mr-1" />
          )}
          <span className={cn(
            "text-sm truncate",
            section.level === 1 && "font-semibold",
            section.level === 2 && "font-medium"
          )}>
            {section.title}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {section.children!.map((child) => renderSection(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-0.5 pr-4">
        {sections.map((section) => renderSection(section))}
      </div>
    </ScrollArea>
  );
}

// Static TOC data for the document
export const PRODUCT_CAPABILITIES_TOC: TOCSection[] = [
  {
    id: "executive-overview",
    title: "Executive Overview",
    level: 1,
  },
  {
    id: "platform-at-glance",
    title: "Platform at a Glance",
    level: 1,
  },
  {
    id: "prologue",
    title: "Prologue: Setting the Stage",
    level: 1,
    children: [
      { id: "admin-security", title: "Admin & Security", level: 2 },
      { id: "hr-hub", title: "HR Hub", level: 2 },
    ],
  },
  {
    id: "act1",
    title: "Act 1: Attract & Onboard",
    level: 1,
    children: [
      { id: "recruitment", title: "Recruitment", level: 2 },
      { id: "onboarding", title: "Onboarding & Offboarding", level: 2 },
      { id: "workforce", title: "Workforce Management", level: 2 },
    ],
  },
  {
    id: "act2",
    title: "Act 2: Enable & Engage",
    level: 1,
    children: [
      { id: "ess", title: "Employee Self-Service", level: 2 },
      { id: "mss", title: "Manager Self-Service", level: 2 },
      { id: "time-attendance", title: "Time & Attendance", level: 2 },
      { id: "leave", title: "Leave Management", level: 2 },
    ],
  },
  {
    id: "act3",
    title: "Act 3: Pay & Reward",
    level: 1,
    children: [
      { id: "payroll", title: "Payroll", level: 2 },
      { id: "compensation", title: "Compensation", level: 2 },
      { id: "benefits", title: "Benefits", level: 2 },
    ],
  },
  {
    id: "act4",
    title: "Act 4: Develop & Grow",
    level: 1,
    children: [
      { id: "learning", title: "Learning & Development", level: 2 },
      { id: "goals", title: "Goals Management", level: 2 },
      { id: "appraisals", title: "Performance Appraisals", level: 2 },
      { id: "feedback-360", title: "360 Feedback", level: 2 },
      { id: "continuous-performance", title: "Continuous Performance", level: 2 },
      { id: "succession", title: "Succession Planning", level: 2 },
    ],
  },
  {
    id: "act5",
    title: "Act 5: Protect & Support",
    level: 1,
    children: [
      { id: "hse", title: "Health & Safety", level: 2 },
      { id: "employee-relations", title: "Employee Relations", level: 2 },
      { id: "company-property", title: "Company Property", level: 2 },
    ],
  },
  {
    id: "epilogue",
    title: "Epilogue: Continuous Excellence",
    level: 1,
    children: [
      { id: "help-center", title: "Help Center", level: 2 },
    ],
  },
  {
    id: "cross-cutting",
    title: "Cross-Cutting Capabilities",
    level: 1,
    children: [
      { id: "platform-features", title: "Platform Features", level: 2 },
      { id: "regional-compliance", title: "Regional Compliance", level: 2 },
      { id: "ai-intelligence", title: "AI Intelligence", level: 2 },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    level: 1,
  },
];
