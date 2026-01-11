import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Globe, Coins, Languages, List, Building2, 
  Briefcase, Target, FileText, IdCard, GraduationCap, 
  Award, Calculator, CalendarDays, Users,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { CountriesTab } from "./tabs/CountriesTab";
import { CurrenciesTab } from "./tabs/CurrenciesTab";
import { LanguagesTab } from "./tabs/LanguagesTab";
import { LookupValuesTab } from "./tabs/LookupValuesTab";
import { IndustriesTab } from "./tabs/IndustriesTab";
import { SkillsLibraryTab } from "./tabs/SkillsLibraryTab";
import { OccupationsLibraryTab } from "./tabs/OccupationsLibraryTab";
import { CompetenciesLibraryTab } from "./tabs/CompetenciesLibraryTab";
import { DocumentTypesTab } from "./tabs/DocumentTypesTab";
import { GovernmentIdTypesTab } from "./tabs/GovernmentIdTypesTab";
import { QualificationTypesTab } from "./tabs/QualificationTypesTab";
import { AccreditingBodiesTab } from "./tabs/AccreditingBodiesTab";
import { StatutoryDeductionsTab } from "./tabs/StatutoryDeductionsTab";
import { LeaveTypesTab } from "./tabs/LeaveTypesTab";
import { JobFamiliesTab } from "./tabs/JobFamiliesTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface CategoryGroup {
  id: string;
  label: string;
  items: CategoryItem[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "global-standards",
    label: "Global Standards",
    items: [
      { id: "countries", label: "Countries", icon: Globe, description: "ISO country codes and regions" },
      { id: "currencies", label: "Currencies", icon: Coins, description: "ISO currency codes and symbols" },
      { id: "languages", label: "Languages", icon: Languages, description: "ISO language codes" },
    ]
  },
  {
    id: "organization",
    label: "Organization",
    items: [
      { id: "industries", label: "Industries", icon: Building2, description: "Industry classifications" },
      { id: "job-families", label: "Job Families", icon: Briefcase, description: "Job family hierarchy" },
    ]
  },
  {
    id: "talent-skills",
    label: "Talent & Skills",
    items: [
      { id: "skills", label: "Skills Library", icon: Target, description: "ESCO-aligned skills catalog" },
      { id: "occupations", label: "Occupations", icon: Users, description: "ISCO occupation codes" },
      { id: "competencies", label: "Competencies", icon: Award, description: "Competency framework" },
    ]
  },
  {
    id: "documents-compliance",
    label: "Documents & Compliance",
    items: [
      { id: "document-types", label: "Document Types", icon: FileText, description: "HR document classifications" },
      { id: "government-ids", label: "Government IDs", icon: IdCard, description: "Country-specific ID types" },
      { id: "qualifications", label: "Qualifications", icon: GraduationCap, description: "Educational qualifications" },
      { id: "accrediting-bodies", label: "Accrediting Bodies", icon: Award, description: "Certification bodies" },
    ]
  },
  {
    id: "payroll-benefits",
    label: "Payroll & Benefits",
    items: [
      { id: "statutory-deductions", label: "Statutory Deductions", icon: Calculator, description: "Country-specific deductions" },
      { id: "leave-types", label: "Leave Types", icon: CalendarDays, description: "Leave classifications" },
    ]
  },
  {
    id: "system-codes",
    label: "System Codes",
    items: [
      { id: "lookups", label: "Lookup Values", icon: List, description: "System codes with module filter" },
    ]
  },
];

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  "countries": CountriesTab,
  "currencies": CurrenciesTab,
  "languages": LanguagesTab,
  "industries": IndustriesTab,
  "job-families": JobFamiliesTab,
  "skills": SkillsLibraryTab,
  "occupations": OccupationsLibraryTab,
  "competencies": CompetenciesLibraryTab,
  "document-types": DocumentTypesTab,
  "government-ids": GovernmentIdTypesTab,
  "qualifications": QualificationTypesTab,
  "accrediting-bodies": AccreditingBodiesTab,
  "statutory-deductions": StatutoryDeductionsTab,
  "leave-types": LeaveTypesTab,
  "lookups": LookupValuesTab,
};

export function ReferenceDataBrowser() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["global-standards"]);

  const selectedItem = CATEGORY_GROUPS
    .flatMap(g => g.items)
    .find(item => item.id === selectedCategory);

  const SelectedComponent = selectedCategory ? COMPONENT_MAP[selectedCategory] : null;

  if (selectedCategory && SelectedComponent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCategory(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </div>
        
        <div className="flex items-center gap-3 pb-2 border-b">
          {selectedItem && (
            <>
              <div className="p-2 rounded-lg bg-primary/10">
                <selectedItem.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedItem.label}</h3>
                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                )}
              </div>
            </>
          )}
        </div>

        <SelectedComponent />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Accordion 
        type="multiple" 
        value={expandedGroups}
        onValueChange={setExpandedGroups}
        className="space-y-2"
      >
        {CATEGORY_GROUPS.map((group) => (
          <AccordionItem 
            key={group.id} 
            value={group.id}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{group.label}</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {group.items.length} {group.items.length === 1 ? "type" : "types"}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <Card 
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                      "group"
                    )}
                    onClick={() => setSelectedCategory(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{item.label}</h4>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
