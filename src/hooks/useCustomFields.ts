import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  CustomFieldDefinition, 
  CustomFieldValue, 
  CustomFieldFormContext,
  CustomFieldType,
  ValidationRules 
} from '@/types/customFields';

interface UseCustomFieldsProps {
  formContext: CustomFieldFormContext;
  entityId?: string;
  entityType?: string;
  companyId?: string | null;
}

interface CustomFieldValueMap {
  [fieldId: string]: string | number | boolean | string[] | null;
}

export function useCustomFields({ formContext, entityId, entityType, companyId }: UseCustomFieldsProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [values, setValues] = useState<CustomFieldValueMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFields = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch field definitions
      let query = supabase
        .from('custom_field_definitions')
        .select(`
          *,
          options:custom_field_options(*)
        `)
        .eq('form_context', formContext)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      // Filter by company (include global fields where company_id is null)
      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        query = query.is('company_id', null);
      }

      const { data: fieldDefs, error: fieldsError } = await query;

      if (fieldsError) throw fieldsError;

      // Cast and filter by date effectiveness
      const today = new Date().toISOString().split('T')[0];
      const activeFields = (fieldDefs || []).filter((field) => {
        const startOk = !field.start_date || field.start_date <= today;
        const endOk = !field.end_date || field.end_date >= today;
        return startOk && endOk;
      }).map(field => ({
        ...field,
        validation_rules: (field.validation_rules || {}) as ValidationRules,
      })) as CustomFieldDefinition[];

      // Sort options by display_order
      activeFields.forEach(field => {
        if (field.options) {
          field.options.sort((a, b) => a.display_order - b.display_order);
        }
      });

      setFields(activeFields);

      // Fetch values if entityId is provided
      if (entityId && entityType && activeFields.length > 0) {
        const fieldIds = activeFields.map(f => f.id);
        
        const { data: fieldValues, error: valuesError } = await supabase
          .from('custom_field_values')
          .select('*')
          .eq('entity_id', entityId)
          .eq('entity_type', entityType)
          .in('field_definition_id', fieldIds);

        if (valuesError) throw valuesError;

        // Map values to field IDs
        const valueMap: CustomFieldValueMap = {};
        (fieldValues || []).forEach((val: CustomFieldValue) => {
          const field = activeFields.find(f => f.id === val.field_definition_id);
          if (field) {
            valueMap[val.field_definition_id] = extractValue(val, field.field_type);
          }
        });

        // Set default values for fields without values
        activeFields.forEach(field => {
          if (!(field.id in valueMap) && field.default_value) {
            valueMap[field.id] = parseDefaultValue(field.default_value, field.field_type);
          }
        });

        setValues(valueMap);
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom fields',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [formContext, entityId, entityType, companyId, toast]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const updateValue = useCallback((fieldId: string, value: string | number | boolean | string[] | null) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const saveValues = useCallback(async (targetEntityId: string, targetEntityType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const upserts: {
        field_definition_id: string;
        entity_id: string;
        entity_type: string;
        updated_by: string | null;
        text_value: string | null;
        number_value: number | null;
        date_value: string | null;
        boolean_value: boolean | null;
        json_value: string[] | null;
      }[] = [];
      
      Object.entries(values).forEach(([fieldId, value]) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;

        const record = {
          field_definition_id: fieldId,
          entity_id: targetEntityId,
          entity_type: targetEntityType,
          updated_by: user?.id || null,
          text_value: null as string | null,
          number_value: null as number | null,
          date_value: null as string | null,
          boolean_value: null as boolean | null,
          json_value: null as string[] | null,
        };

        // Set the appropriate value column based on field type
        switch (field.field_type) {
          case 'number':
          case 'currency':
            record.number_value = typeof value === 'number' ? value : null;
            break;
          case 'date':
            record.date_value = typeof value === 'string' ? value : null;
            break;
          case 'boolean':
            record.boolean_value = typeof value === 'boolean' ? value : null;
            break;
          case 'multi_select':
            record.json_value = Array.isArray(value) ? value : null;
            break;
          default:
            record.text_value = typeof value === 'string' ? value : null;
        }

        upserts.push(record);
      });

      if (upserts.length === 0) return;

      const { error } = await supabase
        .from('custom_field_values')
        .upsert(upserts, {
          onConflict: 'field_definition_id,entity_id,entity_type',
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error saving custom field values:', error);
      toast({
        title: 'Error',
        description: 'Failed to save custom field values',
        variant: 'destructive',
      });
      return false;
    }
  }, [values, fields, toast]);

  return {
    fields,
    values,
    updateValue,
    saveValues,
    isLoading,
    refetch: fetchFields,
  };
}

function extractValue(val: CustomFieldValue, fieldType: CustomFieldType): string | number | boolean | string[] | null {
  switch (fieldType) {
    case 'number':
    case 'currency':
      return val.number_value;
    case 'date':
      return val.date_value;
    case 'boolean':
      return val.boolean_value;
    case 'multi_select':
      return Array.isArray(val.json_value) ? val.json_value as string[] : null;
    default:
      return val.text_value;
  }
}

function parseDefaultValue(defaultValue: string, fieldType: CustomFieldType): string | number | boolean | string[] | null {
  switch (fieldType) {
    case 'number':
    case 'currency':
      return parseFloat(defaultValue) || null;
    case 'boolean':
      return defaultValue === 'true';
    case 'multi_select':
      try {
        return JSON.parse(defaultValue);
      } catch {
        return [];
      }
    default:
      return defaultValue;
  }
}
