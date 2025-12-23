import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ISO_LANGUAGES, NUMERIC_PROFICIENCY, CEFR_PROFICIENCY, LANGUAGE_CERTIFICATIONS, ProficiencyScale } from "@/constants/languageConstants";

export interface LanguageFormData {
  language_code: string;
  language_name: string;
  proficiency_scale: ProficiencyScale;
  overall_proficiency: string;
  speaking_proficiency: string;
  reading_proficiency: string;
  writing_proficiency: string;
  certification_exam: string;
  certification_score: string;
  effective_date: string;
  expiry_date: string;
  is_primary: boolean;
  is_native: boolean;
  notes: string;
}

interface LanguageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LanguageFormData) => void;
  initialData?: Partial<LanguageFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
  viewType?: "hr" | "manager" | "ess";
}

const getDefaultFormData = (): LanguageFormData => ({
  language_code: "",
  language_name: "",
  proficiency_scale: "numeric",
  overall_proficiency: "",
  speaking_proficiency: "",
  reading_proficiency: "",
  writing_proficiency: "",
  certification_exam: "",
  certification_score: "",
  effective_date: "",
  expiry_date: "",
  is_primary: false,
  is_native: false,
  notes: "",
});

export function LanguageFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
  viewType = "hr",
}: LanguageFormDialogProps) {
  const [formData, setFormData] = useState<LanguageFormData>(getDefaultFormData());

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...getDefaultFormData(),
          ...initialData,
          proficiency_scale: (initialData.proficiency_scale as ProficiencyScale) || "numeric",
        });
      } else {
        setFormData(getDefaultFormData());
      }
    }
  }, [open, initialData]);

  const handleLanguageChange = (code: string) => {
    const language = ISO_LANGUAGES.find(l => l.code === code);
    setFormData(prev => ({
      ...prev,
      language_code: code,
      language_name: language?.name || "",
    }));
  };

  const handleScaleChange = (scale: ProficiencyScale) => {
    setFormData(prev => ({
      ...prev,
      proficiency_scale: scale,
      overall_proficiency: "",
      speaking_proficiency: "",
      reading_proficiency: "",
      writing_proficiency: "",
    }));
  };

  const proficiencyOptions = formData.proficiency_scale === "cefr" ? CEFR_PROFICIENCY : NUMERIC_PROFICIENCY;

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isValid = formData.language_code && formData.language_name;
  const isReadOnly = viewType === "manager";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Language" : "Add Language"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Row 1: Language Selection */}
          <div className="grid gap-2">
            <Label htmlFor="language">Language *</Label>
            <Select
              value={formData.language_code}
              onValueChange={handleLanguageChange}
              disabled={isReadOnly}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {ISO_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Scale Type Toggle + Overall Proficiency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Proficiency Scale</Label>
              <Tabs
                value={formData.proficiency_scale}
                onValueChange={(v) => handleScaleChange(v as ProficiencyScale)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="numeric" className="flex-1" disabled={isReadOnly}>
                    Numeric (1-5)
                  </TabsTrigger>
                  <TabsTrigger value="cefr" className="flex-1" disabled={isReadOnly}>
                    CEFR (A1-C2)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid gap-2">
              <Label>Overall Proficiency</Label>
              <Select
                value={formData.overall_proficiency}
                onValueChange={(v) => setFormData(prev => ({ ...prev, overall_proficiency: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Speaking, Reading, Writing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Speaking</Label>
              <Select
                value={formData.speaking_proficiency}
                onValueChange={(v) => setFormData(prev => ({ ...prev, speaking_proficiency: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reading</Label>
              <Select
                value={formData.reading_proficiency}
                onValueChange={(v) => setFormData(prev => ({ ...prev, reading_proficiency: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Writing</Label>
              <Select
                value={formData.writing_proficiency}
                onValueChange={(v) => setFormData(prev => ({ ...prev, writing_proficiency: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Certification + Effective Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Certification/Exam</Label>
              <Select
                value={formData.certification_exam}
                onValueChange={(v) => setFormData(prev => ({ ...prev, certification_exam: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certification (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_CERTIFICATIONS.map((cert) => (
                    <SelectItem key={cert} value={cert}>
                      {cert}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Certification Score</Label>
              <Input
                value={formData.certification_score}
                onChange={(e) => setFormData(prev => ({ ...prev, certification_score: e.target.value }))}
                placeholder="e.g., 7.5, 110, B2"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Row 5: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                disabled={isReadOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Row 6: Flags */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_primary: v }))}
                disabled={isReadOnly}
              />
              <Label htmlFor="is_primary">Primary Language</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_native"
                checked={formData.is_native}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_native: v }))}
                disabled={isReadOnly}
              />
              <Label htmlFor="is_native">Native Speaker</Label>
            </div>
          </div>

          {/* Row 7: Notes */}
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional information about language skills..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Add"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
