import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { 
  CustomFieldDefinition, 
  CustomFieldType, 
  CustomFieldFormContext,
  CustomFieldOption,
  ValidationRules 
} from '@/types/customFields';
import { FIELD_TYPE_LABELS } from '@/types/customFields';

interface CustomFieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: CustomFieldDefinition | null;
  formContext: CustomFieldFormContext;
  onSave: (data: Partial<CustomFieldDefinition>, options?: Partial<CustomFieldOption>[]) => Promise<void>;
}

export function CustomFieldFormDialog({
  open,
  onOpenChange,
  field,
  formContext,
  onSave,
}: CustomFieldFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [fieldCode, setFieldCode] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sectionName, setSectionName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [helpText, setHelpText] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [validationRules, setValidationRules] = useState<ValidationRules>({});
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (field) {
      setFieldCode(field.field_code);
      setFieldLabel(field.field_label);
      setFieldType(field.field_type);
      setIsRequired(field.is_required);
      setIsActive(field.is_active);
      setSectionName(field.section_name || '');
      setPlaceholder(field.placeholder || '');
      setHelpText(field.help_text || '');
      setDefaultValue(field.default_value || '');
      setValidationRules(field.validation_rules || {});
      setOptions(
        field.options?.map(opt => ({
          value: opt.option_value,
          label: opt.option_label,
        })) || []
      );
    } else {
      resetForm();
    }
  }, [field, open]);

  const resetForm = () => {
    setFieldCode('');
    setFieldLabel('');
    setFieldType('text');
    setIsRequired(false);
    setIsActive(true);
    setSectionName('');
    setPlaceholder('');
    setHelpText('');
    setDefaultValue('');
    setValidationRules({});
    setOptions([]);
  };

  const handleLabelChange = (label: string) => {
    setFieldLabel(label);
    if (!field) {
      // Auto-generate field code from label
      const code = label
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 50);
      setFieldCode(code);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { value: '', label: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, key: 'value' | 'label', value: string) => {
    const updated = [...options];
    updated[index][key] = value;
    // Auto-generate value from label if value is empty
    if (key === 'label' && !updated[index].value) {
      updated[index].value = value.toLowerCase().replace(/\s+/g, '_');
    }
    setOptions(updated);
  };

  const handleSave = async () => {
    if (!fieldCode || !fieldLabel) return;

    setIsSaving(true);
    try {
      const data: Partial<CustomFieldDefinition> = {
        field_code: fieldCode,
        field_label: fieldLabel,
        field_type: fieldType,
        form_context: formContext,
        is_required: isRequired,
        is_active: isActive,
        section_name: sectionName || null,
        placeholder: placeholder || null,
        help_text: helpText || null,
        default_value: defaultValue || null,
        validation_rules: validationRules,
      };

      const fieldOptions = (fieldType === 'select' || fieldType === 'multi_select')
        ? options.map((opt, i) => ({
            option_value: opt.value,
            option_label: opt.label,
            display_order: i,
            is_active: true,
          }))
        : undefined;

      await onSave(data, fieldOptions);
      onOpenChange(false);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const showOptionsEditor = fieldType === 'select' || fieldType === 'multi_select';
  const showValidation = ['text', 'number', 'currency', 'textarea', 'email', 'phone', 'url'].includes(fieldType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fieldLabel">Field Label *</Label>
              <Input
                id="fieldLabel"
                value={fieldLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g., Employee ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldCode">Field Code *</Label>
              <Input
                id="fieldCode"
                value={fieldCode}
                onChange={(e) => setFieldCode(e.target.value)}
                placeholder="e.g., employee_id"
                disabled={!!field}
              />
              <p className="text-xs text-muted-foreground">Unique identifier (cannot be changed)</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type *</Label>
              <Select value={fieldType} onValueChange={(v) => setFieldType(v as CustomFieldType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionName">Section Name</Label>
              <Input
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Employment Details"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Placeholder text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input
                id="defaultValue"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="Default value"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Additional instructions for users"
              rows={2}
            />
          </div>

          {/* Validation Rules */}
          {showValidation && (
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Validation Rules</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {(fieldType === 'number' || fieldType === 'currency') && (
                  <>
                    <div className="space-y-2">
                      <Label>Minimum Value</Label>
                      <Input
                        type="number"
                        value={validationRules.min ?? ''}
                        onChange={(e) => setValidationRules({
                          ...validationRules,
                          min: e.target.value ? parseFloat(e.target.value) : undefined,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Value</Label>
                      <Input
                        type="number"
                        value={validationRules.max ?? ''}
                        onChange={(e) => setValidationRules({
                          ...validationRules,
                          max: e.target.value ? parseFloat(e.target.value) : undefined,
                        })}
                      />
                    </div>
                  </>
                )}
                {['text', 'textarea', 'email', 'phone', 'url'].includes(fieldType) && (
                  <>
                    <div className="space-y-2">
                      <Label>Min Length</Label>
                      <Input
                        type="number"
                        value={validationRules.minLength ?? ''}
                        onChange={(e) => setValidationRules({
                          ...validationRules,
                          minLength: e.target.value ? parseInt(e.target.value) : undefined,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Length</Label>
                      <Input
                        type="number"
                        value={validationRules.maxLength ?? ''}
                        onChange={(e) => setValidationRules({
                          ...validationRules,
                          maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                        })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Options Editor */}
          {showOptionsEditor && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Options</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Input
                      value={option.label}
                      onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No options added yet. Click "Add Option" to add options.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isRequired"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="isRequired">Required</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !fieldCode || !fieldLabel}>
            {isSaving ? 'Saving...' : field ? 'Update Field' : 'Create Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
