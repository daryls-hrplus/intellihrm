import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColorScheme, DEFAULT_COLORS, applyColors, hexToHsl } from "@/hooks/useColorScheme";
import { RotateCcw, Save, Eye, EyeOff, Palette, Wand2, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BrandWizardTab } from "@/components/admin/color-scheme/BrandWizardTab";
import { ColorPresetsTab } from "@/components/admin/color-scheme/ColorPresetsTab";
import { AdvancedColorsTab } from "@/components/admin/color-scheme/AdvancedColorsTab";

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

  const handleApplyColors = (newColors: Record<string, string>) => {
    setColors(newColors);
    applyColors(newColors);
    setPreviewing(true);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Color Scheme</h1>
            <p className="text-muted-foreground">
              Customize the application's color theme to match your brand
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
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/50">
            <CardContent className="py-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2 font-medium">
                <Palette className="h-4 w-4" />
                Preview mode active. Changes are temporary until you save.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main 3-Tab Structure */}
        <Tabs defaultValue="wizard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="wizard" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Brand Wizard
            </TabsTrigger>
            <TabsTrigger value="presets" className="gap-2">
              <Palette className="h-4 w-4" />
              Quick Presets
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wizard">
            <BrandWizardTab onApplyColors={handleApplyColors} />
          </TabsContent>

          <TabsContent value="presets">
            <ColorPresetsTab 
              onApplyColors={handleApplyColors} 
              currentColors={colors}
            />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedColorsTab 
              colors={colors}
              onColorChange={handleColorChange}
            />
          </TabsContent>
        </Tabs>

        {/* Live Preview Card */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <h3 className="font-semibold">Live Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: `hsl(${colors.background})` }}>
                <h4 className="font-medium" style={{ color: `hsl(${colors.foreground})` }}>
                  Light Background
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <Button style={{ backgroundColor: `hsl(${colors.primary})`, color: `hsl(${colors["primary-foreground"]})` }}>
                    Primary
                  </Button>
                  <Button style={{ backgroundColor: `hsl(${colors.secondary})`, color: `hsl(${colors["secondary-foreground"]})` }}>
                    Secondary
                  </Button>
                  <Button style={{ backgroundColor: `hsl(${colors.success})`, color: `hsl(${colors["success-foreground"]})` }}>
                    Success
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
                    Card content preview
                  </p>
                  <p className="text-sm mt-1" style={{ color: `hsl(${colors["muted-foreground"]})` }}>
                    Muted text
                  </p>
                </div>
              </div>

              <div 
                className="space-y-4 p-4 rounded-lg"
                style={{ backgroundColor: `hsl(${colors["sidebar-background"]})` }}
              >
                <h4 className="font-medium" style={{ color: `hsl(${colors["sidebar-foreground"]})` }}>
                  Sidebar Preview
                </h4>
                <div className="space-y-2">
                  <div 
                    className="p-3 rounded-md"
                    style={{ 
                      backgroundColor: `hsl(${colors["sidebar-accent"]})`,
                      color: `hsl(${colors["sidebar-accent-foreground"]})`,
                    }}
                  >
                    Active Item
                  </div>
                  <div 
                    className="p-3 rounded-md"
                    style={{ color: `hsl(${colors["sidebar-foreground"]})` }}
                  >
                    Inactive Item
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
