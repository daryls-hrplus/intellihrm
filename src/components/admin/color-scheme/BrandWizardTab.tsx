import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Wand2, Loader2, CheckCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deriveFullPalette } from "@/hooks/useColorScheme";

interface BrandWizardTabProps {
  onApplyColors: (colors: Record<string, string>) => void;
}

interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  confidence: number;
  colorNames?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export const BrandWizardTab = ({ onApplyColors }: BrandWizardTabProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedColors, setExtractedColors] = useState<ExtractedColors | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    const inferredType =
      file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "");

    if (!inferredType.startsWith("image/") && inferredType !== "application/pdf") {
      toast.error("Please upload an image (PNG, JPG) or PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsExtracting(true);
    setExtractedColors(null);

    try {
      // Convert file to base64
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Set preview asset info
      setPreviewImage(dataUrl);
      setPreviewMimeType(inferredType);
      setPreviewFileName(file.name);

      // Extract base64 data for API call (remove data URL prefix)
      const base64 = dataUrl.split(",")[1];

      // Call edge function
      const { data, error } = await supabase.functions.invoke("extract-brand-colors", {
        body: { imageBase64: base64, mimeType: inferredType },
      });

      if (error) {
        throw new Error(error.message || 'Failed to extract colors');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setExtractedColors(data);
      toast.success('Brand colors extracted successfully!');

    } catch (error) {
      console.error('Error extracting colors:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract brand colors');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyColors = () => {
    if (!extractedColors) return;

    const fullPalette = deriveFullPalette(
      extractedColors.primary,
      extractedColors.secondary,
      extractedColors.accent
    );

    onApplyColors(fullPalette);
    toast.success('Brand colors applied to theme!');
  };

  const handleAdjustColor = (colorType: 'primary' | 'secondary' | 'accent', newColor: string) => {
    if (!extractedColors) return;
    setExtractedColors({
      ...extractedColors,
      [colorType]: newColor
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Brand Wizard
          </CardTitle>
          <CardDescription>
            Upload your brand guidelines, logo, or any brand asset and we'll automatically extract your brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isExtracting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your brand assets...</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your brand asset here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PNG, JPG, or PDF files up to 10MB
                </p>
                <label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">Browse Files</span>
                  </Button>
                </label>
              </>
            )}
          </div>

          {/* Results */}
          {extractedColors && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Colors extracted successfully</span>
                {extractedColors.confidence && (
                  <span className="text-sm text-muted-foreground">
                    ({extractedColors.confidence}% confidence)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview Image */}
                {previewImage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Uploaded Asset</p>
                      {previewFileName && (
                        <p className="text-xs text-muted-foreground truncate max-w-[14rem]">
                          {previewFileName}
                        </p>
                      )}
                    </div>
                    <div className="aspect-video rounded-lg border overflow-hidden bg-muted">
                      {previewMimeType === "application/pdf" ? (
                        <object
                          data={previewImage}
                          type="application/pdf"
                          className="w-full h-full"
                        >
                          <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium mt-2">PDF preview not available</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Color extraction still works — use Apply to Theme below.
                            </p>
                          </div>
                        </object>
                      ) : (
                        <img
                          src={previewImage}
                          alt="Brand asset preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Extracted Colors */}
                <div className="space-y-4">
                  <p className="text-sm font-medium">Extracted Colors</p>
                  
                  {(['primary', 'secondary', 'accent'] as const).map((colorType) => (
                    <div key={colorType} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg border shadow-sm flex-shrink-0"
                          style={{ backgroundColor: extractedColors[colorType] }}
                        />
                        <div>
                          <p className="font-medium capitalize">{colorType}</p>
                          <p className="text-xs text-muted-foreground">
                            {extractedColors.colorNames?.[colorType] || extractedColors[colorType]}
                          </p>
                        </div>
                      </div>
                      <input
                        type="color"
                        value={extractedColors[colorType]}
                        onChange={(e) => handleAdjustColor(colorType, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Theme Preview</p>
                <div className="flex gap-2 flex-wrap p-4 rounded-lg bg-muted/50">
                  <Button style={{ backgroundColor: extractedColors.primary, color: '#fff' }}>
                    Primary Button
                  </Button>
                  <Button style={{ backgroundColor: extractedColors.secondary, color: '#fff' }}>
                    Secondary
                  </Button>
                  <Button style={{ backgroundColor: extractedColors.accent, color: '#fff' }}>
                    Accent
                  </Button>
                </div>
              </div>

              <Button onClick={handleApplyColors} className="w-full gap-2">
                <Wand2 className="h-4 w-4" />
                Apply to Theme
              </Button>
            </div>
          )}

          {/* Tips */}
          {!extractedColors && !isExtracting && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Tips for best results:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Upload your official brand guidelines PDF</li>
                <li>Use high-resolution logos with clear colors</li>
                <li>Include images that show your primary brand colors</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
