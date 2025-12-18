import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Image,
  Upload,
  Palette,
  Type,
  X,
  RefreshCw,
  Eye,
  Building2,
  FileText,
  Check,
  Sparkles
} from "lucide-react";
import { DocumentTemplate } from "./DocumentTemplateConfig";
import { TemplateLivePreview } from "./TemplateLivePreview";

interface TemplateStylingEditorProps {
  template: DocumentTemplate | null;
  onTemplateUpdate: (template: DocumentTemplate) => void;
}

// Professional theme presets - Workday-style
const THEME_PRESETS = [
  {
    id: "enterprise-blue",
    name: "Enterprise Blue",
    description: "Professional corporate look",
    primaryColor: "#1e40af",
    secondaryColor: "#3b82f6",
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif"
  },
  {
    id: "modern-teal",
    name: "Modern Teal",
    description: "Fresh, contemporary style",
    primaryColor: "#0d9488",
    secondaryColor: "#14b8a6",
    headingFont: "Inter, sans-serif",
    bodyFont: "Open Sans, sans-serif"
  },
  {
    id: "executive-purple",
    name: "Executive Purple",
    description: "Sophisticated and elegant",
    primaryColor: "#7c3aed",
    secondaryColor: "#a78bfa",
    headingFont: "Playfair Display, serif",
    bodyFont: "Lato, sans-serif"
  },
  {
    id: "classic-navy",
    name: "Classic Navy",
    description: "Traditional business style",
    primaryColor: "#1e3a5f",
    secondaryColor: "#64748b",
    headingFont: "Georgia, serif",
    bodyFont: "Arial, sans-serif"
  },
  {
    id: "vibrant-orange",
    name: "Vibrant Orange",
    description: "Energetic and engaging",
    primaryColor: "#ea580c",
    secondaryColor: "#f97316",
    headingFont: "Montserrat, sans-serif",
    bodyFont: "Roboto, sans-serif"
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Clean and modern",
    primaryColor: "#18181b",
    secondaryColor: "#52525b",
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif"
  }
];

const FONT_OPTIONS = {
  heading: [
    { name: "Inter (Modern Sans)", value: "Inter, sans-serif" },
    { name: "Arial (Classic)", value: "Arial, sans-serif" },
    { name: "Georgia (Traditional Serif)", value: "Georgia, serif" },
    { name: "Roboto (Clean Sans)", value: "Roboto, sans-serif" },
    { name: "Montserrat (Bold Sans)", value: "Montserrat, sans-serif" },
    { name: "Playfair Display (Elegant Serif)", value: "Playfair Display, serif" },
  ],
  body: [
    { name: "Inter (Modern)", value: "Inter, sans-serif" },
    { name: "Arial (Classic)", value: "Arial, sans-serif" },
    { name: "Georgia (Traditional)", value: "Georgia, serif" },
    { name: "Roboto (Clean)", value: "Roboto, sans-serif" },
    { name: "Open Sans (Readable)", value: "Open Sans, sans-serif" },
    { name: "Lato (Friendly)", value: "Lato, sans-serif" },
  ]
};

export function TemplateStylingEditor({
  template,
  onTemplateUpdate,
}: TemplateStylingEditorProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(template?.branding.logoUrl || null);
  const [headingFont, setHeadingFont] = useState("Inter, sans-serif");
  const [bodyFont, setBodyFont] = useState("Inter, sans-serif");
  const [showHeaderLogo, setShowHeaderLogo] = useState(true);
  const [showFooterLogo, setShowFooterLogo] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!template) {
    return (
      <div className="p-8 border-2 border-dashed rounded-lg text-center">
        <Palette className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          Select a template first to customize its styling
        </p>
      </div>
    );
  }

  const updateBranding = (updates: Partial<DocumentTemplate['branding']>) => {
    onTemplateUpdate({
      ...template,
      branding: {
        ...template.branding,
        ...updates,
      }
    });
  };

  const applyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setHeadingFont(preset.headingFont);
    setBodyFont(preset.bodyFont);
    updateBranding({
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor
    });
    toast.success(`Applied "${preset.name}" theme`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      updateBranding({ logoUrl: dataUrl });
      toast.success("Logo uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    updateBranding({ logoUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Branding & Style
        </h3>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Theme Presets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm">Quick Start Themes</h4>
                  <p className="text-xs text-muted-foreground">Apply a complete brand theme instantly</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyThemePreset(preset)}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      selectedPreset === preset.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'hover:border-muted-foreground/50 hover:bg-muted/30'
                    }`}
                  >
                    {selectedPreset === preset.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div 
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: preset.secondaryColor }}
                      />
                    </div>
                    <p className="font-medium text-sm">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Company Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm">Company Identity</h4>
                  <p className="text-xs text-muted-foreground">Add your logo and company details</p>
                </div>
              </div>
              
              {/* Logo Upload */}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
                <Label className="text-sm font-medium">Company Logo</Label>
                <div className="flex items-start gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <div className="w-24 h-16 border rounded-lg overflow-hidden bg-background flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="w-24 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground">Upload</span>
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {logoPreview ? "Change" : "Upload"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground">
                      PNG, JPG, SVG • Max 2MB
                    </p>
                  </div>
                </div>

                {logoPreview && (
                  <div className="flex gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="header-logo"
                        checked={showHeaderLogo}
                        onCheckedChange={setShowHeaderLogo}
                      />
                      <Label htmlFor="header-logo" className="text-xs">Header</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="footer-logo"
                        checked={showFooterLogo}
                        onCheckedChange={setShowFooterLogo}
                      />
                      <Label htmlFor="footer-logo" className="text-xs">Footer</Label>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Company Name */}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <Label className="text-sm font-medium">Company Name</Label>
                <Input
                  placeholder="Enter your company name"
                  value={template.branding.companyName || ""}
                  onChange={(e) => updateBranding({ companyName: e.target.value })}
                  className="bg-background"
                />
                <p className="text-[10px] text-muted-foreground">Appears in document header</p>
              </div>
              
              {/* Footer Text */}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <Label className="text-sm font-medium">Document Footer</Label>
                <Textarea
                  placeholder="e.g., Confidential - Internal Use Only"
                  value={template.branding.footerText || ""}
                  onChange={(e) => updateBranding({ footerText: e.target.value })}
                  rows={2}
                  className="bg-background"
                />
                <p className="text-[10px] text-muted-foreground">Legal text, copyright, or disclaimers</p>
              </div>
            </div>

            <Separator />

            {/* Custom Colors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm">Custom Colors</h4>
                  <p className="text-xs text-muted-foreground">Fine-tune your brand colors</p>
                </div>
              </div>
              
              {/* Primary Color */}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Primary Color</Label>
                  <Badge variant="outline" className="text-xs font-mono">
                    {template.branding.primaryColor}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">Used for headings, accents, and key elements</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={template.branding.primaryColor}
                    onChange={(e) => {
                      setSelectedPreset(null);
                      updateBranding({ primaryColor: e.target.value });
                    }}
                    className="w-12 h-10 rounded border cursor-pointer bg-background"
                  />
                  <Input
                    value={template.branding.primaryColor}
                    onChange={(e) => {
                      setSelectedPreset(null);
                      updateBranding({ primaryColor: e.target.value });
                    }}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm bg-background"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Secondary Color</Label>
                  <Badge variant="outline" className="text-xs font-mono">
                    {template.branding.secondaryColor || "#6b7280"}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">Used for callouts, highlights, and accents</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={template.branding.secondaryColor || "#6b7280"}
                    onChange={(e) => {
                      setSelectedPreset(null);
                      updateBranding({ secondaryColor: e.target.value });
                    }}
                    className="w-12 h-10 rounded border cursor-pointer bg-background"
                  />
                  <Input
                    value={template.branding.secondaryColor || "#6b7280"}
                    onChange={(e) => {
                      setSelectedPreset(null);
                      updateBranding({ secondaryColor: e.target.value });
                    }}
                    placeholder="#6b7280"
                    className="flex-1 font-mono text-sm bg-background"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Typography */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm">Typography</h4>
                  <p className="text-xs text-muted-foreground">Choose fonts for your documents</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <Label className="text-sm font-medium">Heading Font</Label>
                <p className="text-[10px] text-muted-foreground">Used for titles and section headers</p>
                <Select value={headingFont} onValueChange={(v) => {
                  setSelectedPreset(null);
                  setHeadingFont(v);
                }}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {FONT_OPTIONS.heading.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <Label className="text-sm font-medium">Body Font</Label>
                <p className="text-[10px] text-muted-foreground">Used for paragraphs and content</p>
                <Select value={bodyFont} onValueChange={(v) => {
                  setSelectedPreset(null);
                  setBodyFont(v);
                }}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {FONT_OPTIONS.body.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedPreset("enterprise-blue");
                  setHeadingFont("Inter, sans-serif");
                  setBodyFont("Inter, sans-serif");
                  updateBranding({
                    primaryColor: "#1e40af",
                    secondaryColor: "#3b82f6",
                    logoUrl: undefined,
                    companyName: "",
                    footerText: ""
                  });
                  setLogoPreview(null);
                  toast.success("Reset to defaults");
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Live Preview Panel */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live Preview
        </h3>
        <TemplateLivePreview template={template} />
      </div>
    </div>
  );
}
