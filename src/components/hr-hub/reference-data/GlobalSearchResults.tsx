import { useMemo } from "react";
import { SearchResult } from "@/hooks/useGlobalReferenceSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Copy, Check, ChevronRight, Lock, Pencil, 
  Globe, Coins, Languages, List, Building2, 
  Briefcase, Target, FileText, IdCard, GraduationCap, 
  Award, Calculator, CalendarDays, Users, Package, School
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface GlobalSearchResultsProps {
  groupedResults: Record<string, SearchResult[]>;
  query: string;
  onNavigateToCategory: (categoryId: string) => void;
  isSearching: boolean;
  hasSearched: boolean;
}

// Map categories to their icon components
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  countries: Globe,
  currencies: Coins,
  languages: Languages,
  lookup_values: List,
  positions: Users,
  companies: Building2,
  departments: Building2,
  master_skills_library: Target,
  master_competencies_library: Award,
  occupations: Users,
  document_types: FileText,
  government_id_types: IdCard,
  qualification_types: GraduationCap,
  accrediting_bodies: Award,
  institutions: School,
  statutory_deductions: Calculator,
  leave_types: CalendarDays,
  master_job_families: Briefcase,
  property_categories: Package,
  industries: Building2,
};

// Map database category keys to UI navigation IDs
const CATEGORY_NAV_MAP: Record<string, string> = {
  countries: "countries",
  currencies: "currencies",
  languages: "languages",
  lookup_values: "lookups",
  positions: "org-positions",
  companies: "org-companies",
  departments: "org-departments",
  master_skills_library: "skills",
  master_competencies_library: "competencies",
  occupations: "occupations",
  document_types: "document-types",
  government_id_types: "government-ids",
  qualification_types: "qualifications",
  accrediting_bodies: "accrediting-bodies",
  institutions: "institutions",
  statutory_deductions: "statutory-deductions",
  leave_types: "leave-types",
  master_job_families: "job-families",
  property_categories: "property-categories",
  industries: "industries",
};

// Highlight matching text in search results
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function GlobalSearchResults({
  groupedResults,
  query,
  onNavigateToCategory,
  isSearching,
  hasSearched,
}: GlobalSearchResultsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  // Sort categories by number of results (most first)
  const sortedCategories = useMemo(() => {
    return Object.entries(groupedResults)
      .sort(([, a], [, b]) => b.length - a.length);
  }, [groupedResults]);

  const totalResults = useMemo(() => {
    return Object.values(groupedResults).reduce((sum, results) => sum + results.length, 0);
  }, [groupedResults]);

  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Searching across all categories...</p>
        </div>
      </div>
    );
  }

  if (hasSearched && totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          No reference data matches "{query}". Try a different search term or browse categories below.
        </p>
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-medium text-foreground">{totalResults}</span> results across{" "}
          <span className="font-medium text-foreground">{sortedCategories.length}</span> categories
        </p>
      </div>

      <div className="grid gap-3">
        {sortedCategories.map(([category, results]) => {
          const IconComponent = CATEGORY_ICONS[category] || List;
          const isEditable = results[0]?.isEditable ?? false;
          const navId = CATEGORY_NAV_MAP[category] || category;

          return (
            <Card key={category} className={cn(
              "overflow-hidden transition-all",
              isEditable ? "border-amber-200/50 dark:border-amber-800/50" : ""
            )}>
              <CardHeader className={cn(
                "py-3 px-4 flex flex-row items-center justify-between",
                isEditable ? "bg-amber-50/50 dark:bg-amber-950/20" : "bg-muted/30"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    isEditable ? "bg-amber-100 dark:bg-amber-900/30" : "bg-primary/10"
                  )}>
                    <IconComponent className={cn(
                      "h-4 w-4",
                      isEditable ? "text-amber-600" : "text-primary"
                    )} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{results[0]?.categoryLabel}</span>
                    <Badge variant="secondary" className="text-xs">
                      {results.length} {results.length === 1 ? "match" : "matches"}
                    </Badge>
                    {isEditable ? (
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
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-xs"
                  onClick={() => onNavigateToCategory(navId)}
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {results.map((result) => (
                    <div 
                      key={`${result.category}-${result.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onNavigateToCategory(navId)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {result.code && (
                          <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono shrink-0">
                            <HighlightedText text={result.code} query={query} />
                          </code>
                        )}
                        <span className="text-sm truncate">
                          <HighlightedText text={result.name} query={query} />
                        </span>
                        {result.extra && (
                          <span className="text-xs text-muted-foreground truncate">
                            • {result.extra}
                          </span>
                        )}
                      </div>
                      {result.code && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => handleCopyCode(result.code, e)}
                        >
                          {copiedCode === result.code ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
