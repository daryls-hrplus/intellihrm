import { APPRAISALS_MANUAL_STRUCTURE, ManualSection } from "@/types/adminManual";
import { BrandColors } from "@/hooks/useEnablementBranding";

interface TableOfContentsProps {
  brandColors: BrandColors;
  depth?: 1 | 2 | 3;
  showPageNumbers?: boolean;
}

export function TableOfContents({ 
  brandColors, 
  depth = 2, 
  showPageNumbers = true 
}: TableOfContentsProps) {
  // Calculate estimated page numbers based on content
  const calculatePageNumbers = () => {
    let currentPage = 3; // Start after cover and TOC
    const pageMap: Record<string, number> = {};
    
    APPRAISALS_MANUAL_STRUCTURE.forEach((section) => {
      pageMap[section.id] = currentPage;
      // Estimate ~2 pages per 10 min read time
      const sectionPages = Math.ceil(section.estimatedReadTime / 5);
      
      if (depth >= 2 && section.subsections) {
        let subsectionPage = currentPage + 1;
        section.subsections.forEach((sub, idx) => {
          if (idx > 0) {
            subsectionPage += Math.ceil(sub.estimatedReadTime / 8);
          }
          pageMap[sub.id] = subsectionPage;
        });
      }
      
      currentPage += sectionPages;
    });
    
    return pageMap;
  };

  const pageNumbers = calculatePageNumbers();

  const renderSection = (section: ManualSection, level: number = 1) => {
    if (level > depth) return null;
    
    const isTopLevel = level === 1;
    
    return (
      <div key={section.id} className={level > 1 ? 'ml-6' : ''}>
        <div 
          className={`flex items-center gap-2 py-1 ${isTopLevel ? 'border-b border-border/30' : ''}`}
        >
          <span 
            className={`font-mono flex-shrink-0 ${isTopLevel ? 'font-bold text-sm' : 'text-xs'}`}
            style={{ color: isTopLevel ? brandColors.primaryColor : undefined }}
          >
            {section.sectionNumber}
          </span>
          <span 
            className={`flex-shrink-0 ${isTopLevel ? 'font-semibold text-sm' : 'text-xs text-muted-foreground'}`}
          >
            {section.title}
          </span>
          {showPageNumbers && (
            <>
              <span className="flex-1 text-muted-foreground text-xs overflow-hidden whitespace-nowrap">
                {'·'.repeat(isTopLevel ? 30 : 20)}
              </span>
              <span 
                className="font-mono text-xs min-w-[3ch] text-right flex-shrink-0"
                style={{ color: brandColors.primaryColor }}
              >
                {pageNumbers[section.id] || '—'}
              </span>
            </>
          )}
        </div>
        
        {level < depth && section.subsections && (
          <div className="ml-2">
            {section.subsections.map((sub) => renderSection(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="print-toc w-full p-12 bg-white overflow-hidden"
      style={{ maxHeight: 'calc(297mm - 80px)' }}
    >
      <h2 
        className="text-2xl font-bold mb-6 pb-4 border-b-2"
        style={{ borderColor: brandColors.primaryColor, color: brandColors.secondaryColor }}
      >
        Table of Contents
      </h2>
      
      <div className="space-y-0.5 overflow-hidden">
        {APPRAISALS_MANUAL_STRUCTURE.map((section) => renderSection(section))}
      </div>
      
      {/* Appendices */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 
          className="text-base font-semibold mb-3"
          style={{ color: brandColors.secondaryColor }}
        >
          Appendices
        </h3>
        <div className="space-y-1">
          {[
            { id: 'quick-ref', title: 'Quick Reference Cards', page: 95 },
            { id: 'diagrams', title: 'System Diagrams', page: 102 },
            { id: 'glossary', title: 'Glossary of Terms', page: 110 },
            { id: 'version-history', title: 'Version History', page: 118 }
          ].map((appendix) => (
            <div key={appendix.id} className="flex items-center gap-2 py-0.5">
              <span className="text-sm text-muted-foreground">{appendix.title}</span>
              {showPageNumbers && (
                <>
                  <span className="flex-1 text-muted-foreground text-xs overflow-hidden whitespace-nowrap">
                    {'·'.repeat(40)}
                  </span>
                  <span 
                    className="font-mono text-sm min-w-[3ch] text-right flex-shrink-0"
                    style={{ color: brandColors.primaryColor }}
                  >
                    {appendix.page}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
