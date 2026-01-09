import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "@/components/enablement/DocumentTemplateConfig";

export interface SavedDocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  document_type: string;
  is_default_for_type: boolean;
  layout_config: Record<string, unknown>;
  sections_config: Record<string, unknown>;
  formatting_config: Record<string, unknown>;
  branding_config: Record<string, unknown>;
  is_system_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'training_guide' | 'user_manual' | 'sop' | 'quick_start' | 'technical_doc';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  training_guide: 'Training Guide',
  user_manual: 'User Manual',
  sop: 'Standard Operating Procedure',
  quick_start: 'Quick Start Guide',
  technical_doc: 'Technical Documentation'
};

// Convert saved template to DocumentTemplate format
export function savedToDocumentTemplate(saved: SavedDocumentTemplate): DocumentTemplate {
  return {
    id: saved.id,
    name: saved.name,
    description: saved.description || "",
    type: saved.category as DocumentTemplate['type'],
    layout: saved.layout_config as unknown as DocumentTemplate['layout'],
    sections: saved.sections_config as unknown as DocumentTemplate['sections'],
    formatting: saved.formatting_config as unknown as DocumentTemplate['formatting'],
    branding: saved.branding_config as unknown as DocumentTemplate['branding']
  };
}

// Fetch all saved templates
export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['enablement-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enablement_document_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedDocumentTemplate[];
    }
  });
}

// Fetch templates grouped by document type
export function useTemplatesByType() {
  const { data: templates = [], ...rest } = useDocumentTemplates();
  
  const templatesByType = templates.reduce((acc, template) => {
    const type = template.document_type || template.category;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(template);
    return acc;
  }, {} as Record<string, SavedDocumentTemplate[]>);
  
  return { templatesByType, templates, ...rest };
}

// Get the default template for a document type
export function useDefaultTemplate(documentType: DocumentType) {
  const { data: templates = [], isLoading } = useDocumentTemplates();
  
  // Find saved default template for this type
  const savedDefault = templates.find(
    t => (t.document_type === documentType || t.category === documentType) && t.is_default_for_type
  );
  
  // If no saved default, find matching system template
  const systemDefault = DEFAULT_TEMPLATES.find(t => t.type === documentType) || DEFAULT_TEMPLATES[0];
  
  const template = savedDefault ? savedToDocumentTemplate(savedDefault) : systemDefault;
  
  return { template, isLoading, isSaved: !!savedDefault };
}

// Set a template as default for its document type
export function useSetDefaultTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ templateId, documentType }: { templateId: string; documentType: string }) => {
      // First, unset any existing default for this type
      await supabase
        .from('enablement_document_templates')
        .update({ is_default_for_type: false } as any)
        .eq('document_type', documentType);
      
      // Set the new default
      const { error } = await supabase
        .from('enablement_document_templates')
        .update({ 
          is_default_for_type: true,
          document_type: documentType 
        } as any)
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enablement-templates'] });
    }
  });
}

// Update template document type
export function useUpdateTemplateType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ templateId, documentType }: { templateId: string; documentType: string }) => {
      const { error } = await supabase
        .from('enablement_document_templates')
        .update({ document_type: documentType } as any)
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enablement-templates'] });
    }
  });
}
