import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_METRIC_TEMPLATES, MetricTemplate, TemplateType } from '@/types/goalEnhancements';

const STORAGE_KEY = 'intellihrm_metric_templates';
const TEMPLATE_VERSION = 3; // Increment when adding new templates to force refresh
/**
 * Hook to manage metric templates (stored in localStorage)
 * In a production environment, these would be stored in the database
 */
export function useMetricTemplates(companyId?: string) {
  const [templates, setTemplates] = useState<MetricTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return companyId ? `${STORAGE_KEY}_${companyId}_v${TEMPLATE_VERSION}` : `${STORAGE_KEY}_v${TEMPLATE_VERSION}`;
  }, [companyId]);

  const loadTemplates = useCallback(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored) as MetricTemplate[];
        setTemplates(parsed);
      } else {
        // Initialize with default templates
        const defaults = DEFAULT_METRIC_TEMPLATES.map((t, idx) => ({
          ...t,
          id: `default_${idx}`,
        }));
        setTemplates(defaults);
        localStorage.setItem(getStorageKey(), JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('Error loading metric templates:', error);
      // Fall back to defaults
      const defaults = DEFAULT_METRIC_TEMPLATES.map((t, idx) => ({
        ...t,
        id: `default_${idx}`,
      }));
      setTemplates(defaults);
    } finally {
      setLoading(false);
    }
  }, [getStorageKey]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveTemplates = useCallback((newTemplates: MetricTemplate[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving metric templates:', error);
    }
  }, [getStorageKey]);

  const addTemplate = useCallback((template: Omit<MetricTemplate, 'id'>) => {
    const newTemplate: MetricTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
    };
    const newTemplates = [...templates, newTemplate];
    saveTemplates(newTemplates);
    return newTemplate;
  }, [templates, saveTemplates]);

  const updateTemplate = useCallback((id: string, updates: Partial<MetricTemplate>) => {
    const newTemplates = templates.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    const newTemplates = templates.filter(t => t.id !== id);
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  const duplicateTemplate = useCallback((id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return null;
    
    const newTemplate: MetricTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isGlobal: false,
    };
    const newTemplates = [...templates, newTemplate];
    saveTemplates(newTemplates);
    return newTemplate;
  }, [templates, saveTemplates]);

  const resetToDefaults = useCallback(() => {
    const defaults = DEFAULT_METRIC_TEMPLATES.map((t, idx) => ({
      ...t,
      id: `default_${idx}`,
    }));
    saveTemplates(defaults);
  }, [saveTemplates]);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const getActiveTemplates = useCallback(() => {
    return templates.filter(t => t.isActive);
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.category === category && t.isActive);
  }, [templates]);

  const getTemplatesByType = useCallback((type: TemplateType) => {
    return templates.filter(t => t.templateType === type && t.isActive);
  }, [templates]);

  const validateSubMetricWeights = useCallback((template: MetricTemplate): boolean => {
    if (!template.subMetrics || template.subMetrics.length === 0) return true;
    const totalWeight = template.subMetrics.reduce((sum, m) => sum + m.weight, 0);
    return totalWeight === 100;
  }, []);

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    resetToDefaults,
    getTemplateById,
    getActiveTemplates,
    getTemplatesByCategory,
    getTemplatesByType,
    validateSubMetricWeights,
    refresh: loadTemplates,
  };
}
