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
  X,
  Check,
  AlertCircle,
  Pencil,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { toast } = useToast();
  const {
    translations,
    isLoading,
    categories,
    addTranslation,
    updateTranslation,
    deleteTranslation,
    getMissingCounts,
  } = useDatabaseTranslations();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("__all__");
  const [filterMissing, setFilterMissing] = useState<SupportedLanguage | "__all__">("__all__");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [formData, setFormData] = useState<TranslationInput>(emptyTranslation);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const missingCounts = useMemo(() => getMissingCounts(), [getMissingCounts]);

  const filteredTranslations = useMemo(() => {
    return translations.filter((t) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesKey = t.translation_key.toLowerCase().includes(query);
        const matchesValue = Object.values(t).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(query)
        );
        if (!matchesKey && !matchesValue) return false;
      }

      // Category filter
      if (filterCategory !== "__all__" && t.category !== filterCategory) {
        return false;
      }

      // Missing translation filter
      if (filterMissing !== "__all__") {
        const value = t[filterMissing as keyof Translation];
        if (value && value !== "") return false;
      }

      return true;
    });
  }, [translations, searchQuery, filterCategory, filterMissing]);

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

  const getMissingLanguages = (translation: Translation): string[] => {
    return supportedLanguages
      .filter((lang) => {
        if (lang.code === "en") return false; // English is required
        const value = translation[lang.code as keyof Translation];
        return !value || value === "";
      })
      .map((lang) => lang.code);
  };

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
              Manage i18n translations across all languages
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Translation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  {translations.length}
                </p>
              </div>
              <Languages className="h-8 w-8 text-primary/50" />
            </div>
          </div>
          {supportedLanguages.slice(1, 5).map((lang) => (
            <div
              key={lang.code}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {lang.nativeName} Missing
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-bold",
                      missingCounts[lang.code as SupportedLanguage] > 0
                        ? "text-warning"
                        : "text-success"
                    )}
                  >
                    {missingCounts[lang.code as SupportedLanguage]}
                  </p>
                </div>
                {missingCounts[lang.code as SupportedLanguage] > 0 ? (
                  <AlertCircle className="h-8 w-8 text-warning/50" />
                ) : (
                  <Check className="h-8 w-8 text-success/50" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search translations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
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
            <Select
              value={filterMissing}
              onValueChange={(v) => setFilterMissing(v as SupportedLanguage | "__all__")}
            >
              <SelectTrigger className="w-[180px]">
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Missing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Translations</SelectItem>
                {supportedLanguages.slice(1).map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    Missing {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTranslations.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <Languages className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery || filterCategory !== "__all__" || filterMissing !== "__all__"
                ? "No translations match your filters."
                : "No translations yet. Add your first translation."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Key</TableHead>
                    <TableHead className="w-[100px]">Category</TableHead>
                    <TableHead>English</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((translation) => {
                    const missing = getMissingLanguages(translation);
                    const isExpanded = expandedRow === translation.id;

                    return (
                      <>
                        <TableRow
                          key={translation.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            setExpandedRow(isExpanded ? null : translation.id)
                          }
                        >
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              {translation.translation_key}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{translation.category}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {translation.en}
                          </TableCell>
                          <TableCell>
                            {missing.length === 0 ? (
                              <Badge className="bg-success/10 text-success border-success/20">
                                Complete
                              </Badge>
                            ) : (
                              <Badge className="bg-warning/10 text-warning border-warning/20">
                                {missing.length} missing
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDialog(translation);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(translation.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={5} className="p-4">
                              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {supportedLanguages.map((lang) => {
                                  const value =
                                    translation[lang.code as keyof Translation] as string;
                                  const isMissing = lang.code !== "en" && (!value || value === "");

                                  return (
                                    <div
                                      key={lang.code}
                                      className={cn(
                                        "rounded-lg border p-3",
                                        isMissing
                                          ? "border-warning/50 bg-warning/5"
                                          : "border-border bg-background"
                                      )}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          {lang.nativeName}
                                        </span>
                                        {isMissing && (
                                          <AlertCircle className="h-3 w-3 text-warning" />
                                        )}
                                      </div>
                                      <p className="text-sm">
                                        {value || (
                                          <span className="italic text-muted-foreground">
                                            Not translated
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                              {translation.description && (
                                <p className="mt-3 text-xs text-muted-foreground">
                                  <strong>Note:</strong> {translation.description}
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? "Edit Translation" : "Add Translation"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Translations</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {supportedLanguages.map((lang) => (
                  <div key={lang.code} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {lang.nativeName}
                      {lang.code === "en" && (
                        <span className="text-xs text-destructive">*</span>
                      )}
                    </Label>
                    <Textarea
                      placeholder={`Translation in ${lang.name}`}
                      value={(formData[lang.code as keyof TranslationInput] as string) || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [lang.code]: e.target.value || null,
                        })
                      }
                      rows={2}
                      dir={lang.dir}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
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
    </AppLayout>
  );
}
