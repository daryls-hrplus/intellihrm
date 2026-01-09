// Multi-step publish wizard for manual publishing

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  GitBranch,
  FolderTree,
  Eye,
  Plus,
  X,
  Loader2,
  Users,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionSelector } from "./SectionSelector";
import { SmartSectionActions } from "./SmartSectionActions";
import type { ManualSection } from "@/types/kb.types";
import { ManualToKBTransformer } from "@/services/kb/ManualToKBTransformer";
import { ManualPublishService } from "@/services/kb/ManualPublishService";
import { AIChangelogGenerator } from "./AIChangelogGenerator";
import { SmartVersionSelector } from "./SmartVersionSelector";
import { ContentQualityCheck } from "./ContentQualityCheck";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface PublishWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualId: string;
  manualName: string;
  sourceVersion: string;
  currentPublishedVersion?: string;
  sectionsCount: number;
  onPublishComplete?: () => void;
}

type VersionType = 'initial' | 'major' | 'minor' | 'patch';

interface ChangelogEntry {
  id: string;
  text: string;
}

const STEPS = [
  { id: 'sections', label: 'Select Sections', icon: FileText },
  { id: 'version', label: 'Configure Version', icon: GitBranch },
  { id: 'category', label: 'Target Category', icon: FolderTree },
  { id: 'confirm', label: 'Confirm', icon: Eye },
];

export function PublishWizard({
  open,
  onOpenChange,
  manualId,
  manualName,
  sourceVersion,
  currentPublishedVersion,
  sectionsCount,
  onPublishComplete,
}: PublishWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  // Step 1: Sections
  const [sections, setSections] = useState<ManualSection[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // Step 2: Version
  const isFirstPublication = !currentPublishedVersion;
  const [versionType, setVersionType] = useState<VersionType>(isFirstPublication ? 'initial' : 'minor');
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([
    { id: '1', text: '' },
  ]);
  const [requireReview, setRequireReview] = useState(false);

  // Step 3: Category
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Computed values
  const [nextVersions, setNextVersions] = useState({
    initial: '1.0.0',
    major: '1.0.0',
    minor: '1.0.0',
    patch: '1.0.0',
  });

  // Generation run metadata
  const [latestGenerationRun, setLatestGenerationRun] = useState<{
    id: string;
    run_type: string;
    sections_regenerated: number;
    completed_at: string;
    changelog: string[];
  } | null>(null);

  // Initialize sections
  useEffect(() => {
    if (open) {
      // Generate mock sections for demo
      const mockSections = ManualToKBTransformer.generateMockSections(manualId, sectionsCount);
      setSections(mockSections);
      
      // Select all by default
      setSelectedSections(mockSections.map(s => s.id));

      // Load categories
      loadCategories();

      // Calculate all version options
      calculateAllVersions();

      // Load latest generation run
      loadLatestGenerationRun();
    }
  }, [open, manualId, sectionsCount]);

  const loadLatestGenerationRun = async () => {
    try {
      // Get manual definition first
      const { data: manualDef } = await supabase
        .from('manual_definitions')
        .select('id')
        .eq('manual_code', manualId)
        .single();

      if (!manualDef) return;

      // Get latest completed generation run
      const { data: run } = await supabase
        .from('manual_generation_runs')
        .select('id, run_type, sections_regenerated, completed_at, changelog')
        .eq('manual_id', manualDef.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (run) {
        const changelogData = Array.isArray(run.changelog) ? run.changelog as unknown as string[] : [];
        
        setLatestGenerationRun({
          id: run.id,
          run_type: run.run_type || 'unknown',
          sections_regenerated: run.sections_regenerated || 0,
          completed_at: run.completed_at || '',
          changelog: changelogData,
        });

        // Auto-populate changelog from generation run if available
        if (changelogData.length > 0) {
          setChangelog(changelogData.map((text: string, i: number) => ({ 
            id: String(i + 1), 
            text 
          })));
        }
      }
    } catch (error) {
      console.error('Error loading generation run:', error);
    }
  };

  // Update version type when first publication status changes
  useEffect(() => {
    if (isFirstPublication) {
      setVersionType('initial');
    }
  }, [isFirstPublication]);

  const loadCategories = async () => {
    // For demo, use mock categories
    setCategories([
      { id: 'workforce', name: 'Workforce Management' },
      { id: 'hr-hub', name: 'HR Hub' },
      { id: 'appraisals', name: 'Performance Management' },
      { id: 'admin', name: 'Administration' },
      { id: 'getting-started', name: 'Getting Started' },
    ]);
    
    // Default to matching category
    if (manualId.includes('workforce')) setTargetCategory('workforce');
    else if (manualId.includes('hr')) setTargetCategory('hr-hub');
    else if (manualId.includes('appraisal')) setTargetCategory('appraisals');
    else if (manualId.includes('admin')) setTargetCategory('admin');
    else setTargetCategory('getting-started');
  };

  const calculateAllVersions = async () => {
    const [major, minor, patch] = await Promise.all([
      ManualPublishService.getNextVersion(manualId, 'major'),
      ManualPublishService.getNextVersion(manualId, 'minor'),
      ManualPublishService.getNextVersion(manualId, 'patch'),
    ]);
    setNextVersions({
      initial: '1.0.0',
      major,
      minor,
      patch,
    });
  };

  // Get current version based on selection
  const currentVersion = nextVersions[versionType];

  // Navigation
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Sections
        return selectedSections.length > 0;
      case 1: // Version
        return changelog.some(c => c.text.trim() !== '');
      case 2: // Category
        return targetCategory !== '';
      case 3: // Confirm
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedSections([]);
    setChangelog([{ id: '1', text: '' }]);
    setRequireReview(false);
    onOpenChange(false);
  };

  // Changelog management
  const addChangelogEntry = () => {
    setChangelog([...changelog, { id: Date.now().toString(), text: '' }]);
  };

  const updateChangelogEntry = (id: string, text: string) => {
    setChangelog(changelog.map(c => c.id === id ? { ...c, text } : c));
  };

  const removeChangelogEntry = (id: string) => {
    if (changelog.length > 1) {
      setChangelog(changelog.filter(c => c.id !== id));
    }
  };

  // Publish
  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const changelogTexts = changelog
        .map(c => c.text.trim())
        .filter(Boolean);

      const result = await ManualPublishService.publishManual({
        manualId,
        manualName,
        targetCategoryId: targetCategory,
        sourceVersion,
        publishVersion: currentVersion,
        changelog: changelogTexts,
        sections: selectedSections,
        generationRunId: latestGenerationRun?.id,
      }, 'current-user'); // TODO: Get actual user ID

      if (result.success) {
        toast.success(`Published ${manualName} as v${currentVersion}`);
        onPublishComplete?.();
        handleClose();
      } else {
        toast.error(result.error || 'Failed to publish');
      }
    } catch (error) {
      toast.error('Failed to publish manual');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Render steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Select Sections to Publish</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which sections from {manualName} to include in this publication.
              </p>
            </div>
            <SmartSectionActions
              sections={sections}
              selectedSections={selectedSections}
              onSelectionChange={setSelectedSections}
            />
            <SectionSelector
              sections={sections}
              selectedSections={selectedSections}
              onSelectionChange={setSelectedSections}
              showStatusBadges
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Version Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure the version number and changelog for this publication.
              </p>
            </div>

            {/* AI Generation Run Info */}
            {latestGenerationRun && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">AI Generation Available</span>
                      <Badge variant="outline" className="text-xs">
                        {latestGenerationRun.run_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {latestGenerationRun.sections_regenerated} sections regenerated{' '}
                      {latestGenerationRun.completed_at && 
                        formatDistanceToNow(new Date(latestGenerationRun.completed_at), { addSuffix: true })
                      }
                    </p>
                    {latestGenerationRun.changelog.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Changelog auto-populated from generation run</span>
                      </div>
                    )}
                  </div>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Version Type - Smart Selector */}
            <div className="space-y-3">
              <Label>Version Type</Label>
              <SmartVersionSelector
                value={versionType}
                onChange={setVersionType}
                isFirstPublication={isFirstPublication}
                nextVersions={nextVersions}
                recommendedType={isFirstPublication ? 'initial' : 'minor'}
              />
            </div>

            <Separator />

            {/* Changelog */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Changelog</Label>
                <AIChangelogGenerator
                  manualId={manualId}
                  manualName={manualName}
                  selectedSections={selectedSections}
                  sectionTitles={sections.filter(s => selectedSections.includes(s.id)).map(s => s.title)}
                  versionType={versionType === 'initial' ? 'major' : versionType}
                  previousVersion={currentPublishedVersion}
                  isFirstPublication={isFirstPublication}
                  onChangelogGenerated={(entries) => {
                    setChangelog(entries.map((text, i) => ({ id: String(i + 1), text })));
                  }}
                />
              </div>
              <div className="space-y-2">
                {changelog.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    <Input
                      placeholder={`Change ${index + 1}...`}
                      value={entry.text}
                      onChange={(e) => updateChangelogEntry(entry.id, e.target.value)}
                    />
                    {changelog.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChangelogEntry(entry.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addChangelogEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            <Separator />

            {/* Review Option */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Checkbox
                id="require-review"
                checked={requireReview}
                onCheckedChange={(checked) => setRequireReview(checked as boolean)}
              />
              <div className="flex-1">
                <label htmlFor="require-review" className="font-medium cursor-pointer">
                  Require approval before publishing
                </label>
                <p className="text-sm text-muted-foreground">
                  Articles will go through review workflow before going live
                </p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Target Category</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the Knowledge Base category where articles will be published.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Category</Label>
              <Select value={targetCategory} onValueChange={setTargetCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Preview Structure</h4>
              <div className="text-sm text-muted-foreground">
                Articles will be organized under:
              </div>
              <div className="mt-2 font-medium">
                Help Center → {categories.find(c => c.id === targetCategory)?.name || 'Select category'}
              </div>
            </div>
          </div>
        );

      case 3:
        // Prepare sections data for quality check
        const sectionsForQualityCheck = sections
          .filter(s => selectedSections.includes(s.id))
          .map(s => ({
            id: s.id,
            title: s.title,
            content: s.content || ''
          }));

        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Review & Confirm</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Review your publication settings before proceeding.
              </p>
            </div>

            <div className="space-y-4">
              {/* Content Quality Check */}
              <ContentQualityCheck
                sections={sectionsForQualityCheck}
                manualName={manualName}
              />

              {/* Summary */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manual</span>
                  <span className="font-medium">{manualName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <Badge>v{currentVersion}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sections</span>
                  <span>{selectedSections.length} articles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target</span>
                  <span>{categories.find(c => c.id === targetCategory)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Review Required</span>
                  <span>{requireReview ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {/* Changelog Preview */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Changelog</h4>
                <ul className="text-sm space-y-1">
                  {changelog
                    .filter(c => c.text.trim())
                    .map(c => (
                      <li key={c.id} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{c.text}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Warning */}
              {!requireReview && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                  <strong>Note:</strong> Articles will be published immediately without review.
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Publish Manual to Help Center</DialogTitle>
          <DialogDescription>
            Publish sections from {manualName} to the Knowledge Base
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                    isActive && "bg-primary/10 text-primary",
                    isComplete && "text-muted-foreground",
                    !isActive && !isComplete && "text-muted-foreground/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      isActive && "bg-primary text-primary-foreground",
                      isComplete && "bg-green-500 text-white",
                      !isActive && !isComplete && "bg-muted"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-muted mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="py-4">{renderStepContent()}</div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isPublishing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={isPublishing}>
              Cancel
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : requireReview ? (
                  <>
                    Submit for Review
                    <Check className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Publish Now
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
