import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, GripVertical, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomFieldFormDialog } from './CustomFieldFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { 
  CustomFieldDefinition, 
  CustomFieldFormContext, 
  CustomFieldOption,
  ValidationRules 
} from '@/types/customFields';
import { FORM_CONTEXT_LABELS, FIELD_TYPE_LABELS } from '@/types/customFields';

interface CustomFieldsManagerProps {
  companyId?: string | null;
}

export function CustomFieldsManager({ companyId }: CustomFieldsManagerProps) {
  const [activeContext, setActiveContext] = useState<CustomFieldFormContext>('employee_profile');
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<CustomFieldDefinition | null>(null);
  const { toast } = useToast();

  const fetchFields = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('custom_field_definitions')
        .select(`
          *,
          options:custom_field_options(*)
        `)
        .eq('form_context', activeContext)
        .order('display_order', { ascending: true });

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFields((data || []).map(d => ({
        ...d,
        validation_rules: (d.validation_rules || {}) as ValidationRules,
      })) as CustomFieldDefinition[]);
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom fields',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeContext, companyId, toast]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleAddField = () => {
    setEditingField(null);
    setDialogOpen(true);
  };

  const handleEditField = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setDialogOpen(true);
  };

  const handleDeleteClick = (field: CustomFieldDefinition) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fieldToDelete) return;

    try {
      const { error } = await supabase
        .from('custom_field_definitions')
        .delete()
        .eq('id', fieldToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Custom field deleted successfully',
      });

      fetchFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete custom field',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const handleToggleActive = async (field: CustomFieldDefinition) => {
    try {
      const { error } = await supabase
        .from('custom_field_definitions')
        .update({ is_active: !field.is_active })
        .eq('id', field.id);

      if (error) throw error;

      setFields(fields.map(f => 
        f.id === field.id ? { ...f, is_active: !f.is_active } : f
      ));
    } catch (error) {
      console.error('Error toggling field:', error);
      toast({
        title: 'Error',
        description: 'Failed to update field status',
        variant: 'destructive',
      });
    }
  };

  const handleSaveField = async (
    data: Partial<CustomFieldDefinition>,
    options?: Partial<CustomFieldOption>[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingField) {
        // Update existing field
        const { error } = await supabase
          .from('custom_field_definitions')
          .update({
            field_label: data.field_label,
            field_type: data.field_type,
            is_required: data.is_required,
            is_active: data.is_active,
            section_name: data.section_name,
            placeholder: data.placeholder,
            help_text: data.help_text,
            default_value: data.default_value,
            validation_rules: JSON.parse(JSON.stringify(data.validation_rules || {})),
          })
          .eq('id', editingField.id);

        if (error) throw error;

        // Update options if provided
        if (options) {
          // Delete existing options
          await supabase
            .from('custom_field_options')
            .delete()
            .eq('field_definition_id', editingField.id);

          // Insert new options
          if (options.length > 0) {
            const { error: optError } = await supabase
              .from('custom_field_options')
              .insert(
                options.map(opt => ({
                  option_value: opt.option_value!,
                  option_label: opt.option_label!,
                  display_order: opt.display_order || 0,
                  is_active: opt.is_active ?? true,
                  field_definition_id: editingField.id,
                }))
              );

            if (optError) throw optError;
          }
        }

        toast({
          title: 'Success',
          description: 'Custom field updated successfully',
        });
      } else {
        // Create new field
        const { data: newField, error } = await supabase
          .from('custom_field_definitions')
          .insert([{
            field_code: data.field_code!,
            field_label: data.field_label!,
            field_type: data.field_type,
            form_context: data.form_context,
            is_required: data.is_required,
            is_active: data.is_active,
            section_name: data.section_name,
            placeholder: data.placeholder,
            help_text: data.help_text,
            default_value: data.default_value,
            validation_rules: JSON.parse(JSON.stringify(data.validation_rules || {})),
            company_id: companyId || null,
            display_order: fields.length,
            created_by: user?.id,
          }])
          .select()
          .single();

        if (error) throw error;

        // Insert options if provided
        if (options && options.length > 0) {
          const { error: optError } = await supabase
            .from('custom_field_options')
            .insert(
              options.map(opt => ({
                option_value: opt.option_value!,
                option_label: opt.option_label!,
                display_order: opt.display_order || 0,
                is_active: opt.is_active ?? true,
                field_definition_id: newField.id,
              }))
            );

          if (optError) throw optError;
        }

        toast({
          title: 'Success',
          description: 'Custom field created successfully',
        });
      }

      fetchFields();
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: 'Error',
        description: 'Failed to save custom field',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const formContexts = Object.entries(FORM_CONTEXT_LABELS) as [CustomFieldFormContext, string][];

  return (
    <div className="space-y-6">
      <Tabs value={activeContext} onValueChange={(v) => setActiveContext(v as CustomFieldFormContext)}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {formContexts.map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="text-xs">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeContext} className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>{FORM_CONTEXT_LABELS[activeContext]} Fields</CardTitle>
                <CardDescription>
                  Manage custom fields for the {FORM_CONTEXT_LABELS[activeContext].toLowerCase()} form
                </CardDescription>
              </div>
              <Button onClick={handleAddField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading fields...
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No custom fields defined for this form context.
                  <br />
                  <Button variant="link" onClick={handleAddField}>
                    Add your first field
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell className="font-medium">{field.field_label}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {field.field_code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {FIELD_TYPE_LABELS[field.field_type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {field.section_name || '-'}
                        </TableCell>
                        <TableCell>
                          {field.is_required && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={field.is_active}
                            onCheckedChange={() => handleToggleActive(field)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditField(field)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(field)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomFieldFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={editingField}
        formContext={activeContext}
        onSave={handleSaveField}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the field "{fieldToDelete?.field_label}"?
              This will also delete all stored values for this field. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
