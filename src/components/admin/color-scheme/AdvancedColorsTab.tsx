import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

const COLOR_GROUPS = {
  "Base Colors": ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground"],
  "Brand Colors": ["primary", "primary-foreground", "secondary", "secondary-foreground"],
  "UI States": ["muted", "muted-foreground", "accent", "accent-foreground"],
  "Status Colors": ["destructive", "destructive-foreground", "success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"],
  "Form Elements": ["border", "input", "ring"],
  "Sidebar": ["sidebar-background", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"],
};

interface AdvancedColorsTabProps {
  colors: Record<string, string>;
  onColorChange: (key: string, hexValue: string) => void;
}

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

const formatLabel = (key: string) => {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const AdvancedColorsTab = ({ colors, onColorChange }: AdvancedColorsTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Advanced Color Settings
          </CardTitle>
          <CardDescription>
            Fine-tune individual colors for complete control over your theme. Changes are reflected in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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
                          onChange={(e) => onColorChange(key, e.target.value)}
                          className="w-full h-10 cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {colors[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
