import React, { useMemo } from 'react';
import { useCustomFields } from '@/hooks/useCustomFields';
import { CustomFieldInput } from './CustomFieldInput';
import { Skeleton } from '@/components/ui/skeleton';
import type { CustomFieldFormContext } from '@/types/customFields';

interface CustomFieldsRendererProps {
  formContext: CustomFieldFormContext;
  entityId?: string;
  entityType?: string;
  companyId?: string | null;
  values?: Record<string, string | number | boolean | string[] | null>;
  onChange?: (fieldId: string, value: string | number | boolean | string[] | null) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  className?: string;
}

export function CustomFieldsRenderer({
  formContext,
  entityId,
  entityType,
  companyId,
  values: externalValues,
  onChange: externalOnChange,
  disabled,
  errors,
  className,
}: CustomFieldsRendererProps) {
  const { fields, values: internalValues, updateValue, isLoading } = useCustomFields({
    formContext,
    entityId,
    entityType,
    companyId,
  });

  // Use external values/onChange if provided, otherwise use internal state
  const values = externalValues ?? internalValues;
  const handleChange = externalOnChange ?? updateValue;

  // Group fields by section
  const groupedFields = useMemo(() => {
    const groups: Record<string, typeof fields> = {};
    
    fields.forEach(field => {
      const section = field.section_name || 'Additional Information';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
    });

    return groups;
  }, [fields]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (fields.length === 0) {
    return null;
  }

  const sections = Object.entries(groupedFields);

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {sections.map(([sectionName, sectionFields]) => (
        <div key={sectionName} className="space-y-4">
          {sections.length > 1 && (
            <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
              {sectionName}
            </h4>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {sectionFields.map(field => (
              <CustomFieldInput
                key={field.id}
                field={field}
                value={values[field.id] ?? null}
                onChange={(value) => handleChange(field.id, value)}
                disabled={disabled}
                error={errors?.[field.id]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper hook to expose saveValues for external use
export { useCustomFields };
