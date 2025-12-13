import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColorScheme, DEFAULT_COLORS, applyColors } from "@/hooks/useColorScheme";
import { RotateCcw, Save, Eye, EyeOff, Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const COLOR_GROUPS = {
  "Base Colors": ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground"],
  "Brand Colors": ["primary", "primary-foreground", "secondary", "secondary-foreground"],
  "UI States": ["muted", "muted-foreground", "accent", "accent-foreground"],
  "Status Colors": ["destructive", "destructive-foreground", "success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"],
  "Form Elements": ["border", "input", "ring"],
  "Sidebar": ["sidebar-background", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"],
};

const hslToHex = (hsl: string): string => {
  const parts = hsl.split(" ").map((p) => parseFloat(p.replace("%", "")));
  if (parts.length < 3) return "#000000";
  
  const [h, s, l] = parts;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lDecimal - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const AdminColorSchemePage = () => {
  const { activeScheme, saveScheme, resetToDefault, isLoading } = useColorScheme();
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [previewing, setPreviewing] = useState(false);
  const [originalColors, setOriginalColors] = useState<Record<string, string>>(DEFAULT_COLORS);

  useEffect(() => {
    // Get current CSS variable values as the baseline
    const currentColors: Record<string, string> = {};
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    Object.keys(DEFAULT_COLORS).forEach((key) => {
      const value = computedStyle.getPropertyValue(`--${key}`).trim();
      currentColors[key] = value || DEFAULT_COLORS[key];
    });
    
    setOriginalColors(currentColors);
    
    if (activeScheme?.colors) {
      setColors(activeScheme.colors);
    } else {
      setColors(currentColors);
    }
  }, [activeScheme]);

  const handleColorChange = (key: string, hexValue: string) => {
    const hslValue = hexToHsl(hexValue);
    setColors((prev) => ({ ...prev, [key]: hslValue }));
  };

  const handlePreview = () => {
    if (previewing) {
      // Restore original colors
      applyColors(originalColors);
      setPreviewing(false);
    } else {
      // Apply preview colors
      applyColors(colors);
      setPreviewing(true);
    }
  };

  const handleSave = () => {
    saveScheme.mutate(colors);
    setOriginalColors(colors);
    setPreviewing(false);
  };

  const handleReset = () => {
    resetToDefault.mutate();
    setColors(DEFAULT_COLORS);
    setOriginalColors(DEFAULT_COLORS);
    setPreviewing(false);
  };

  const formatLabel = (key: string) => {
    return key
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Color Scheme</h1>
            <p className="text-muted-foreground">
              Customize the application's color theme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              className="gap-2"
            >
              {previewing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewing ? "Exit Preview" : "Preview"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetToDefault.isPending}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveScheme.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Theme
            </Button>
          </div>
        </div>

        {previewing && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="py-3">
              <p className="text-sm text-warning-foreground flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Preview mode active. Changes are temporary until you save.
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="Base Colors" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            {Object.keys(COLOR_GROUPS).map((group) => (
              <TabsTrigger key={group} value={group} className="text-xs">
                {group}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(COLOR_GROUPS).map(([group, keys]) => (
            <TabsContent key={group} value={group}>
              <Card>
                <CardHeader>
                  <CardTitle>{group}</CardTitle>
                  <CardDescription>
                    Customize {group.toLowerCase()} for the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {keys.map((key) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="text-sm font-medium">
                          {formatLabel(key)}
                        </Label>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-md border shadow-sm flex-shrink-0"
                            style={{ backgroundColor: `hsl(${colors[key]})` }}
                          />
                          <Input
                            id={key}
                            type="color"
                            value={hslToHex(colors[key])}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="w-full h-10 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {colors[key]}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your color choices look on sample UI elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: `hsl(${colors.background})` }}>
                <h3 className="font-semibold" style={{ color: `hsl(${colors.foreground})` }}>
                  Light Background Preview
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Button style={{ backgroundColor: `hsl(${colors.primary})`, color: `hsl(${colors["primary-foreground"]})` }}>
                    Primary
                  </Button>
                  <Button style={{ backgroundColor: `hsl(${colors.secondary})`, color: `hsl(${colors["secondary-foreground"]})` }}>
                    Secondary
                  </Button>
                  <Button style={{ backgroundColor: `hsl(${colors.destructive})`, color: `hsl(${colors["destructive-foreground"]})` }}>
                    Destructive
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button style={{ backgroundColor: `hsl(${colors.success})`, color: `hsl(${colors["success-foreground"]})` }}>
                    Success
                  </Button>
                  <Button style={{ backgroundColor: `hsl(${colors.warning})`, color: `hsl(${colors["warning-foreground"]})` }}>
                    Warning
                  </Button>
                  <Button style={{ backgroundColor: `hsl(${colors.info})`, color: `hsl(${colors["info-foreground"]})` }}>
                    Info
                  </Button>
                </div>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: `hsl(${colors.card})`,
                    borderColor: `hsl(${colors.border})`,
                  }}
                >
                  <p style={{ color: `hsl(${colors["card-foreground"]})` }}>
                    This is a card with sample content
                  </p>
                  <p className="text-sm mt-2" style={{ color: `hsl(${colors["muted-foreground"]})` }}>
                    Muted text for descriptions
                  </p>
                </div>
              </div>

              <div 
                className="space-y-4 p-4 rounded-lg"
                style={{ backgroundColor: `hsl(${colors["sidebar-background"]})` }}
              >
                <h3 className="font-semibold" style={{ color: `hsl(${colors["sidebar-foreground"]})` }}>
                  Sidebar Preview
                </h3>
                <div className="space-y-2">
                  <div 
                    className="p-3 rounded-md"
                    style={{ 
                      backgroundColor: `hsl(${colors["sidebar-accent"]})`,
                      color: `hsl(${colors["sidebar-accent-foreground"]})`,
                    }}
                  >
                    Active Menu Item
                  </div>
                  <div 
                    className="p-3 rounded-md"
                    style={{ color: `hsl(${colors["sidebar-foreground"]})` }}
                  >
                    Inactive Menu Item
                  </div>
                  <Separator style={{ backgroundColor: `hsl(${colors["sidebar-border"]})` }} />
                  <div 
                    className="p-2 rounded text-sm"
                    style={{ 
                      backgroundColor: `hsl(${colors["sidebar-primary"]})`,
                      color: `hsl(${colors["sidebar-primary-foreground"]})`,
                    }}
                  >
                    Primary Action
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminColorSchemePage;
