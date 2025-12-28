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
  // Default & Professional
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

  // Dark Mode Variations
  {
    id: "midnight-dark",
    name: "Midnight Dark",
    description: "Deep dark theme with electric blue accents for low-light environments",
    primary: "#3B82F6",
    secondary: "#0F172A",
    accent: "#22D3EE",
    tags: ["Dark Mode", "Modern"]
  },
  {
    id: "carbon-dark",
    name: "Carbon Dark",
    description: "Rich carbon blacks with amber highlights for a premium dark experience",
    primary: "#71717A",
    secondary: "#18181B",
    accent: "#F59E0B",
    tags: ["Dark Mode", "Premium"]
  },
  {
    id: "obsidian-dark",
    name: "Obsidian Dark",
    description: "Deep obsidian with emerald accents for a sophisticated dark interface",
    primary: "#64748B",
    secondary: "#0C0A09",
    accent: "#10B981",
    tags: ["Dark Mode", "Elegant"]
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Developer-friendly dark theme with soft purple and pink tones",
    primary: "#7C3AED",
    secondary: "#1E1B4B",
    accent: "#EC4899",
    tags: ["Dark Mode", "Developer"]
  },

  // Healthcare
  {
    id: "healthcare-trust",
    name: "Healthcare Trust",
    description: "Calming blues and greens that inspire trust and wellbeing",
    primary: "#0EA5E9",
    secondary: "#0369A1",
    accent: "#14B8A6",
    tags: ["Healthcare", "Medical"]
  },
  {
    id: "clinical-clean",
    name: "Clinical Clean",
    description: "Clean, clinical palette with soft teal for medical environments",
    primary: "#0D9488",
    secondary: "#115E59",
    accent: "#06B6D4",
    tags: ["Healthcare", "Clinical"]
  },

  // Finance & Banking
  {
    id: "finance-prestige",
    name: "Finance Prestige",
    description: "Deep navy and gold conveying stability and wealth management",
    primary: "#1E3A8A",
    secondary: "#172554",
    accent: "#CA8A04",
    tags: ["Finance", "Banking"]
  },
  {
    id: "fintech-modern",
    name: "Fintech Modern",
    description: "Contemporary fintech palette with vibrant gradients",
    primary: "#6366F1",
    secondary: "#312E81",
    accent: "#22C55E",
    tags: ["Finance", "Fintech"]
  },

  // Education
  {
    id: "education-inspire",
    name: "Education Inspire",
    description: "Warm, inspiring colors that promote learning and creativity",
    primary: "#7C3AED",
    secondary: "#5B21B6",
    accent: "#F97316",
    tags: ["Education", "Learning"]
  },
  {
    id: "academic-classic",
    name: "Academic Classic",
    description: "Traditional academic colors with dignified burgundy tones",
    primary: "#9F1239",
    secondary: "#4C0519",
    accent: "#D4A84B",
    tags: ["Education", "Academic"]
  },

  // Legal & Government
  {
    id: "legal-authority",
    name: "Legal Authority",
    description: "Authoritative deep blues conveying trust and professionalism",
    primary: "#1E40AF",
    secondary: "#1E3A5F",
    accent: "#78716C",
    tags: ["Legal", "Government"]
  },
  {
    id: "civic-trust",
    name: "Civic Trust",
    description: "Patriotic palette suitable for government and public sector",
    primary: "#1D4ED8",
    secondary: "#1E3A8A",
    accent: "#DC2626",
    tags: ["Government", "Public Sector"]
  },

  // Technology
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
    id: "startup-vibrant",
    name: "Startup Vibrant",
    description: "Energetic, modern palette for innovative startups",
    primary: "#8B5CF6",
    secondary: "#4C1D95",
    accent: "#F43F5E",
    tags: ["Tech", "Startup"]
  },
  {
    id: "saas-professional",
    name: "SaaS Professional",
    description: "Clean, professional SaaS palette with subtle gradients",
    primary: "#2563EB",
    secondary: "#1E3A8A",
    accent: "#10B981",
    tags: ["Tech", "SaaS"]
  },

  // Hospitality & Retail
  {
    id: "hospitality-warm",
    name: "Hospitality Warm",
    description: "Warm, welcoming colors for hotels and hospitality",
    primary: "#B45309",
    secondary: "#78350F",
    accent: "#D97706",
    tags: ["Hospitality", "Warm"]
  },
  {
    id: "retail-energy",
    name: "Retail Energy",
    description: "Energetic retail palette that drives engagement",
    primary: "#E11D48",
    secondary: "#9F1239",
    accent: "#F97316",
    tags: ["Retail", "Energy"]
  },
  {
    id: "luxury-brand",
    name: "Luxury Brand",
    description: "Sophisticated palette for premium and luxury brands",
    primary: "#44403C",
    secondary: "#1C1917",
    accent: "#A16207",
    tags: ["Retail", "Luxury"]
  },

  // Sustainability & Non-profit
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
    id: "nonprofit-trust",
    name: "Non-profit Trust",
    description: "Approachable, trustworthy colors for charitable organizations",
    primary: "#0891B2",
    secondary: "#155E75",
    accent: "#F59E0B",
    tags: ["Non-profit", "Charity"]
  },
  {
    id: "eco-earth",
    name: "Eco Earth",
    description: "Earthy tones reflecting environmental consciousness",
    primary: "#65A30D",
    secondary: "#365314",
    accent: "#22C55E",
    tags: ["Sustainable", "Eco"]
  },

  // Creative & Media
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
    id: "media-bold",
    name: "Media Bold",
    description: "Bold, attention-grabbing colors for media and entertainment",
    primary: "#DC2626",
    secondary: "#7F1D1D",
    accent: "#FACC15",
    tags: ["Media", "Entertainment"]
  },

  // Minimal & Clean
  {
    id: "minimal-gray",
    name: "Minimal Gray",
    description: "Ultra-clean grayscale with subtle blue accent for minimalist design",
    primary: "#6B7280",
    secondary: "#374151",
    accent: "#3B82F6",
    tags: ["Minimal", "Clean"]
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
    id: "nordic-frost",
    name: "Nordic Frost",
    description: "Cool, crisp Scandinavian-inspired minimalist palette",
    primary: "#94A3B8",
    secondary: "#475569",
    accent: "#0EA5E9",
    tags: ["Minimal", "Nordic"]
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
