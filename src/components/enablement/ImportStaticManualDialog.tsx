// Dialog for importing existing static manuals into the database

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  BookOpen, 
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  Clock
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { APPRAISALS_MANUAL_STRUCTURE } from "@/types/adminManual";

// Static manual definitions available for import
const STATIC_MANUALS = [
  {
    id: 'appraisals',
    name: 'Appraisals Manual',
    description: 'Complete guide for performance appraisals, evaluation cycles, and calibration',
    moduleCode: 'APPRAISALS',
    structure: APPRAISALS_MANUAL_STRUCTURE,
    partCount: 8,
    estimatedSections: APPRAISALS_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0),
    totalReadTime: APPRAISALS_MANUAL_STRUCTURE.reduce((acc, s) => acc + s.estimatedReadTime, 0),
    icon: '📊'
  },
  {
    id: 'hr-hub',
    name: 'HR Hub Manual',
    description: 'Employee self-service, communications, and HR operations guide',
    moduleCode: 'HR_HUB',
    partCount: 8,
    estimatedSections: 35,
    totalReadTime: 180,
    icon: '🏢'
  },
  {
    id: 'workforce',
    name: 'Workforce Manual',
    description: 'Time & attendance, scheduling, and workforce management',
    moduleCode: 'WORKFORCE',
    partCount: 6,
    estimatedSections: 28,
    totalReadTime: 150,
    icon: '👥'
  }
];

interface ImportStaticManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualImported?: (manualId: string) => void;
}

export function ImportStaticManualDialog({
  open,
  onOpenChange,
  onManualImported
}: ImportStaticManualDialogProps) {
  const [selectedManual, setSelectedManual] = useState<typeof STATIC_MANUALS[0] | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (manual: typeof STATIC_MANUALS[0]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.company_id) throw new Error('Company not found');

      setImportProgress(10);

      // 1. Create manual definition
      const { data: manualDef, error: defError } = await supabase
        .from('manual_definitions')
        .insert({
          manual_code: manual.moduleCode,
          manual_name: manual.name,
          description: manual.description,
          module_codes: [manual.moduleCode],
          company_id: profile.company_id,
          current_version: '1.0.0',
          generation_status: 'idle'
        })
        .select()
        .single();

      if (defError) throw defError;
      setImportProgress(30);

      // 2. Import sections if we have structure
      if (manual.id === 'appraisals' && manual.structure) {
        let sectionCount = 0;
        const totalSections = manual.structure.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0);

        for (const part of manual.structure) {
          // Create parent section
          const sectionData = {
            manual_id: manualDef.id,
            section_number: part.sectionNumber,
            title: part.title,
            content: {
              description: part.description,
              contentLevel: part.contentLevel,
              targetRoles: part.targetRoles,
              industryContext: part.industryContext
            },
            display_order: sectionCount,
            source_type: 'imported',
            source_reference: `APPRAISALS_MANUAL.${part.id}`,
            needs_regeneration: false
          };

          const { data: parentSection, error: parentError } = await supabase
            .from('manual_sections')
            .insert(sectionData as any)
            .select()
            .single();

          if (parentError) throw parentError;
          sectionCount++;
          setImportProgress(30 + Math.floor((sectionCount / totalSections) * 60));

          // Create subsections
          if (part.subsections) {
            for (const sub of part.subsections) {
              const subData = {
                manual_id: manualDef.id,
                section_number: sub.sectionNumber,
                title: sub.title,
                content: {
                  description: sub.description,
                  contentLevel: sub.contentLevel,
                  targetRoles: sub.targetRoles,
                  industryContext: sub.industryContext,
                  estimatedReadTime: sub.estimatedReadTime
                },
                parent_section_id: parentSection.id,
                display_order: sectionCount,
                source_type: 'imported',
                source_reference: `APPRAISALS_MANUAL.${part.id}.${sub.id}`,
                needs_regeneration: false
              };

              const { error: subError } = await supabase
                .from('manual_sections')
                .insert(subData as any);

              if (subError) throw subError;
              sectionCount++;
              setImportProgress(30 + Math.floor((sectionCount / totalSections) * 60));
            }
          }
        }
      } else {
        // For other manuals, create placeholder sections
        const partCount = manual.partCount || 6;
        for (let i = 1; i <= partCount; i++) {
          const placeholderData = {
            manual_id: manualDef.id,
            section_number: String(i),
            title: `Part ${i}`,
            content: { placeholder: true },
            display_order: i - 1,
            source_type: 'imported',
            source_reference: `${manual.moduleCode}_MANUAL.part-${i}`,
            needs_regeneration: true
          };

          const { error } = await supabase
            .from('manual_sections')
            .insert(placeholderData as any);

          if (error) throw error;
          setImportProgress(30 + Math.floor((i / partCount) * 60));
        }
      }

      setImportProgress(100);
      return manualDef;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manual-definitions'] });
      toast.success(`${selectedManual?.name} imported successfully`);
      onManualImported?.(data.id);
      onOpenChange(false);
      setSelectedManual(null);
      setImportProgress(0);
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`);
      setImportProgress(0);
    }
  });

  const handleImport = () => {
    if (selectedManual) {
      importMutation.mutate(selectedManual);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import Existing Manual
          </DialogTitle>
          <DialogDescription>
            Import a pre-built manual structure into the database for editing and customization
          </DialogDescription>
        </DialogHeader>

        {importMutation.isPending ? (
          <div className="py-8 space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <Progress value={importProgress} />
              <p className="text-center text-sm text-muted-foreground">
                Importing {selectedManual?.name}... {importProgress}%
              </p>
            </div>
          </div>
        ) : selectedManual ? (
          <div className="space-y-4">
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedManual.icon}</span>
                  {selectedManual.name}
                </CardTitle>
                <CardDescription>{selectedManual.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {selectedManual.estimatedSections} sections
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    {selectedManual.partCount} parts
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    ~{selectedManual.totalReadTime} min read
                  </Badge>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">What will be imported:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Manual structure and sections
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Section metadata (roles, read times)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Industry context and benchmarks
                    </li>
                    {selectedManual.id === 'appraisals' && (
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        Full content from existing manual
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                After import, you can edit sections, restructure chapters, and use AI to regenerate content.
              </span>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {STATIC_MANUALS.map((manual) => (
                <Card 
                  key={manual.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedManual(manual)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{manual.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{manual.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {manual.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {manual.estimatedSections} sections
                          </Badge>
                          <Badge variant="outline">
                            ~{manual.totalReadTime} min
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          {selectedManual && !importMutation.isPending ? (
            <>
              <Button variant="outline" onClick={() => setSelectedManual(null)}>
                Back
              </Button>
              <Button onClick={handleImport}>
                <Download className="h-4 w-4 mr-2" />
                Import Manual
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
