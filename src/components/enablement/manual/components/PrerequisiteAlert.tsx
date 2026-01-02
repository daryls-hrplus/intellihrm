import { AlertCircle } from 'lucide-react';

interface PrerequisiteAlertProps {
  items: string[];
}

export function PrerequisiteAlert({ items }: PrerequisiteAlertProps) {
  return (
    <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg my-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground">Prerequisites</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these items before proceeding with this section:
          </p>
          <ul className="mt-2 space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
