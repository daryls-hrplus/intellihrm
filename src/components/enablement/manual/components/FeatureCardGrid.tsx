import { cn } from '@/lib/utils';

interface FeatureCardGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

const columnConfig = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export function FeatureCardGrid({ columns = 2, children, className }: FeatureCardGridProps) {
  return (
    <div className={cn('grid gap-4', columnConfig[columns], className)}>
      {children}
    </div>
  );
}
