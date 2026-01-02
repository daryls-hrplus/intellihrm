import { BrandColors } from "@/hooks/useEnablementBranding";

interface ChapterTitlePageProps {
  chapterNumber: number;
  title: string;
  description?: string;
  brandColors: BrandColors;
  style: 'branded' | 'minimal' | 'corporate';
}

export function ChapterTitlePage({
  chapterNumber,
  title,
  description,
  brandColors,
  style
}: ChapterTitlePageProps) {
  const getBgColor = () => {
    switch (style) {
      case 'branded':
        return brandColors.primaryColor;
      case 'corporate':
        return '#f8f9fa';
      default:
        return 'white';
    }
  };

  const getTextColor = () => {
    return style === 'branded' ? 'white' : brandColors.primaryColor;
  };

  const getSecondaryTextColor = () => {
    return style === 'branded' ? 'rgba(255,255,255,0.8)' : '#6b7280';
  };

  return (
    <div 
      className="w-full h-full flex flex-col justify-center relative overflow-hidden"
      style={{ backgroundColor: getBgColor() }}
    >
      {/* Decorative element for corporate style */}
      {style === 'corporate' && (
        <>
          <div 
            className="absolute top-0 left-0 right-0 h-3"
            style={{ backgroundColor: brandColors.secondaryColor }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{ backgroundColor: brandColors.primaryColor }}
          />
        </>
      )}

      {/* Accent line for minimal style */}
      {style === 'minimal' && (
        <div 
          className="absolute left-12 top-1/2 w-1 h-32 -translate-y-1/2"
          style={{ backgroundColor: brandColors.primaryColor }}
        />
      )}

      <div className={`px-16 ${style === 'minimal' ? 'pl-20' : ''}`}>
        {/* Chapter number */}
        <div 
          className="text-sm font-medium uppercase tracking-widest mb-4"
          style={{ color: getSecondaryTextColor() }}
        >
          Chapter {chapterNumber}
        </div>

        {/* Title */}
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ color: getTextColor() }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p 
            className="text-lg max-w-lg"
            style={{ color: getSecondaryTextColor() }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
