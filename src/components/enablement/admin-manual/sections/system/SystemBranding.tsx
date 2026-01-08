import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Palette, Image, Type, Eye, CheckCircle, Monitor, Smartphone } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const BRANDING_ELEMENTS = [
  { element: "Primary Logo", specs: "SVG or PNG, max 200KB, transparent background recommended", usage: "Header, login page, reports" },
  { element: "Favicon", specs: "ICO or PNG, 32x32 or 64x64 pixels", usage: "Browser tab icon" },
  { element: "Email Logo", specs: "PNG, 200x50 pixels max, under 50KB", usage: "Email notifications, digests" },
  { element: "Report Header", specs: "PNG, 600x100 pixels, white or transparent bg", usage: "PDF exports, printed reports" },
];

const COLOR_CUSTOMIZATIONS = [
  { name: "Primary Color", description: "Main brand color used for buttons, links, and accents", example: "#0066CC" },
  { name: "Secondary Color", description: "Complementary color for secondary actions", example: "#6C757D" },
  { name: "Accent Color", description: "Highlight color for notifications and badges", example: "#28A745" },
  { name: "Header Background", description: "Navigation header background color", example: "#1A1A2E" },
  { name: "Sidebar Background", description: "Left navigation panel background", example: "#FFFFFF" },
];

export function SystemBranding() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Customize the visual appearance of Intelli HRM to match your organization's brand identity. 
        Changes apply system-wide across all users and exported documents.
      </p>

      {/* Logo Management */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Image className="h-4 w-4 text-blue-500" />
          Logo Management
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Element</th>
                <th className="text-left p-3 font-medium">Specifications</th>
                <th className="text-left p-3 font-medium">Usage</th>
              </tr>
            </thead>
            <tbody>
              {BRANDING_ELEMENTS.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{item.element}</td>
                  <td className="p-3 text-muted-foreground">{item.specs}</td>
                  <td className="p-3">{item.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.8.1: Logo upload interface with preview for different contexts"
        alt="Logo management panel showing upload areas for different logo types with live preview"
      />

      {/* Color Scheme */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-purple-500" />
          Color Scheme Configuration
        </h4>
        <div className="space-y-3">
          {COLOR_CUSTOMIZATIONS.map((color, index) => (
            <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{color.name}</p>
                <p className="text-xs text-muted-foreground">{color.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg border shadow-sm"
                  style={{ backgroundColor: color.example }}
                />
                <Badge variant="outline" className="font-mono text-xs">
                  {color.example}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.8.2: Color scheme editor with real-time preview"
        alt="Color picker interface with theme preview showing how colors appear in the UI"
      />

      {/* Typography */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Type className="h-4 w-4 text-green-500" />
          Typography Settings
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Available Font Families</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Inter (Default - Modern, readable)</li>
              <li>• Roboto (Clean, professional)</li>
              <li>• Open Sans (Friendly, accessible)</li>
              <li>• Source Sans Pro (Technical, precise)</li>
              <li>• Custom font (upload TTF/WOFF)</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Size & Spacing</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Base font size: 14px - 18px</li>
              <li>• Heading scale: 1.2x - 1.5x</li>
              <li>• Line height: Normal / Relaxed</li>
              <li>• Compact mode for dense layouts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modes */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-amber-500" />
          Preview & Testing
        </h4>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="gap-1">
              <Monitor className="h-3 w-3" />
              Desktop Preview
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile Preview
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the preview mode to see how branding changes will appear before publishing. 
            Changes can be saved as draft and reviewed before applying to production.
          </p>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.8.3: Theme preview showing desktop and mobile views side by side"
        alt="Split view showing branding applied to desktop and mobile interfaces"
      />

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Test your color scheme with the accessibility checker to ensure sufficient 
          contrast ratios for users with visual impairments. WCAG AA compliance is recommended.
        </AlertDescription>
      </Alert>
    </div>
  );
}
