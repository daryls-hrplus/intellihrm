import { ImageIcon } from 'lucide-react';

interface ScreenshotPlaceholderProps {
  caption: string;
  alt?: string;
  aspectRatio?: 'wide' | 'square' | 'tall';
  imageSrc?: string;
}

export function ScreenshotPlaceholder({ 
  caption, 
  alt, 
  aspectRatio = 'wide',
  imageSrc
}: ScreenshotPlaceholderProps) {
  const heightClass = {
    wide: 'aspect-video',
    square: 'aspect-square',
    tall: 'aspect-[3/4]'
  }[aspectRatio];

  return (
    <figure className="my-4">
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={alt || caption}
          className={`w-full rounded-lg border border-border shadow-sm object-cover`}
        />
      ) : (
        <div className={`${heightClass} w-full bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-2`}>
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          <span className="text-sm text-muted-foreground/60 text-center px-4">
            {alt || 'Screenshot placeholder'}
          </span>
        </div>
      )}
      <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
        {caption}
      </figcaption>
    </figure>
  );
}
