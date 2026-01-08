// AI-powered changelog generator for publishing workflow

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIChangelogGeneratorProps {
  manualId: string;
  manualName: string;
  selectedSections: string[];
  sectionTitles: string[];
  versionType: 'major' | 'minor' | 'patch';
  previousVersion?: string;
  isFirstPublication: boolean;
  onChangelogGenerated: (entries: string[]) => void;
  disabled?: boolean;
}

export function AIChangelogGenerator({
  manualId,
  manualName,
  selectedSections,
  sectionTitles,
  versionType,
  previousVersion,
  isFirstPublication,
  onChangelogGenerated,
  disabled = false,
}: AIChangelogGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateChangelog = async () => {
    if (selectedSections.length === 0) {
      toast.error("Please select sections first");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-publishing-changelog', {
        body: {
          manualId,
          manualName,
          selectedSections,
          sectionTitles,
          versionType: isFirstPublication ? 'initial' : versionType,
          previousVersion,
          isFirstPublication,
        },
      });

      if (error) throw error;

      if (data?.success && data?.changelog?.length > 0) {
        onChangelogGenerated(data.changelog);
        setHasGenerated(true);
        toast.success("Changelog generated successfully");
      } else {
        throw new Error(data?.error || "Failed to generate changelog");
      }
    } catch (error: any) {
      console.error("Changelog generation error:", error);
      toast.error(error.message || "Failed to generate changelog");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant={hasGenerated ? "outline" : "secondary"}
      size="sm"
      onClick={generateChangelog}
      disabled={disabled || isGenerating || selectedSections.length === 0}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : hasGenerated ? (
        <>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  );
}