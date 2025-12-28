import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Palette } from "lucide-react";
import { deriveFullPalette } from "@/hooks/useColorScheme";
import { toast } from "sonner";

interface ColorPresetsTabProps {
  onApplyColors: (colors: Record<string, string>) => void;
  currentColors: Record<string, string>;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  tags?: string[];
}

const PRESETS: Preset[] = [
  {
    id: "hrplus-azure",
    name: "HRplus Azure",
    description: "Official HRplus brand colors with azure blue and teal accents",
    primary: "#2F7AC3",
    secondary: "#0C4277",
    accent: "#17A584",
    tags: ["Default", "Professional"]
  },
  {
    id: "enterprise-navy",
    name: "Enterprise Navy",
    description: "Classic corporate navy with gold accents for a timeless look",
    primary: "#1E3A5F",
    secondary: "#0F1F33",
    accent: "#D4A84B",
    tags: ["Corporate", "Classic"]
  },
  {
    id: "modern-slate",
    name: "Modern Slate",
    description: "Sleek gray tones with vibrant purple accent for modern enterprises",
    primary: "#475569",
    secondary: "#1E293B",
    accent: "#8B5CF6",
    tags: ["Modern", "Minimal"]
  },
  {
    id: "warm-professional",
    name: "Warm Professional",
    description: "Warm brown tones with coral accent for a friendly, approachable feel",
    primary: "#78716C",
    secondary: "#44403C",
    accent: "#F97316",
    tags: ["Warm", "Friendly"]
  },
  {
    id: "tech-cyan",
    name: "Tech Cyan",
    description: "Bold cyan with deep indigo for technology-forward companies",
    primary: "#0891B2",
    secondary: "#164E63",
    accent: "#06B6D4",
    tags: ["Tech", "Bold"]
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Nature-inspired greens for sustainability-focused organizations",
    primary: "#15803D",
    secondary: "#14532D",
    accent: "#84CC16",
    tags: ["Natural", "Sustainable"]
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Elegant purple palette for premium and creative businesses",
    primary: "#7C3AED",
    secondary: "#4C1D95",
    accent: "#EC4899",
    tags: ["Creative", "Premium"]
  },
  {
    id: "minimal-gray",
    name: "Minimal Gray",
    description: "Ultra-clean grayscale with subtle blue accent for minimalist design",
    primary: "#6B7280",
    secondary: "#374151",
    accent: "#3B82F6",
    tags: ["Minimal", "Clean"]
  }
];

export const ColorPresetsTab = ({ onApplyColors, currentColors }: ColorPresetsTabProps) => {
  const handleApplyPreset = (preset: Preset) => {
    const fullPalette = deriveFullPalette(preset.primary, preset.secondary, preset.accent);
    onApplyColors(fullPalette);
    toast.success(`Applied "${preset.name}" preset`);
  };

  // Check if current colors match a preset
  const getCurrentPresetId = (): string | null => {
    // This is a simplified check - in production you'd compare HSL values
    return null;
  };

  const activePresetId = getCurrentPresetId();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Quick Presets
          </CardTitle>
          <CardDescription>
            Choose from professionally designed color schemes. Click any preset to instantly apply it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESETS.map((preset) => (
              <Card 
                key={preset.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activePresetId === preset.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleApplyPreset(preset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {preset.name}
                        {activePresetId === preset.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-1">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: preset.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: preset.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: preset.accent }}
                        title="Accent"
                      />
                    </div>
                    <div className="flex-1" />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyPreset(preset);
                      }}
                    >
                      Apply
                    </Button>
                  </div>

                  {/* Tags */}
                  {preset.tags && (
                    <div className="flex gap-1 flex-wrap">
                      {preset.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Preview Strip */}
                  <div className="mt-3 flex rounded overflow-hidden h-2">
                    <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                    <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                    <div className="flex-1" style={{ backgroundColor: preset.accent }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
