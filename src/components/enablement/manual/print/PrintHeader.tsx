import { BrandColors } from "@/hooks/useEnablementBranding";

interface PrintHeaderProps {
  content: string;
  style: 'branded' | 'simple' | 'none';
  brandColors: BrandColors;
  sectionTitle?: string;
  logoUrl?: string;
  // New props
  showVersion?: boolean;
  version?: string;
  documentId?: string;
  showAccentLine?: boolean;
  isOddPage?: boolean;
  useAlternating?: boolean;
  alternateContentLeft?: string;
  alternateContentRight?: string;
}

export function PrintHeader({ 
  content, 
  style, 
  brandColors, 
  sectionTitle, 
  logoUrl,
  showVersion = false,
  version = '1.3.0',
  documentId,
  showAccentLine = true,
  isOddPage = true,
  useAlternating = false,
  alternateContentLeft,
  alternateContentRight
}: PrintHeaderProps) {
  if (style === 'none') return null;

  // Determine content based on alternating mode
  const displayContent = useAlternating 
    ? (isOddPage ? (alternateContentRight || content) : (alternateContentLeft || content))
    : content;

  if (style === 'branded') {
    return (
      <div className="print-header w-full">
        <div 
          className="flex items-center justify-between px-6 py-3 border-b-2"
          style={{ borderColor: brandColors.primaryColor }}
        >
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt="Company logo" className="h-8 w-auto object-contain" />
            )}
            <div className="flex flex-col">
              <span 
                className="text-sm font-semibold"
                style={{ color: brandColors.primaryColor }}
              >
                {displayContent}
              </span>
              {documentId && (
                <span className="text-xs text-muted-foreground font-mono">
                  {documentId}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {sectionTitle && (
              <span className="text-sm text-muted-foreground">
                {sectionTitle}
              </span>
            )}
            {showVersion && (
              <span 
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${brandColors.primaryColor}15`,
                  color: brandColors.primaryColor 
                }}
              >
                v{version}
              </span>
            )}
          </div>
        </div>
        {showAccentLine && (
          <div 
            className="h-0.5 w-full"
            style={{ backgroundColor: brandColors.secondaryColor }}
          />
        )}
      </div>
    );
  }

  // Simple style
  return (
    <div className="print-header w-full">
      <div className="flex items-center justify-between px-6 py-2 border-b">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img src={logoUrl} alt="Company logo" className="h-6 w-auto object-contain" />
          )}
          <span className="text-xs text-muted-foreground">{displayContent}</span>
          {documentId && (
            <span className="text-xs text-muted-foreground font-mono ml-2">
              | {documentId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {sectionTitle && (
            <span className="text-xs text-muted-foreground">{sectionTitle}</span>
          )}
          {showVersion && (
            <span className="text-xs text-muted-foreground">v{version}</span>
          )}
        </div>
      </div>
    </div>
  );
}
