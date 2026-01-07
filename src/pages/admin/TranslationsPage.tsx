import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useDatabaseTranslations, type Translation, type TranslationInput } from "@/hooks/useDatabaseTranslations";
import { supportedLanguages, type SupportedLanguage } from "@/i18n";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Languages,
  Plus,
  Search,
  Loader2,
  Check,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  Upload,
  FileJson,
  ChevronLeft,
  ChevronRight,
  Globe,
  Filter,
  Sparkles,
  Wand2,
} from "lucide-react";
import { generateTranslationRecords, getTranslationStats } from "@/lib/translationImporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { usePageAudit } from "@/hooks/usePageAudit";

const ITEMS_PER_PAGE = 20;
const AI_BATCH_SIZE = 20; // Process translations in batches

const emptyTranslation: TranslationInput = {
  translation_key: "",
  category: "common",
  en: "",
  ar: null,
  es: null,
  fr: null,
  nl: null,
  pt: null,
  de: null,
  ru: null,
  zh: null,
  description: null,
};

export default function TranslationsPage() {
  usePageAudit('translations', 'Admin');
  const { toast } = useToast();
  const {
    translations,
    isLoading,
    categories,
    addTranslation,
    updateTranslation,
    deleteTranslation,
    bulkImport,
    getMissingCounts,
    fetchTranslations,
  } = useDatabaseTranslations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("__all__");
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "incomplete">("all");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [formData, setFormData] = useState<TranslationInput>(emptyTranslation);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Inline editing state
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState("");
  
  // AI translation state
  const [isAITranslating, setIsAITranslating] = useState(false);
  const [aiProgress, setAiProgress] = useState({ current: 0, total: 0 });
  const [showAIDialog, setShowAIDialog] = useState(false);

  const missingCounts = useMemo(() => getMissingCounts(), [getMissingCounts]);

  // Calculate completion percentage for each language
  const languageProgress = useMemo(() => {
    const total = translations.length;
    if (total === 0) return {};
    
    return supportedLanguages.reduce((acc, lang) => {
      const completed = translations.filter(t => {
        const value = t[lang.code as keyof Translation];
        return value && value !== "";
      }).length;
      acc[lang.code] = Math.round((completed / total) * 100);
      return acc;
    }, {} as Record<string, number>);
  }, [translations]);

  const filteredTranslations = useMemo(() => {
    return translations.filter((t) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesKey = t.translation_key.toLowerCase().includes(query);
        const matchesEn = t.en.toLowerCase().includes(query);
        const matchesSelected = (t[selectedLanguage as keyof Translation] as string || "").toLowerCase().includes(query);
        if (!matchesKey && !matchesEn && !matchesSelected) return false;
      }

      // Category filter
      if (filterCategory !== "__all__" && t.category !== filterCategory) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all") {
        const value = t[selectedLanguage as keyof Translation];
        const isComplete = value && value !== "";
        if (filterStatus === "complete" && !isComplete) return false;
        if (filterStatus === "incomplete" && isComplete) return false;
      }

      return true;
    });
  }, [translations, searchQuery, filterCategory, filterStatus, selectedLanguage]);

  // Pagination
  const totalPages = Math.ceil(filteredTranslations.length / ITEMS_PER_PAGE);
  const paginatedTranslations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTranslations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTranslations, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus, selectedLanguage]);

  const handleOpenDialog = (translation?: Translation) => {
    if (translation) {
      setEditingTranslation(translation);
      setFormData({
        translation_key: translation.translation_key,
        category: translation.category,
        en: translation.en,
        ar: translation.ar,
        es: translation.es,
        fr: translation.fr,
        nl: translation.nl,
        pt: translation.pt,
        de: translation.de,
        ru: translation.ru,
        zh: translation.zh,
        description: translation.description,
      });
    } else {
      setEditingTranslation(null);
      setFormData(emptyTranslation);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTranslation(null);
    setFormData(emptyTranslation);
  };

  const handleSubmit = async () => {
    if (!formData.translation_key || !formData.en) {
      toast({
        title: "Validation Error",
        description: "Key and English text are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingTranslation) {
        await updateTranslation(editingTranslation.id, formData);
        toast({ title: "Translation updated" });
      } else {
        await addTranslation(formData);
        toast({ title: "Translation added" });
      }
      handleCloseDialog();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save translation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this translation?")) return;
    try {
      await deleteTranslation(id);
      toast({ title: "Translation deleted" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete translation",
        variant: "destructive",
      });
    }
  };

  // Inline editing handlers
  const startInlineEdit = (translation: Translation) => {
    setEditingInlineId(translation.id);
    setInlineValue((translation[selectedLanguage as keyof Translation] as string) || "");
  };

  const cancelInlineEdit = () => {
    setEditingInlineId(null);
    setInlineValue("");
  };

  const saveInlineEdit = async (id: string) => {
    try {
      await updateTranslation(id, { [selectedLanguage]: inlineValue || null });
      toast({ title: "Translation saved" });
      setEditingInlineId(null);
      setInlineValue("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save",
        variant: "destructive",
      });
    }
  };

  const importStats = useMemo(() => getTranslationStats(), []);

  const handleImportFromFiles = async () => {
    setIsImporting(true);
    try {
      const records = generateTranslationRecords();
      await bulkImport(records);
      toast({
        title: "Import successful",
        description: `Imported ${records.length} translations from JSON files`,
      });
      setShowImportDialog(false);
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Failed to import translations",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Get missing translations for the selected language
  const missingTranslations = useMemo(() => {
    if (selectedLanguage === "en") return [];
    return translations.filter(t => {
      const value = t[selectedLanguage as keyof Translation];
      return !value || value === "";
    });
  }, [translations, selectedLanguage]);

  // AI Translation handler
  const handleAITranslate = async () => {
    if (selectedLanguage === "en") {
      toast({
        title: "Cannot translate",
        description: "English is the source language. Select another language to translate.",
        variant: "destructive",
      });
      return;
    }

    if (missingTranslations.length === 0) {
      toast({
        title: "All translated",
        description: `All translations are complete for ${currentLang?.nativeName}`,
      });
      return;
    }

    setShowAIDialog(true);
  };

  const executeAITranslation = async () => {
    setShowAIDialog(false);
    setIsAITranslating(true);
    setAiProgress({ current: 0, total: missingTranslations.length });

    const targetLang = supportedLanguages.find(l => l.code === selectedLanguage);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process in batches
      for (let i = 0; i < missingTranslations.length; i += AI_BATCH_SIZE) {
        const batch = missingTranslations.slice(i, i + AI_BATCH_SIZE);
        
        const { data, error } = await supabase.functions.invoke('ai-translate', {
          body: {
            translations: batch.map(t => ({
              id: t.id,
              key: t.translation_key,
              sourceText: t.en,
            })),
            targetLanguage: selectedLanguage,
            targetLanguageName: targetLang?.name || selectedLanguage,
          },
        });

        if (error) {
          console.error('AI translation error:', error);
          
          // Check for specific error types
          if (error.message?.includes('402') || error.message?.includes('credits exhausted')) {
            toast({
              title: "AI Credits Exhausted",
              description: "Please add funds to your Lovable workspace to continue using AI translations.",
              variant: "destructive",
            });
            setIsAITranslating(false);
            setAiProgress({ current: 0, total: 0 });
            return;
          }
          
          if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
            toast({
              title: "Rate Limited",
              description: "Too many requests. Please wait a moment and try again.",
              variant: "destructive",
            });
            setIsAITranslating(false);
            setAiProgress({ current: 0, total: 0 });
            return;
          }
          
          errorCount += batch.length;
          continue;
        }

        if (data?.translations) {
          // Update each translation in the database
          for (const item of data.translations) {
            try {
              await updateTranslation(item.id, { [selectedLanguage]: item.translation });
              successCount++;
            } catch (updateErr) {
              console.error('Update error:', updateErr);
              errorCount++;
            }
          }
        }

        setAiProgress({ current: Math.min(i + AI_BATCH_SIZE, missingTranslations.length), total: missingTranslations.length });
      }

      // Refresh the translations
      await fetchTranslations();

      if (successCount > 0) {
        toast({
          title: "AI Translation Complete",
          description: `Successfully translated ${successCount} items to ${targetLang?.nativeName}${errorCount > 0 ? `. ${errorCount} failed.` : ''}`,
        });
      } else {
        toast({
          title: "Translation failed",
          description: "No translations were completed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('AI translation error:', err);
      toast({
        title: "Translation failed",
        description: err.message || "Failed to complete AI translation",
        variant: "destructive",
      });
    } finally {
      setIsAITranslating(false);
      setAiProgress({ current: 0, total: 0 });
    }
  };

  const currentLang = supportedLanguages.find(l => l.code === selectedLanguage);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Translations" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Translations
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage i18n translations • {translations.length} keys across {supportedLanguages.length} languages
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedLanguage !== "en" && missingTranslations.length > 0 && (
              <Button 
                onClick={handleAITranslate}
                disabled={isAITranslating}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isAITranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating {aiProgress.current}/{aiProgress.total}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Translate ({missingTranslations.length} missing)
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <FileJson className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Key
            </Button>
          </div>
        </div>

        {/* Language Tabs with Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Select Language to Edit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as SupportedLanguage)}>
              <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                {supportedLanguages.map((lang) => {
                  const progress = languageProgress[lang.code] || 0;
                  const isComplete = progress === 100;
                  
                  return (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      className={cn(
                        "relative flex flex-col items-start gap-1 px-4 py-3 h-auto rounded-lg border",
                        "data-[state=active]:bg-primary/10 data-[state=active]:border-primary",
                        "data-[state=inactive]:bg-card data-[state=inactive]:border-border",
                        "min-w-[120px]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-sm">{lang.nativeName}</span>
                        {isComplete ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        )}
                      </div>
                      <Progress 
                        value={progress} 
                        className={cn(
                          "h-1.5 w-full",
                          isComplete ? "[&>div]:bg-success" : "[&>div]:bg-primary"
                        )} 
                      />
                      <span className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by key or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as "all" | "complete" | "incomplete")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">
                  <span className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-success" /> Translated
                  </span>
                </SelectItem>
                <SelectItem value="incomplete">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-warning" /> Missing
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {paginatedTranslations.length} of {filteredTranslations.length} translations
            {selectedLanguage !== "en" && (
              <span className="ml-2">
                • {missingCounts[selectedLanguage]} missing in {currentLang?.nativeName}
              </span>
            )}
          </span>
        </div>

        {/* Translation List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTranslations.length === 0 ? (
          <Card className="p-12 text-center">
            <Languages className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery || filterCategory !== "__all__" || filterStatus !== "all"
                ? "No translations match your filters."
                : "No translations yet. Add your first translation."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {paginatedTranslations.map((translation) => {
              const selectedValue = translation[selectedLanguage as keyof Translation] as string;
              const isTranslated = selectedValue && selectedValue !== "";
              const isEditing = editingInlineId === translation.id;

              return (
                <Card 
                  key={translation.id}
                  className={cn(
                    "transition-all",
                    !isTranslated && selectedLanguage !== "en" && "border-warning/30 bg-warning/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground">
                              {translation.translation_key}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {translation.category}
                            </Badge>
                            {!isTranslated && selectedLanguage !== "en" && (
                              <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                                Missing
                              </Badge>
                            )}
                          </div>
                          {translation.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {translation.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(translation)}
                            className="h-8 w-8 p-0"
                            title="Edit all languages"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(translation.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* English Source */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="font-semibold">EN</span> English (Source)
                          </Label>
                          <div className="bg-muted/50 rounded-md p-2.5 text-sm min-h-[40px]">
                            {translation.en}
                          </div>
                        </div>

                        {/* Selected Language */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="font-semibold">{selectedLanguage.toUpperCase()}</span> 
                            {currentLang?.nativeName}
                            {selectedLanguage === "en" && " (Source)"}
                          </Label>
                          
                          {selectedLanguage === "en" ? (
                            <div className="bg-muted/50 rounded-md p-2.5 text-sm min-h-[40px]">
                              {translation.en}
                            </div>
                          ) : isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={inlineValue}
                                onChange={(e) => setInlineValue(e.target.value)}
                                dir={currentLang?.dir}
                                className="min-h-[40px] text-sm"
                                placeholder={`Enter ${currentLang?.name} translation...`}
                                autoFocus
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelInlineEdit}
                                  className="h-7"
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => saveInlineEdit(translation.id)}
                                  className="h-7"
                                >
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={cn(
                                "rounded-md p-2.5 text-sm min-h-[40px] cursor-pointer transition-colors",
                                "hover:bg-primary/5 border border-transparent hover:border-primary/20",
                                isTranslated ? "bg-background" : "bg-warning/10 border-warning/20"
                              )}
                              onClick={() => startInlineEdit(translation)}
                              dir={currentLang?.dir}
                            >
                              {isTranslated ? (
                                selectedValue
                              ) : (
                                <span className="text-muted-foreground italic flex items-center gap-2">
                                  <Plus className="h-3.5 w-3.5" />
                                  Click to add translation
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? "Edit Translation" : "Add Translation"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Key and Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Translation Key *</Label>
                <Input
                  placeholder="common.save"
                  value={formData.translation_key}
                  onChange={(e) =>
                    setFormData({ ...formData, translation_key: e.target.value })
                  }
                  disabled={!!editingTranslation}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="common"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Context or usage notes for translators"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value || null })
                }
              />
            </div>

            {/* Language Tabs for translations */}
            <Tabs defaultValue="en" className="space-y-4">
              <TabsList className="flex flex-wrap h-auto gap-1">
                {supportedLanguages.map((lang) => {
                  const value = formData[lang.code as keyof TranslationInput] as string;
                  const hasValue = value && value !== "";
                  
                  return (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      className="relative"
                    >
                      {lang.code.toUpperCase()}
                      {!hasValue && lang.code !== "en" && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-warning" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {supportedLanguages.map((lang) => (
                <TabsContent key={lang.code} value={lang.code} className="mt-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {lang.nativeName} ({lang.name})
                      {lang.code === "en" && (
                        <span className="text-xs text-destructive">* Required</span>
                      )}
                    </Label>
                    <Textarea
                      placeholder={`Enter ${lang.name} translation...`}
                      value={(formData[lang.code as keyof TranslationInput] as string) || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [lang.code]: e.target.value || null,
                        })
                      }
                      rows={4}
                      dir={lang.dir}
                      className="resize-none"
                    />
                    {lang.code !== "en" && formData.en && (
                      <div className="bg-muted/50 rounded-md p-3 text-sm">
                        <p className="text-xs text-muted-foreground mb-1">English source:</p>
                        <p>{formData.en}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingTranslation ? "Save Changes" : "Add Translation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Translations from JSON Files</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              This will import all translations from the existing i18n JSON files into the database.
              Existing translations with the same key will be updated.
            </p>
            
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <h4 className="font-medium text-sm">Import Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Total keys:</span>
                <span className="font-medium">{importStats.total}</span>
                
                <span className="text-muted-foreground">Categories:</span>
                <span className="font-medium">{importStats.categories.length}</span>
              </div>
              
              <div className="pt-2 border-t">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">Translations per language:</h5>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {Object.entries(importStats.languageCounts).map(([lang, count]) => (
                    <div key={lang} className="flex justify-between">
                      <span className="text-muted-foreground uppercase">{lang}:</span>
                      <span className={cn(
                        "font-medium",
                        count === importStats.total ? "text-success" : "text-warning"
                      )}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {translations.length > 0 && (
              <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-sm text-warning">
                    You have {translations.length} existing translations. Import will update matching keys and add new ones.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportFromFiles} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importStats.total} Translations
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Translation Confirmation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              AI Translation
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Auto-translate with AI</h4>
                <p className="text-sm text-muted-foreground">
                  Use AI to translate {missingTranslations.length} missing entries to {currentLang?.nativeName}
                </p>
              </div>
            </div>
            
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <h4 className="font-medium text-sm">What will happen:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  AI will translate each English text to {currentLang?.nativeName}
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Translations will be saved automatically to the database
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  You can edit any translation afterward if needed
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  AI translations should be reviewed for accuracy, especially for specialized terms or context-specific text.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeAITranslation}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start AI Translation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
