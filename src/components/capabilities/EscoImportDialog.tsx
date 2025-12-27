import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Loader2,
  Download,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Briefcase,
  ExternalLink,
  Info,
} from "lucide-react";
import { useEscoIntegration, EscoSkill, EscoOccupation } from "@/hooks/useEscoIntegration";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "el", name: "Greek" },
  { code: "et", name: "Estonian" },
  { code: "fi", name: "Finnish" },
  { code: "hr", name: "Croatian" },
  { code: "hu", name: "Hungarian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lv", name: "Latvian" },
  { code: "mt", name: "Maltese" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "sv", name: "Swedish" },
];

interface EscoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onImportComplete: () => void;
}

export function EscoImportDialog({
  open,
  onOpenChange,
  companyId,
  onImportComplete,
}: EscoImportDialogProps) {
  const { user, profile } = useAuth();
  const {
    loading,
    searchSkills,
    searchOccupations,
    getOccupationSkills,
    checkDuplicates,
    importSkills,
    clearResults,
  } = useEscoIntegration();

  const [activeTab, setActiveTab] = useState<"skills" | "occupations">("skills");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [skills, setSkills] = useState<EscoSkill[]>([]);
  const [occupations, setOccupations] = useState<EscoOccupation[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedOccupation, setSelectedOccupation] = useState<EscoOccupation | null>(null);
  const [occupationSkillsData, setOccupationSkillsData] = useState<EscoSkill[]>([]);
  const [duplicateInfo, setDuplicateInfo] = useState<Map<string, { id: string; name: string }>>(new Map());
  const [step, setStep] = useState<"search" | "preview" | "importing">("search");
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSearchQuery("");
      setSkills([]);
      setOccupations([]);
      setSelectedSkills(new Set());
      setSelectedOccupation(null);
      setOccupationSkillsData([]);
      setDuplicateInfo(new Map());
      setStep("search");
      setHasSearched(false);
      clearResults();
    }
  }, [open, clearResults]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setHasSearched(true);
    if (activeTab === "skills") {
      const result = await searchSkills(searchQuery, language, 30);
      setSkills(result.skills);
      setTotalResults(result.total);
    } else {
      const result = await searchOccupations(searchQuery, language, 20);
      setOccupations(result.occupations);
      setTotalResults(result.total);
    }
  };

  const handleOccupationSelect = async (occupation: EscoOccupation) => {
    setSelectedOccupation(occupation);
    const skills = await getOccupationSkills(occupation.uri, language);
    setOccupationSkillsData(skills);
    setSelectedSkills(new Set(skills.map((s) => s.uri)));
  };

  const toggleSkillSelection = (uri: string) => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uri)) {
        newSet.delete(uri);
      } else {
        newSet.add(uri);
      }
      return newSet;
    });
  };

  const selectAllSkills = () => {
    const allUris = (activeTab === "skills" || !selectedOccupation ? skills : occupationSkillsData).map((s) => s.uri);
    setSelectedSkills(new Set(allUris));
  };

  const deselectAllSkills = () => {
    setSelectedSkills(new Set());
  };

  const handlePreview = async () => {
    const skillsToCheck = (activeTab === "skills" || !selectedOccupation ? skills : occupationSkillsData)
      .filter((s) => selectedSkills.has(s.uri));
    
    if (skillsToCheck.length === 0) return;
    
    const results = await checkDuplicates(skillsToCheck, companyId);
    const dupMap = new Map<string, { id: string; name: string }>();
    results.forEach((r) => {
      if (r.duplicateId) {
        dupMap.set(r.skill.uri, { id: r.duplicateId, name: r.duplicateName || "" });
      }
    });
    setDuplicateInfo(dupMap);
    setStep("preview");
  };

  const handleImport = async () => {
    if (!user || !companyId) return;
    
    setStep("importing");
    
    const skillsToImport = (activeTab === "skills" || !selectedOccupation ? skills : occupationSkillsData)
      .filter((s) => selectedSkills.has(s.uri) && !duplicateInfo.has(s.uri));
    
    const result = await importSkills(
      skillsToImport,
      companyId,
      user.id,
      language,
      selectedOccupation ? { uri: selectedOccupation.uri, label: selectedOccupation.title } : undefined
    );
    
    if (result.imported > 0) {
      onImportComplete();
      onOpenChange(false);
    } else {
      setStep("preview");
    }
  };

  const currentSkillsList = activeTab === "skills" || !selectedOccupation ? skills : occupationSkillsData;
  const selectedCount = selectedSkills.size;
  const duplicateCount = [...selectedSkills].filter((uri) => duplicateInfo.has(uri)).length;
  const newSkillsCount = selectedCount - duplicateCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>Import from ESCO</DialogTitle>
              <DialogDescription>
                Import skills from the European Skills, Competences, and Occupations classification
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "search" && (
          <div className="space-y-4">
            {/* Language & Search */}
            <div className="flex gap-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[140px]">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={activeTab === "skills" ? "Search skills (e.g., Python, project management)..." : "Search occupations (e.g., Software Developer)..."}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="skills" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Search Skills
                </TabsTrigger>
                <TabsTrigger value="occupations" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Browse by Occupation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-4">
                {hasSearched && skills.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No skills found for "{searchQuery}"</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
                
                {skills.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        Showing {skills.length} of {totalResults} results
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAllSkills}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAllSkills}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[350px] border rounded-lg p-2">
                      <div className="space-y-2">
                        {skills.map((skill) => (
                          <div
                            key={skill.uri}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedSkills.has(skill.uri)
                                ? "bg-primary/5 border-primary/30"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => toggleSkillSelection(skill.uri)}
                          >
                            <Checkbox
                              checked={selectedSkills.has(skill.uri)}
                              onCheckedChange={() => toggleSkillSelection(skill.uri)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{skill.title}</span>
                                {skill.skillType && (
                                  <Badge variant="outline" className="text-xs">
                                    {skill.skillType}
                                  </Badge>
                                )}
                              </div>
                              {skill.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={skill.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>View in ESCO</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </TabsContent>

              <TabsContent value="occupations" className="mt-4">
                {selectedOccupation ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOccupation(null);
                            setOccupationSkillsData([]);
                            setSelectedSkills(new Set());
                          }}
                        >
                          ← Back to occupations
                        </Button>
                        <Badge variant="secondary">{selectedOccupation.title}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAllSkills}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAllSkills}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : occupationSkillsData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No skills found for this occupation</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] border rounded-lg p-2">
                        <div className="space-y-2">
                          {occupationSkillsData.map((skill) => (
                            <div
                              key={skill.uri}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedSkills.has(skill.uri)
                                  ? "bg-primary/5 border-primary/30"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => toggleSkillSelection(skill.uri)}
                            >
                              <Checkbox
                                checked={selectedSkills.has(skill.uri)}
                                onCheckedChange={() => toggleSkillSelection(skill.uri)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{skill.title}</span>
                                  <Badge
                                    variant={skill.skillType === "essential" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {skill.skillType}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                ) : (
                  <>
                    {hasSearched && occupations.length === 0 && !loading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No occupations found for "{searchQuery}"</p>
                      </div>
                    )}
                    
                    {occupations.length > 0 && (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">
                          Showing {occupations.length} of {totalResults} results. Click to view related skills.
                        </p>
                        <ScrollArea className="h-[350px] border rounded-lg p-2">
                          <div className="space-y-2">
                            {occupations.map((occupation) => (
                              <div
                                key={occupation.uri}
                                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleOccupationSelect(occupation)}
                              >
                                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">{occupation.title}</span>
                                  {occupation.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                      {occupation.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Data from ESCO (European Commission)</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePreview}
                  disabled={selectedCount === 0 || loading}
                >
                  Preview Import ({selectedCount})
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{newSkillsCount}</p>
                <p className="text-sm text-muted-foreground">New skills</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{duplicateCount}</p>
                <p className="text-sm text-muted-foreground">Duplicates (skip)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{selectedCount}</p>
                <p className="text-sm text-muted-foreground">Total selected</p>
              </div>
            </div>

            <ScrollArea className="h-[350px] border rounded-lg p-2">
              <div className="space-y-2">
                {currentSkillsList
                  .filter((s) => selectedSkills.has(s.uri))
                  .map((skill) => {
                    const isDuplicate = duplicateInfo.has(skill.uri);
                    const dupInfo = duplicateInfo.get(skill.uri);
                    
                    return (
                      <div
                        key={skill.uri}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isDuplicate ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : ""
                        }`}
                      >
                        {isDuplicate ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{skill.title}</span>
                          {isDuplicate && (
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              Already exists as "{dupInfo?.name}" - will be skipped
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("search")}>
                ← Back to Search
              </Button>
              <Button
                onClick={handleImport}
                disabled={newSkillsCount === 0 || loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Import {newSkillsCount} Skill(s)
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Importing skills...</p>
            <p className="text-sm text-muted-foreground">
              This may take a moment
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
