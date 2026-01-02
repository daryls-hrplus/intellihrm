import { AlertTriangle } from 'lucide-react';

interface PrerequisiteAlertProps {
  items: string[];
}

export function PrerequisiteAlert({ items }: PrerequisiteAlertProps) {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg my-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800 dark:text-amber-200">Prerequisites</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Complete these items before proceeding with this section:
          </p>
          <ul className="mt-2 space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
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
