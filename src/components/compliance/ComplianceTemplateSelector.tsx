import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useComplianceTemplates, ComplianceTemplate } from "@/hooks/useComplianceDocument";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileText, Scale, Search, Globe, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceTemplateSelectorProps {
  onSelect: (template: ComplianceTemplate) => void;
  selectedTemplateId?: string;
  category?: string;
  jurisdiction?: string;
  countryCode?: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "disciplinary", label: "Disciplinary" },
  { value: "performance", label: "Performance" },
  { value: "separation", label: "Separation" },
  { value: "grievance", label: "Grievance" },
  { value: "employment", label: "Employment" },
];

const JURISDICTIONS = [
  { value: "all", label: "All Regions" },
  { value: "caribbean", label: "Caribbean" },
  { value: "africa", label: "Africa" },
  { value: "global", label: "Global" },
];

const COUNTRIES = [
  { value: "all", label: "All Countries" },
  { value: "TT", label: "Trinidad & Tobago" },
  { value: "JM", label: "Jamaica" },
  { value: "BB", label: "Barbados" },
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
];

export function ComplianceTemplateSelector({
  onSelect,
  selectedTemplateId,
  category: initialCategory,
  jurisdiction: initialJurisdiction,
  countryCode: initialCountryCode,
}: ComplianceTemplateSelectorProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(initialJurisdiction || "all");
  const [selectedCountry, setSelectedCountry] = useState(initialCountryCode || "all");

  const { data: templates = [], isLoading } = useComplianceTemplates({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    jurisdiction: selectedJurisdiction !== "all" ? selectedJurisdiction : undefined,
    countryCode: selectedCountry !== "all" ? selectedCountry : undefined,
  });

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      disciplinary: "bg-destructive/10 text-destructive",
      performance: "bg-blue-500/10 text-blue-600",
      separation: "bg-orange-500/10 text-orange-600",
      grievance: "bg-purple-500/10 text-purple-600",
      employment: "bg-green-500/10 text-green-600",
    };
    return colors[cat] || "bg-muted text-muted-foreground";
  };

  const getJurisdictionIcon = (jurisdiction: string) => {
    return jurisdiction === "global" ? Globe : MapPin;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("compliance.searchTemplates", "Search templates...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JURISDICTIONS.map((jur) => (
              <SelectItem key={jur.value} value={jur.value}>
                {jur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[400px] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <FileText className="h-10 w-10 mb-2 opacity-50" />
            <p>{t("compliance.noTemplatesFound", "No templates found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => {
              const JurisdictionIcon = getJurisdictionIcon(template.jurisdiction);
              const isSelected = template.id === selectedTemplateId;

              return (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                    isSelected && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => onSelect(template)}
                >
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Scale className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{template.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <JurisdictionIcon className="h-3 w-3 mr-1" />
                        {template.country_code || template.jurisdiction}
                      </Badge>
                      {template.legal_reference && (
                        <Badge variant="secondary" className="text-xs">
                          {template.legal_reference.length > 25
                            ? template.legal_reference.slice(0, 25) + "..."
                            : template.legal_reference}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
