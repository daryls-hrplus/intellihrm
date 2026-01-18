import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Globe, Coins, Languages, List, Building2, 
  Briefcase, Target, FileText, IdCard, GraduationCap, 
  Award, Calculator, CalendarDays, Users, FolderTree,
  ChevronRight, ArrowLeft, School, FileCheck, Plane,
  PiggyBank, Wallet, Package, Lock, Pencil, ExternalLink, Download
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
import { InstitutionsTab } from "./tabs/InstitutionsTab";
import { CSMECertificatesTab } from "./tabs/CSMECertificatesTab";
import { ImmigrationDocTypesTab } from "./tabs/ImmigrationDocTypesTab";
import { TravelDocumentsTab } from "./tabs/TravelDocumentsTab";
import { SavingsProgramsTab } from "./tabs/SavingsProgramsTab";
import { SalaryAdvanceTypesTab } from "./tabs/SalaryAdvanceTypesTab";
import { PropertyCategoriesTab } from "./tabs/PropertyCategoriesTab";
import { PositionsOrgTab } from "./tabs/PositionsOrgTab";
import { CompaniesOrgTab } from "./tabs/CompaniesOrgTab";
import { DepartmentsOrgTab } from "./tabs/DepartmentsOrgTab";
import { CompanyJobFamiliesTab } from "./tabs/CompanyJobFamiliesTab";
import { OrgStructureExport } from "./tabs/OrgStructureExport";
import { GlobalReferenceSearch } from "./GlobalReferenceSearch";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { useGlobalReferenceSearch } from "@/hooks/useGlobalReferenceSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isEditable?: boolean;
  moduleFilter?: string; // For lookup values with specific module filter
}

interface CategoryGroup {
  id: string;
  label: string;
  description?: string;
  isEditable?: boolean;
  items: CategoryItem[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "org-structure",
    label: "Org Structure",
    description: "Your organization's positions, departments, and structure",
    isEditable: true,
    items: [
      { id: "org-positions", label: "Positions", icon: Users, description: "All positions in your organization", isEditable: true },
      { id: "org-companies", label: "Companies", icon: Building2, description: "Companies in your corporate group", isEditable: true },
      { id: "org-departments", label: "Departments", icon: FolderTree, description: "Organizational departments", isEditable: true },
      { id: "org-job-families", label: "Job Families", icon: Briefcase, description: "Company job family classifications", isEditable: true },
      { id: "org-export", label: "Bulk Export", icon: Download, description: "Export all org structure data", isEditable: false },
    ]
  },
  {
    id: "configurable-lookups",
    label: "Configurable Lookup Values",
    description: "Values you can customize for your organization",
    isEditable: true,
    items: [
      { 
        id: "lookups-core-hr", 
        label: "Core HR Values", 
        icon: Users, 
        description: "Employee status, types, gender, marital status, titles",
        isEditable: true,
        moduleFilter: "core_hr"
      },
      { 
        id: "lookups-payroll", 
        label: "Payroll Values", 
        icon: Calculator, 
        description: "Pay types, frequencies, transaction types",
        isEditable: true,
        moduleFilter: "payroll"
      },
      { 
        id: "lookups-workforce", 
        label: "Workforce Values", 
        icon: Briefcase, 
        description: "Position types, overtime status, promotion reasons",
        isEditable: true,
        moduleFilter: "workforce"
      },
      { 
        id: "lookups-learning", 
        label: "Learning & Qualifications", 
        icon: GraduationCap, 
        description: "Education levels, certifications, fields of study",
        isEditable: true,
        moduleFilter: "learning"
      },
      { 
        id: "lookups-leave", 
        label: "Leave Values", 
        icon: CalendarDays, 
        description: "Leave type classifications",
        isEditable: true,
        moduleFilter: "leave"
      },
      { 
        id: "lookups", 
        label: "All Lookup Values", 
        icon: List, 
        description: "View all configurable codes across modules",
        isEditable: true,
      },
    ]
  },
  {
    id: "global-standards",
    label: "Global Standards (ISO)",
    description: "International standard codes - read-only",
    isEditable: false,
    items: [
      { id: "countries", label: "Countries", icon: Globe, description: "ISO 3166 country codes and regions", isEditable: false },
      { id: "currencies", label: "Currencies", icon: Coins, description: "ISO 4217 currency codes and symbols", isEditable: false },
      { id: "languages", label: "Languages", icon: Languages, description: "ISO 639 language codes", isEditable: false },
    ]
  },
  {
    id: "organization",
    label: "Organization Standards",
    description: "Industry and job classifications",
    isEditable: false,
    items: [
      { id: "industries", label: "Industries", icon: Building2, description: "Industry classifications", isEditable: false },
      { id: "job-families", label: "Job Families", icon: Briefcase, description: "Job family hierarchy", isEditable: false },
    ]
  },
  {
    id: "talent-skills",
    label: "Talent & Skills Standards",
    description: "ESCO and ISCO aligned catalogs",
    isEditable: false,
    items: [
      { id: "skills", label: "Skills Library", icon: Target, description: "ESCO-aligned skills catalog", isEditable: false },
      { id: "occupations", label: "Occupations", icon: Users, description: "ISCO occupation codes", isEditable: false },
      { id: "competencies", label: "Competencies", icon: Award, description: "Competency framework", isEditable: false },
    ]
  },
  {
    id: "documents-compliance",
    label: "Documents & Compliance",
    description: "Document types and compliance requirements",
    isEditable: false,
    items: [
      { id: "document-types", label: "Document Types", icon: FileText, description: "HR document classifications", isEditable: false },
      { id: "government-ids", label: "Government IDs", icon: IdCard, description: "Country-specific ID types", isEditable: false },
      { id: "qualifications", label: "Qualifications", icon: GraduationCap, description: "Educational qualifications", isEditable: false },
      { id: "accrediting-bodies", label: "Accrediting Bodies", icon: Award, description: "Certification bodies", isEditable: false },
      { id: "institutions", label: "Educational Institutions", icon: School, description: "Universities and colleges", isEditable: false },
      { id: "csme-certificates", label: "CSME Certificates", icon: FileCheck, description: "Caribbean free movement", isEditable: false },
      { id: "immigration-docs", label: "Immigration Documents", icon: Plane, description: "Work permits & visas", isEditable: false },
      { id: "travel-documents", label: "Travel Documents", icon: Plane, description: "Passport & travel doc types", isEditable: false },
    ]
  },
  {
    id: "payroll-benefits",
    label: "Payroll & Benefits Standards",
    description: "Country-specific deductions and benefits",
    isEditable: false,
    items: [
      { id: "statutory-deductions", label: "Statutory Deductions", icon: Calculator, description: "Country-specific deductions", isEditable: false },
      { id: "leave-types", label: "Leave Types", icon: CalendarDays, description: "Leave classifications", isEditable: false },
      { id: "savings-programs", label: "Savings Programs", icon: PiggyBank, description: "Pension & savings types", isEditable: false },
      { id: "salary-advances", label: "Salary Advance Types", icon: Wallet, description: "Employee advance types", isEditable: false },
    ]
  },
  {
    id: "assets-property",
    label: "Assets & Property",
    description: "Equipment and property classifications",
    isEditable: false,
    items: [
      { id: "property-categories", label: "Property Categories", icon: Package, description: "IT & equipment categories", isEditable: false },
    ]
  },
];

const COMPONENT_MAP: Record<string, React.ComponentType<{ moduleFilter?: string }>> = {
  "org-positions": PositionsOrgTab,
  "org-companies": CompaniesOrgTab,
  "org-departments": DepartmentsOrgTab,
  "org-job-families": CompanyJobFamiliesTab,
  "org-export": OrgStructureExport,
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
  "institutions": InstitutionsTab,
  "csme-certificates": CSMECertificatesTab,
  "immigration-docs": ImmigrationDocTypesTab,
  "travel-documents": TravelDocumentsTab,
  "statutory-deductions": StatutoryDeductionsTab,
  "leave-types": LeaveTypesTab,
  "savings-programs": SavingsProgramsTab,
  "salary-advances": SalaryAdvanceTypesTab,
  "property-categories": PropertyCategoriesTab,
  "lookups": LookupValuesTab,
  "lookups-core-hr": LookupValuesTab,
  "lookups-payroll": LookupValuesTab,
  "lookups-workforce": LookupValuesTab,
  "lookups-learning": LookupValuesTab,
  "lookups-leave": LookupValuesTab,
};

export function ReferenceDataBrowser() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["configurable-lookups"]);
  
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    groupedResults,
    isSearching,
    totalResults,
    clearSearch,
    hasSearched,
  } = useGlobalReferenceSearch();

  const isSearchActive = debouncedQuery.length >= 2;

  const selectedItem = CATEGORY_GROUPS
    .flatMap(g => g.items)
    .find(item => item.id === selectedCategory);

  const SelectedComponent = selectedCategory ? COMPONENT_MAP[selectedCategory] : null;

  if (selectedCategory && SelectedComponent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCategory(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
          
          {selectedItem?.isEditable && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/lookup-values" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit in Admin
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-3 pb-2 border-b">
          {selectedItem && (
            <>
              <div className={cn(
                "p-2 rounded-lg",
                selectedItem.isEditable ? "bg-amber-500/10" : "bg-primary/10"
              )}>
                <selectedItem.icon className={cn(
                  "h-5 w-5",
                  selectedItem.isEditable ? "text-amber-600" : "text-primary"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{selectedItem.label}</h3>
                  {selectedItem.isEditable ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                      <Pencil className="h-3 w-3 mr-1" />
                      Configurable
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-muted text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Read-only
                    </Badge>
                  )}
                </div>
                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                )}
              </div>
            </>
          )}
        </div>

        {selectedItem?.isEditable && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <Pencil className="h-4 w-4 inline-block mr-2" />
              These values can be customized for your organization. To add, edit, or remove values, use the{" "}
              <Link to="/admin/lookup-values" className="font-medium underline hover:no-underline">
                Admin → Lookup Values
              </Link>{" "}
              page.
            </p>
          </div>
        )}

        <SelectedComponent moduleFilter={selectedItem?.moduleFilter} />
      </div>
    );
  }

  const handleNavigateToCategory = (categoryId: string) => {
    clearSearch();
    setSelectedCategory(categoryId);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Global Search Bar */}
        <GlobalReferenceSearch
          query={searchQuery}
          setQuery={setSearchQuery}
          isSearching={isSearching}
          totalResults={totalResults}
          onClear={clearSearch}
        />

        {/* Show search results or category browser */}
        {isSearchActive ? (
          <GlobalSearchResults
            groupedResults={groupedResults}
            query={debouncedQuery}
            onNavigateToCategory={handleNavigateToCategory}
            isSearching={isSearching}
            hasSearched={hasSearched}
          />
        ) : (
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
              className={cn(
                "border rounded-lg overflow-hidden",
                group.isEditable ? "border-amber-200 dark:border-amber-800" : ""
              )}
            >
              <AccordionTrigger className={cn(
                "px-4 py-3 hover:no-underline",
                group.isEditable 
                  ? "hover:bg-amber-50/50 dark:hover:bg-amber-950/20" 
                  : "hover:bg-muted/50"
              )}>
                <div className="flex items-center gap-2">
                  {group.isEditable ? (
                    <Pencil className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold">{group.label}</span>
                  {group.isEditable ? (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs font-normal">
                      Editable
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {group.items.length} {group.items.length === 1 ? "type" : "types"}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className={cn(
                "px-4 pb-4 pt-2",
                group.isEditable ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
              )}>
                {group.description && (
                  <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md group",
                            item.isEditable 
                              ? "hover:border-amber-400 border-amber-200/50" 
                              : "hover:border-primary/50"
                          )}
                          onClick={() => setSelectedCategory(item.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                item.isEditable 
                                  ? "bg-amber-100 group-hover:bg-amber-200 dark:bg-amber-900/30 dark:group-hover:bg-amber-900/50" 
                                  : "bg-primary/10 group-hover:bg-primary/20"
                              )}>
                                <item.icon className={cn(
                                  "h-5 w-5",
                                  item.isEditable ? "text-amber-600" : "text-primary"
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-medium text-sm">{item.label}</h4>
                                  <div className="flex items-center gap-1">
                                    {item.isEditable && (
                                      <Pencil className="h-3 w-3 text-amber-600" />
                                    )}
                                    <ChevronRight className={cn(
                                      "h-4 w-4 transition-colors",
                                      item.isEditable 
                                        ? "text-amber-400 group-hover:text-amber-600" 
                                        : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                  </div>
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
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {item.isEditable 
                          ? "Click to view values • Editable in Admin"
                          : "Click to view • Read-only standard codes"
                        }
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                
                {group.isEditable && (
                  <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800">
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <Link to="/admin/lookup-values">
                        <Pencil className="h-4 w-4" />
                        Manage All Lookup Values in Admin
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
          </Accordion>
        )}
      </div>
    </TooltipProvider>
  );
}
