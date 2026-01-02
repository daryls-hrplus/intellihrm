interface WatermarkProps {
  text: string;
  opacity?: number;
  color?: string;
}

export function Watermark({ 
  text, 
  opacity = 0.08, 
  color = '#888888' 
}: WatermarkProps) {
  if (!text) return null;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    >
      <span
        className="text-8xl font-bold uppercase whitespace-nowrap select-none"
        style={{
          color,
          opacity,
          transform: 'rotate(-45deg)',
          letterSpacing: '0.1em',
        }}
      >
        {text}
      </span>
    </div>
  );
}
