import { MapPin, ChevronRight } from 'lucide-react';

interface NavigationPathProps {
  path: string[];
}

export function NavigationPath({ path }: NavigationPathProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm font-medium text-primary">System Path:</span>
      <div className="flex items-center gap-1 flex-wrap">
        {path.map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="text-sm text-foreground">{segment}</span>
            {index < path.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
