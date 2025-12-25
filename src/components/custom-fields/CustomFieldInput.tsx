import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CustomFieldDefinition, ValidationRules } from '@/types/customFields';

interface CustomFieldInputProps {
  field: CustomFieldDefinition;
  value: string | number | boolean | string[] | null;
  onChange: (value: string | number | boolean | string[] | null) => void;
  disabled?: boolean;
  error?: string;
}

export function CustomFieldInput({ field, value, onChange, disabled, error }: CustomFieldInputProps) {
  const renderInput = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            type={field.field_type === 'email' ? 'email' : field.field_type === 'url' ? 'url' : 'text'}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            {...getValidationProps(field.validation_rules)}
          />
        );

      case 'number':
      case 'currency':
        return (
          <Input
            type="number"
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder={field.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            min={field.validation_rules?.min}
            max={field.validation_rules?.max}
            step={field.field_type === 'currency' ? '0.01' : undefined}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => onChange(!!checked)}
              disabled={disabled}
            />
            <Label htmlFor={field.id} className="text-sm text-muted-foreground">
              {field.placeholder || 'Yes'}
            </Label>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            rows={3}
            maxLength={field.validation_rules?.maxLength}
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => onChange(val || null)}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.filter(opt => opt.is_active).map((option) => (
                <SelectItem key={option.id} value={option.option_value}>
                  {option.option_label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.filter(opt => opt.is_active).map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.id}`}
                  checked={selectedValues.includes(option.option_value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option.option_value]);
                    } else {
                      onChange(selectedValues.filter(v => v !== option.option_value));
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${field.id}-${option.id}`} className="text-sm">
                  {option.option_label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.field_label}
          {field.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.help_text && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{field.help_text}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderInput()}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function getValidationProps(rules?: ValidationRules) {
  if (!rules) return {};
  
  const props: Record<string, unknown> = {};
  
  if (rules.minLength) props.minLength = rules.minLength;
  if (rules.maxLength) props.maxLength = rules.maxLength;
  if (rules.pattern) props.pattern = rules.pattern;
  
  return props;
}
