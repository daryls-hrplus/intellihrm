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
      { id: "admin-security", title: "Admin & Security (80+)", level: 2 },
      { id: "hr-hub", title: "HR Hub (70+)", level: 2 },
    ],
  },
  {
    id: "act1",
    title: "Act 1: Attract, Onboard & Transition (245+)",
    level: 1,
    children: [
      { id: "recruitment", title: "Recruitment (75+)", level: 2 },
      { id: "onboarding", title: "Onboarding (55+)", level: 2 },
      { id: "offboarding", title: "Offboarding (55+)", level: 2 },
      { id: "workforce", title: "Workforce Management (60+)", level: 2 },
    ],
  },
  {
    id: "act2",
    title: "Act 2: Enable & Engage (180+)",
    level: 1,
    children: [
      { id: "ess", title: "Employee Self-Service (45+)", level: 2 },
      { id: "mss", title: "Manager Self-Service (50+)", level: 2 },
      { id: "time-attendance", title: "Time & Attendance (45+)", level: 2 },
      { id: "leave", title: "Leave Management (40+)", level: 2 },
    ],
  },
  {
    id: "act3",
    title: "Act 3: Pay & Reward (150+)",
    level: 1,
    children: [
      { id: "payroll", title: "Payroll (60+)", level: 2 },
      { id: "compensation", title: "Compensation (50+)", level: 2 },
      { id: "benefits", title: "Benefits (40+)", level: 2 },
    ],
  },
  {
    id: "act4",
    title: "Act 4: Develop & Grow (410+)",
    level: 1,
    children: [
      { id: "learning", title: "Learning & LMS (130+)", level: 2 },
      { id: "goals", title: "Goals Management (45+)", level: 2 },
      { id: "appraisals", title: "Performance Appraisals (50+)", level: 2 },
      { id: "feedback-360", title: "360 Feedback (35+)", level: 2 },
      { id: "continuous-performance", title: "Continuous Performance (55+)", level: 2 },
      { id: "succession", title: "Succession Planning (95+)", level: 2 },
    ],
  },
  {
    id: "act5",
    title: "Act 5: Protect & Support (280+)",
    level: 1,
    children: [
      { id: "health-safety", title: "Health & Safety (120+)", level: 2 },
      { id: "employee-relations", title: "Employee Relations (95+)", level: 2 },
      { id: "company-property", title: "Company Property (65+)", level: 2 },
    ],
  },
  {
    id: "epilogue",
    title: "Epilogue: Continuous Excellence (85+)",
    level: 1,
    children: [
      { id: "help-center", title: "Help Center (85+)", level: 2 },
    ],
  },
  {
    id: "cross-cutting",
    title: "Cross-Cutting Capabilities (175+)",
    level: 1,
    children: [
      { id: "platform-features", title: "Platform Features (70+)", level: 2 },
      { id: "regional-compliance", title: "Regional Compliance (50+)", level: 2 },
      { id: "ai-intelligence", title: "AI Intelligence (55+)", level: 2 },
    ],
  },
  {
    id: "module-dependency-analysis",
    title: "Module Dependency Analysis",
    level: 1,
  },
  {
    id: "getting-started",
    title: "Getting Started",
    level: 1,
  },
];
