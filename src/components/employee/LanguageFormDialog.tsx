import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, HelpCircle } from "lucide-react";
import { ISO_LANGUAGES, NUMERIC_PROFICIENCY, CEFR_PROFICIENCY, LANGUAGE_CERTIFICATIONS, ProficiencyScale } from "@/constants/languageConstants";

// Tooltip text for each field
const FIELD_TOOLTIPS = {
  language: "Select the language from ISO standard codes. Used for compliance, reporting, and global mobility tracking.",
  proficiencyScale: "Numeric (1-5): Simple 5-point scale for quick assessments. CEFR (A1-C2): European framework standard used internationally for formal certification.",
  overallProficiency: "Your combined proficiency across all language skills. Use for general capability assessment.",
  speaking: "Ability to verbally communicate, including pronunciation, fluency, and conversation skills.",
  reading: "Ability to comprehend written text, including documents, emails, and technical materials.",
  writing: "Ability to produce written content with proper grammar, vocabulary, and structure.",
  certification: "Formal language certification or exam taken (e.g., IELTS for English, DELF for French). Optional but valuable for verification.",
  certificationScore: "Your score on the certification exam. Example: IELTS 7.5, TOEFL 110, CEFR B2.",
  effectiveDate: "Date when this proficiency was last assessed or certified. Helps track currency of language skills.",
  expiryDate: "Expiration date for time-limited certifications (e.g., some IELTS scores are valid for 2 years).",
  primaryLanguage: "Mark as primary to indicate this is the preferred language for business communication.",
  nativeSpeaker: "Indicates this is your first/mother tongue language, typically acquired in childhood.",
  notes: "Additional context like dialect spoken, specialized terminology, or formal training received.",
};

// Reusable label with tooltip component
const LabelWithTooltip = ({ label, tooltip, htmlFor, required }: { label: string; tooltip: string; htmlFor?: string; required?: boolean }) => (
  <div className="flex items-center gap-1.5">
    <Label htmlFor={htmlFor}>{label}{required && " *"}</Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-sm">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

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
        <TooltipProvider delayDuration={300}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Language" : "Add Language"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Row 1: Language Selection */}
            <div className="grid gap-2">
              <LabelWithTooltip label="Language" tooltip={FIELD_TOOLTIPS.language} htmlFor="language" required />
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
                <LabelWithTooltip label="Proficiency Scale" tooltip={FIELD_TOOLTIPS.proficiencyScale} />
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
                <p className="text-xs text-muted-foreground px-1">
                  {formData.proficiency_scale === "numeric" 
                    ? "1 = Basic → 5 = Fluent/Native" 
                    : "A1 = Beginner → C2 = Mastery"}
                </p>
              </div>
              <div className="grid gap-2">
                <LabelWithTooltip label="Overall Proficiency" tooltip={FIELD_TOOLTIPS.overallProficiency} />
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
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Speaking, Reading, Writing */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <LabelWithTooltip label="Speaking" tooltip={FIELD_TOOLTIPS.speaking} />
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
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <LabelWithTooltip label="Reading" tooltip={FIELD_TOOLTIPS.reading} />
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
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <LabelWithTooltip label="Writing" tooltip={FIELD_TOOLTIPS.writing} />
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
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Certification + Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <LabelWithTooltip label="Certification/Exam" tooltip={FIELD_TOOLTIPS.certification} />
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
                <LabelWithTooltip label="Certification Score" tooltip={FIELD_TOOLTIPS.certificationScore} />
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
                <LabelWithTooltip label="Effective Date" tooltip={FIELD_TOOLTIPS.effectiveDate} />
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                  disabled={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <LabelWithTooltip label="Expiry Date" tooltip={FIELD_TOOLTIPS.expiryDate} />
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
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="is_primary">Primary Language</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] text-sm">
                      <p>{FIELD_TOOLTIPS.primaryLanguage}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_native"
                  checked={formData.is_native}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_native: v }))}
                  disabled={isReadOnly}
                />
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="is_native">Native Speaker</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] text-sm">
                      <p>{FIELD_TOOLTIPS.nativeSpeaker}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Row 7: Notes */}
            <div className="grid gap-2">
              <LabelWithTooltip label="Notes" tooltip={FIELD_TOOLTIPS.notes} />
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
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
