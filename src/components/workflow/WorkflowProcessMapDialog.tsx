import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mermaid from "mermaid";
import { useLanguage } from "@/hooks/useLanguage";
import type { WorkflowStep, WorkflowTemplate } from "@/hooks/useWorkflow";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkflowTemplate | null;
  steps: WorkflowStep[];
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
});

export function WorkflowProcessMapDialog({
  open,
  onOpenChange,
  template,
  steps,
}: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateDiagram = async () => {
    if (!template) return;

    setLoading(true);
    setError(null);
    setMermaidCode(null);
    setSvgContent(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-workflow-diagram",
        {
          body: { template, steps },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to generate diagram");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMermaidCode(data.mermaidCode);
    } catch (err) {
      console.error("Error generating diagram:", err);
      const message = err instanceof Error ? err.message : "Failed to generate diagram";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Render mermaid diagram when code changes
  useEffect(() => {
    if (!mermaidCode || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        // Clear previous content
        containerRef.current!.innerHTML = "";
        
        // Generate unique ID
        const id = `mermaid-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, mermaidCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setSvgContent(svg);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram. The AI may have generated invalid syntax.");
        
        // Show the raw code for debugging
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-xs text-muted-foreground p-4 bg-muted rounded overflow-auto">${mermaidCode}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  // Auto-generate when dialog opens
  useEffect(() => {
    if (open && template && !mermaidCode && !loading) {
      generateDiagram();
    }
  }, [open, template]);

  const handleDownload = () => {
    if (!svgContent || !template) return;

    // Create a blob from the SVG
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.code.toLowerCase()}-process-map.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Process map downloaded");
  };

  const handleDownloadPng = async () => {
    if (!svgContent || !template || !containerRef.current) return;

    try {
      const svgElement = containerRef.current.querySelector("svg");
      if (!svgElement) return;

      // Get SVG dimensions
      const bbox = svgElement.getBoundingClientRect();
      const width = bbox.width * 2; // 2x for better quality
      const height = bbox.height * 2;

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        // Download as PNG
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${template.code.toLowerCase()}-process-map.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success("Process map downloaded as PNG");
      };

      img.src = url;
    } catch (err) {
      console.error("Error downloading PNG:", err);
      toast.error("Failed to download PNG");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("workflow.processMap.title", "Process Map")}
            {template && (
              <span className="text-muted-foreground font-normal">
                - {template.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {t("workflow.processMap.generating", "Generating process map with AI...")}
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-destructive text-center">{error}</p>
              <Button variant="outline" onClick={generateDiagram}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("common.retry", "Try Again")}
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div
              ref={containerRef}
              className="flex items-center justify-center min-h-[400px] p-4"
            />
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={generateDiagram}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("workflow.processMap.regenerate", "Regenerate")}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!svgContent || loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("workflow.processMap.downloadSvg", "Download SVG")}
            </Button>
            <Button
              onClick={handleDownloadPng}
              disabled={!svgContent || loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("workflow.processMap.downloadPng", "Download PNG")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
