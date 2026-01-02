import { BrandColors } from "@/hooks/useEnablementBranding";

interface PrintFooterProps {
  content: string;
  pageNumber: number;
  totalPages?: number;
  position: 'left' | 'center' | 'right';
  format: 'simple' | 'pageOf' | 'pageOfTotal';
  brandColors: BrandColors;
  // New props
  style?: 'branded' | 'simple';
  copyrightText?: string;
  showPrintDate?: boolean;
  showLastUpdated?: boolean;
  lastUpdatedDate?: string;
  effectiveDate?: string;
  showBottomAccent?: boolean;
}

export function PrintFooter({ 
  content, 
  pageNumber, 
  totalPages,
  position, 
  format, 
  brandColors,
  style = 'simple',
  copyrightText,
  showPrintDate = false,
  showLastUpdated = false,
  lastUpdatedDate,
  effectiveDate,
  showBottomAccent = false
}: PrintFooterProps) {
  const getPageNumberText = () => {
    switch (format) {
      case 'simple':
        return String(pageNumber);
      case 'pageOf':
        return `Page ${pageNumber}`;
      case 'pageOfTotal':
        return `Page ${pageNumber} of ${totalPages || '—'}`;
      default:
        return String(pageNumber);
    }
  };

  const pageNumberElement = (
    <span 
      className="text-sm font-medium"
      style={{ color: style === 'branded' ? brandColors.primaryColor : undefined }}
    >
      {getPageNumberText()}
    </span>
  );

  // Build metadata items
  const metadataItems: string[] = [];
  
  if (effectiveDate) {
    metadataItems.push(`Effective: ${effectiveDate}`);
  }
  
  if (showLastUpdated && lastUpdatedDate) {
    metadataItems.push(`Updated: ${lastUpdatedDate}`);
  }
  
  if (showPrintDate) {
    metadataItems.push(`Printed: ${new Date().toLocaleDateString()}`);
  }

  const metadataText = metadataItems.join(' | ');

  if (style === 'branded') {
    return (
      <div className="print-footer w-full mt-auto">
        {showBottomAccent && (
          <div 
            className="h-0.5 w-full mb-2"
            style={{ backgroundColor: brandColors.secondaryColor }}
          />
        )}
        <div 
          className="flex items-center justify-between px-6 py-3 border-t"
          style={{ borderColor: `${brandColors.primaryColor}30` }}
        >
          <div className="flex-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{content}</span>
              {metadataText && (
                <span className="text-xs text-muted-foreground">{metadataText}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center">
            {position === 'center' && pageNumberElement}
          </div>
          
          <div className="flex-1 text-right flex flex-col items-end gap-0.5">
            {position === 'right' && pageNumberElement}
            {copyrightText && (
              <span className="text-xs text-muted-foreground">{copyrightText}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simple style - original behavior with enhancements
  return (
    <div className="print-footer w-full mt-auto">
      {showBottomAccent && (
        <div 
          className="h-0.5 w-full mb-2"
          style={{ backgroundColor: brandColors.secondaryColor }}
        />
      )}
      <div className="flex items-center justify-between px-6 py-3 border-t">
        <div className="flex-1 text-left">
          {position === 'left' ? pageNumberElement : (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{content}</span>
              {metadataText && (
                <span className="text-xs text-muted-foreground">{metadataText}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center">
          {position === 'center' && pageNumberElement}
        </div>
        
        <div className="flex-1 text-right flex flex-col items-end gap-0.5">
          {position === 'right' ? pageNumberElement : (
            copyrightText && (
              <span className="text-xs text-muted-foreground">{copyrightText}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
