import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Image,
  Upload,
  Palette,
  Type,
  X,
  RefreshCw,
  Eye
} from "lucide-react";
import { DocumentTemplate } from "./DocumentTemplateConfig";

interface TemplateStylingEditorProps {
  template: DocumentTemplate | null;
  onTemplateUpdate: (template: DocumentTemplate) => void;
}

const COLOR_PRESETS = [
  { name: "Corporate Blue", value: "#1e40af" },
  { name: "Professional Teal", value: "#0d9488" },
  { name: "Enterprise Purple", value: "#7c3aed" },
  { name: "Executive Green", value: "#16a34a" },
  { name: "Modern Red", value: "#dc2626" },
  { name: "Classic Black", value: "#18181b" },
  { name: "Warm Orange", value: "#ea580c" },
  { name: "Royal Indigo", value: "#4f46e5" },
];

const FONT_OPTIONS = {
  heading: [
    { name: "Inter (Modern)", value: "Inter, sans-serif" },
    { name: "Arial (Classic)", value: "Arial, sans-serif" },
    { name: "Georgia (Elegant)", value: "Georgia, serif" },
    { name: "Roboto (Clean)", value: "Roboto, sans-serif" },
    { name: "Montserrat (Bold)", value: "Montserrat, sans-serif" },
    { name: "Playfair Display (Sophisticated)", value: "Playfair Display, serif" },
  ],
  body: [
    { name: "Inter (Modern)", value: "Inter, sans-serif" },
    { name: "Arial (Classic)", value: "Arial, sans-serif" },
    { name: "Georgia (Elegant)", value: "Georgia, serif" },
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

  const handlePrimaryColorChange = (color: string) => {
    updateBranding({ primaryColor: color });
  };

  const handleSecondaryColorChange = (color: string) => {
    updateBranding({ secondaryColor: color });
  };

  return (
    <div className="space-y-6">
      {/* Current Template Info */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Palette className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium text-sm">Styling: {template.name}</p>
          <p className="text-xs text-muted-foreground">Customize branding and visual appearance</p>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Company Logo
        </Label>
        
        <div className="flex items-start gap-4">
          {logoPreview ? (
            <div className="relative">
              <div className="w-32 h-20 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={removeLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div 
              className="w-32 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Upload Logo</span>
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
            >
              <Upload className="h-4 w-4 mr-2" />
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, or SVG. Max 2MB. Recommended: 200x80px
            </p>
          </div>
        </div>

        {/* Logo Placement Options */}
        {logoPreview && (
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch 
                id="header-logo"
                checked={showHeaderLogo}
                onCheckedChange={setShowHeaderLogo}
              />
              <Label htmlFor="header-logo" className="text-sm">Show in header</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="footer-logo"
                checked={showFooterLogo}
                onCheckedChange={setShowFooterLogo}
              />
              <Label htmlFor="footer-logo" className="text-sm">Show in footer</Label>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Company Details */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Company Details
        </Label>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name" className="text-sm">Company Name</Label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={template.branding.companyName || ""}
              onChange={(e) => updateBranding({ companyName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="footer-text" className="text-sm">Footer Text</Label>
            <Textarea
              id="footer-text"
              placeholder="e.g., Confidential - Internal Use Only"
              value={template.branding.footerText || ""}
              onChange={(e) => updateBranding({ footerText: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Color Scheme */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Brand Colors
        </Label>
        
        {/* Primary Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Primary Color</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                  template.branding.primaryColor === preset.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => handlePrimaryColorChange(preset.value)}
              >
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: preset.value }}
                />
                <span className="text-xs text-center">{preset.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-primary-color" className="text-sm">Custom:</Label>
              <input
                type="color"
                id="custom-primary-color"
                value={template.branding.primaryColor}
                onChange={(e) => handlePrimaryColorChange(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
            </div>
            <Input
              value={template.branding.primaryColor}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              placeholder="#000000"
              className="w-28 font-mono text-sm"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Secondary Color</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                  template.branding.secondaryColor === preset.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => handleSecondaryColorChange(preset.value)}
              >
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: preset.value }}
                />
                <span className="text-xs text-center">{preset.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-secondary-color" className="text-sm">Custom:</Label>
              <input
                type="color"
                id="custom-secondary-color"
                value={template.branding.secondaryColor || "#6b7280"}
                onChange={(e) => handleSecondaryColorChange(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
            </div>
            <Input
              value={template.branding.secondaryColor || "#6b7280"}
              onChange={(e) => handleSecondaryColorChange(e.target.value)}
              placeholder="#6b7280"
              className="w-28 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Typography
        </Label>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="heading-font" className="text-sm">Heading Font</Label>
            <Select value={headingFont} onValueChange={setHeadingFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.heading.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body-font" className="text-sm">Body Font</Label>
            <Select value={bodyFont} onValueChange={setBodyFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.body.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Preview Card */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live Preview
        </Label>
        
        <div className="border rounded-lg overflow-hidden">
          {/* Header Preview */}
          <div 
            className="p-3 flex items-center gap-3"
            style={{ backgroundColor: template.branding.primaryColor + '15' }}
          >
            {logoPreview && showHeaderLogo && (
              <img src={logoPreview} alt="Logo" className="h-8 object-contain" />
            )}
            <div>
              <div 
                className="font-semibold text-sm"
                style={{ color: template.branding.primaryColor, fontFamily: headingFont }}
              >
                {template.branding.companyName || "Company Name"}
              </div>
              <div className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                Document Title
              </div>
            </div>
          </div>
          
          {/* Content Preview */}
          <div className="p-4 space-y-3 bg-background">
            <div 
              className="font-semibold"
              style={{ color: template.branding.primaryColor, fontFamily: headingFont }}
            >
              Section Heading
            </div>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: bodyFont }}>
              This is sample body text that demonstrates how your documentation 
              will appear with the selected fonts and colors.
            </p>
            <div 
              className="p-2 rounded text-sm"
              style={{ 
                backgroundColor: (template.branding.secondaryColor || "#6b7280") + '15',
                borderLeft: `3px solid ${template.branding.secondaryColor || "#6b7280"}`,
                fontFamily: bodyFont
              }}
            >
              This is a callout styled with your secondary color.
            </div>
          </div>
          
          {/* Footer Preview */}
          {template.branding.footerText && (
            <div className="p-2 border-t bg-muted/30 flex items-center justify-between">
              {logoPreview && showFooterLogo && (
                <img src={logoPreview} alt="Logo" className="h-5 object-contain" />
              )}
              <span className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                {template.branding.footerText}
              </span>
              <span className="text-xs text-muted-foreground">Page 1</span>
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            updateBranding({
              primaryColor: "#1e40af",
              secondaryColor: "#6b7280",
              logoUrl: undefined,
              companyName: "",
              footerText: ""
            });
            setLogoPreview(null);
            toast.success("Styling reset to defaults");
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
