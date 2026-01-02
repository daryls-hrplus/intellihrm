import { BrandColors } from "@/hooks/useEnablementBranding";

interface PrintHeaderProps {
  content: string;
  style: 'branded' | 'simple' | 'none';
  brandColors: BrandColors;
  sectionTitle?: string;
  logoUrl?: string;
}

export function PrintHeader({ content, style, brandColors, sectionTitle, logoUrl }: PrintHeaderProps) {
  if (style === 'none') return null;

  if (style === 'branded') {
    return (
      <div 
        className="print-header w-full flex items-center justify-between px-6 py-3 border-b-2"
        style={{ borderColor: brandColors.primaryColor }}
      >
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img src={logoUrl} alt="Company logo" className="h-8 w-auto object-contain" />
          )}
          <span 
            className="text-sm font-semibold"
            style={{ color: brandColors.primaryColor }}
          >
            {content}
          </span>
        </div>
        {sectionTitle && (
          <span className="text-sm text-muted-foreground">
            {sectionTitle}
          </span>
        )}
      </div>
    );
  }

  // Simple style
  return (
    <div className="print-header w-full flex items-center justify-between px-6 py-2 border-b">
      <div className="flex items-center gap-2">
        {logoUrl && (
          <img src={logoUrl} alt="Company logo" className="h-6 w-auto object-contain" />
        )}
        <span className="text-xs text-muted-foreground">{content}</span>
      </div>
      {sectionTitle && (
        <span className="text-xs text-muted-foreground">{sectionTitle}</span>
      )}
    </div>
  );
}
