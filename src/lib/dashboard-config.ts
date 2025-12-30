import { cn } from '@/lib/utils';

// Semantic color mappings for dashboard values
export const SEMANTIC_COLORS = {
  positive: {
    success: 'text-success',
    primary: 'text-primary',
  },
  negative: {
    destructive: 'text-destructive',
    warning: 'text-warning',
  },
  warning: {
    warning: 'text-warning',
    muted: 'text-muted-foreground',
  },
  neutral: {
    foreground: 'text-foreground',
    'muted-foreground': 'text-muted-foreground',
  },
} as const;

// Card spacing utilities
export const CARD_SPACING = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

// Card radius utilities
export const CARD_RADIUS = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
} as const;

// Value size utilities
export const VALUE_SIZES = {
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
} as const;

// Grid column configurations
export const STATS_GRID_COLS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
} as const;

// Icon container styles
export const ICON_STYLES = {
  accent: 'bg-accent text-accent-foreground',
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
} as const;

// Card variant styles
export const CARD_VARIANTS = {
  default: cn(
    'bg-card border shadow-sm',
    'hover:shadow-md transition-shadow duration-200'
  ),
  minimal: cn(
    'bg-card/50 border-transparent',
    'hover:bg-card transition-colors duration-200'
  ),
  elevated: cn(
    'bg-card border shadow-md',
    'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'
  ),
} as const;

// Animation classes
export const ANIMATIONS = {
  slideUp: 'animate-slide-up',
  fadeIn: 'animate-fade-in',
  none: '',
} as const;

// Get semantic color class based on value type
export function getSemanticColor(
  type: 'positive' | 'negative' | 'warning' | 'neutral',
  colorKey: string
): string {
  const colorMap = SEMANTIC_COLORS[type];
  return (colorMap as any)[colorKey] || 'text-foreground';
}

// Build stat card classes based on configuration
export function buildStatCardClasses(config: {
  variant: 'default' | 'minimal' | 'elevated';
  showBorder: boolean;
  showShadow: boolean;
  radius: 'sm' | 'md' | 'lg';
  animate: boolean;
  delay?: number;
}): string {
  const classes = [
    'relative overflow-hidden p-6 transition-all duration-300',
    CARD_RADIUS[config.radius],
  ];

  // Add variant styles
  if (config.variant === 'minimal') {
    classes.push('bg-card/50');
  } else if (config.variant === 'elevated') {
    classes.push('bg-card hover:-translate-y-0.5');
  } else {
    classes.push('bg-card');
  }

  // Add border
  if (config.showBorder) {
    classes.push('border');
  }

  // Add shadow
  if (config.showShadow) {
    classes.push(config.variant === 'elevated' ? 'shadow-md hover:shadow-lg' : 'shadow-sm hover:shadow-md');
  }

  // Add animation
  if (config.animate) {
    classes.push('animate-slide-up');
  }

  return cn(...classes);
}
