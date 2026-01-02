import { BrandColors } from "@/hooks/useEnablementBranding";
import { Book } from "lucide-react";

interface CoverPageProps {
  title: string;
  subtitle?: string;
  version: string;
  date: string;
  companyName: string;
  style: 'branded' | 'minimal' | 'corporate';
  brandColors: BrandColors;
}

export function CoverPage({ 
  title, 
  subtitle, 
  version, 
  date, 
  companyName, 
  style, 
  brandColors 
}: CoverPageProps) {
  if (style === 'branded') {
    return (
      <div 
        className="print-cover w-full h-full flex flex-col justify-center items-center text-center p-12"
        style={{ 
          backgroundColor: brandColors.primaryColor,
          minHeight: '100vh',
          pageBreakAfter: 'always'
        }}
      >
        <div className="mb-8">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Book className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-medium text-white/80 mb-2">{companyName}</h2>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl text-white/80 mb-8 max-w-xl">
            {subtitle}
          </p>
        )}
        
        <div className="mt-auto pt-12">
          <div className="flex items-center gap-6 text-white/70 text-sm">
            <span>Version {version}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    );
  }

  if (style === 'minimal') {
    return (
      <div 
        className="print-cover w-full h-full flex flex-col justify-center items-center text-center p-12 bg-white"
        style={{ minHeight: '100vh', pageBreakAfter: 'always' }}
      >
        <div className="mb-12">
          <div 
            className="w-16 h-1 mx-auto mb-8"
            style={{ backgroundColor: brandColors.primaryColor }}
          />
          <h2 className="text-lg font-medium text-muted-foreground mb-2">{companyName}</h2>
        </div>
        
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl leading-tight"
          style={{ color: brandColors.primaryColor }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">
            {subtitle}
          </p>
        )}
        
        <div className="mt-auto pt-12">
          <div 
            className="w-16 h-1 mx-auto mb-6"
            style={{ backgroundColor: brandColors.accentColor }}
          />
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span>Version {version}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    );
  }

  // Corporate style
  return (
    <div 
      className="print-cover w-full h-full flex flex-col bg-white"
      style={{ minHeight: '100vh', pageBreakAfter: 'always' }}
    >
      {/* Top band */}
      <div 
        className="h-32 w-full flex items-center px-12"
        style={{ backgroundColor: brandColors.secondaryColor }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Book className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">{companyName}</h2>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 flex flex-col justify-center px-12 py-16">
        <div 
          className="w-24 h-1 mb-8"
          style={{ backgroundColor: brandColors.primaryColor }}
        />
        
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl leading-tight"
          style={{ color: brandColors.secondaryColor }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">
            {subtitle}
          </p>
        )}
        
        <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-muted">Version {version}</span>
          <span>{date}</span>
        </div>
      </div>
      
      {/* Bottom accent */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: brandColors.accentColor }}
      />
    </div>
  );
}
