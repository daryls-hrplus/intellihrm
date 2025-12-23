import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ReminderEventType } from '@/types/reminders';

export interface SourcePreviewItem {
  id: string;
  name: string;
  employee_id: string;
  employee_name: string;
  event_date: string | null;
}

export interface SourcePreviewData {
  totalCount: number;
  employeeCount: number;
  upcomingCount: number;
  items: SourcePreviewItem[];
  nextTriggerDate: string | null;
}

// Map source tables to their name fields and employee ID fields
const SOURCE_TABLE_CONFIG: Record<string, { 
  nameField: string; 
  employeeField: string;
  dateField?: string;
}> = {
  // Documents & Certifications
  employee_certificates: { nameField: 'certificate_name', employeeField: 'employee_id' },
  employee_licenses: { nameField: 'license_name', employeeField: 'employee_id' },
  employee_documents: { nameField: 'document_name', employeeField: 'employee_id' },
  employee_work_permits: { nameField: 'permit_type', employeeField: 'employee_id' },
  employee_memberships: { nameField: 'organization_name', employeeField: 'employee_id' },
  employee_csme_certificates: { nameField: 'certificate_type', employeeField: 'employee_id' },
  employee_travel_documents: { nameField: 'document_type', employeeField: 'employee_id' },
  
  // Training & Compliance
  hse_training_records: { nameField: 'training_id', employeeField: 'employee_id' },
  lms_enrollments: { nameField: 'course_id', employeeField: 'employee_id' },
  lms_courses: { nameField: 'title', employeeField: 'created_by' },
  compliance_training_assignments: { nameField: 'compliance_training_id', employeeField: 'employee_id' },
  employee_competencies: { nameField: 'competency_id', employeeField: 'employee_id' },
  
  // Contracts & Agreements
  employee_agreements: { nameField: 'agreement_type', employeeField: 'employee_id' },
  collective_agreements: { nameField: 'name', employeeField: 'company_id' },
  
  // HR Core
  profiles: { nameField: 'full_name', employeeField: 'id' },
  leave_requests: { nameField: 'leave_type_id', employeeField: 'employee_id' },
  
  // Performance
  performance_goals: { nameField: 'title', employeeField: 'employee_id' },
  appraisal_participants: { nameField: 'cycle_id', employeeField: 'employee_id' },
  appraisal_cycles: { nameField: 'name', employeeField: 'created_by' },
  compensation_review_cycles: { nameField: 'name', employeeField: 'created_by' },
  
  // Benefits
  benefit_enrollments: { nameField: 'plan_id', employeeField: 'employee_id' },
  benefit_enrollment_periods: { nameField: 'name', employeeField: 'company_id' },
  
  // Other
  employee_medical_profiles: { nameField: 'blood_type', employeeField: 'employee_id' },
  employee_background_checks: { nameField: 'check_type', employeeField: 'employee_id' },
  union_memberships: { nameField: 'union_id', employeeField: 'employee_id' },
};

export function useReminderSourcePreview() {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<SourcePreviewData | null>(null);

  const fetchPreview = useCallback(async (
    eventType: ReminderEventType,
    companyId: string,
    daysBeforeArray: number[] = [30]
  ): Promise<SourcePreviewData | null> => {
    if (!eventType.source_table || !eventType.date_field) {
      setPreviewData(null);
      return null;
    }

    const config = SOURCE_TABLE_CONFIG[eventType.source_table];
    if (!config) {
      setPreviewData(null);
      return null;
    }

    setLoading(true);
    try {
      // Build the query based on source table
      const sourceTable = eventType.source_table;
      const dateField = eventType.date_field;
      const nameField = config.nameField;
      const employeeField = config.employeeField;

      // Calculate the date range for upcoming items
      const today = new Date();
      const maxDaysBefore = Math.max(...daysBeforeArray);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + maxDaysBefore);

      // Use RPC or direct query based on table
      // For profiles table, we need different handling
      let query;
      let items: SourcePreviewItem[] = [];
      let totalCount = 0;
      let employeeIds = new Set<string>();

      if (sourceTable === 'profiles') {
        // Query profiles directly with company filter - use dynamic query
        const { data, error, count } = await supabase
          .from('profiles')
          .select('id, full_name', { count: 'exact' })
          .eq('company_id', companyId)
          .limit(5) as any;

        if (error) throw error;
        
        totalCount = count || 0;
        items = ((data || []) as any[]).map(row => ({
          id: row.id,
          name: row.full_name || 'Unknown',
          employee_id: row.id,
          employee_name: row.full_name || 'Unknown',
          event_date: null,
        }));
        employeeIds = new Set(items.map(i => i.employee_id));
      } else {
        // For other tables, join with profiles
        // First, get the total count and sample items
        // Build base query
        let baseQuery = supabase
          .from(sourceTable as any)
          .select(`
            id,
            ${nameField},
            ${employeeField},
            ${dateField},
            profiles!${employeeField} (
              id,
              full_name,
              company_id
            )
          `, { count: 'exact' })
          .not(dateField, 'is', null);

        // Apply filter conditions if present (e.g., for CHARACTER_CERTIFICATE_EXPIRY)
        if (eventType.filter_condition) {
          Object.entries(eventType.filter_condition).forEach(([field, value]) => {
            baseQuery = baseQuery.eq(field, value);
          });
        }

        // Apply date range and ordering
        const { data, error, count } = await baseQuery
          .gte(dateField, today.toISOString().split('T')[0])
          .lte(dateField, futureDate.toISOString().split('T')[0])
          .order(dateField, { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error fetching preview:', error);
          // Fallback: try without join
          const { data: fallbackData, count: fallbackCount } = await supabase
            .from(sourceTable as any)
            .select('*', { count: 'exact' })
            .not(dateField, 'is', null)
            .gte(dateField, today.toISOString().split('T')[0])
            .lte(dateField, futureDate.toISOString().split('T')[0])
            .order(dateField, { ascending: true })
            .limit(5);

          totalCount = fallbackCount || 0;
          items = (fallbackData || []).slice(0, 5).map((row: any) => ({
            id: row.id,
            name: row[nameField] || 'Unknown',
            employee_id: row[employeeField],
            employee_name: 'Employee',
            event_date: row[dateField],
          }));
        } else {
          // Filter by company
          const companyFiltered = (data || []).filter((row: any) => {
            const profile = row.profiles;
            return profile && profile.company_id === companyId;
          });

          totalCount = companyFiltered.length;
          employeeIds = new Set(companyFiltered.map((r: any) => r[employeeField]));
          
          items = companyFiltered.slice(0, 5).map((row: any) => ({
            id: row.id,
            name: row[nameField] || 'Unknown',
            employee_id: row[employeeField],
            employee_name: row.profiles?.full_name || 'Unknown Employee',
            event_date: row[dateField],
          }));
        }
      }

      // Find the next trigger date
      const nextTriggerDate = items.length > 0 ? items[0].event_date : null;

      // Count items that would trigger within each interval
      let upcomingCount = 0;
      const minDays = Math.min(...daysBeforeArray);
      const upcomingDate = new Date(today);
      upcomingDate.setDate(upcomingDate.getDate() + minDays);
      
      items.forEach(item => {
        if (item.event_date) {
          const eventDate = new Date(item.event_date);
          if (eventDate <= upcomingDate) {
            upcomingCount++;
          }
        }
      });

      const result: SourcePreviewData = {
        totalCount,
        employeeCount: employeeIds.size,
        upcomingCount,
        items,
        nextTriggerDate,
      };

      setPreviewData(result);
      return result;
    } catch (error) {
      console.error('Error fetching source preview:', error);
      setPreviewData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRuleAffectedCount = useCallback(async (
    eventType: ReminderEventType,
    companyId: string
  ): Promise<{ count: number; employeeCount: number } | null> => {
    if (!eventType.source_table || !eventType.date_field) {
      return null;
    }

    const config = SOURCE_TABLE_CONFIG[eventType.source_table];
    if (!config) return null;

    try {
      const sourceTable = eventType.source_table;
      const dateField = eventType.date_field;
      const employeeField = config.employeeField;

      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 365); // Look ahead 1 year

      if (sourceTable === 'profiles') {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .not(dateField, 'is', null)
          .gte(dateField, today.toISOString().split('T')[0])
          .lte(dateField, futureDate.toISOString().split('T')[0]);

        return { count: count || 0, employeeCount: count || 0 };
      } else {
        // Build base query for affected count
        let countQuery = supabase
          .from(sourceTable as any)
          .select(`${employeeField}, profiles!${employeeField}(company_id)`, { count: 'exact' })
          .not(dateField, 'is', null);

        // Apply filter conditions if present (e.g., for CHARACTER_CERTIFICATE_EXPIRY)
        if (eventType.filter_condition) {
          Object.entries(eventType.filter_condition).forEach(([field, value]) => {
            countQuery = countQuery.eq(field, value);
          });
        }

        const { data, count } = await countQuery
          .gte(dateField, today.toISOString().split('T')[0])
          .lte(dateField, futureDate.toISOString().split('T')[0]);

        const companyFiltered = (data || []).filter((row: any) => 
          row.profiles?.company_id === companyId
        );
        const uniqueEmployees = new Set(companyFiltered.map((r: any) => r[employeeField]));

        return { 
          count: companyFiltered.length, 
          employeeCount: uniqueEmployees.size 
        };
      }
    } catch (error) {
      console.error('Error fetching affected count:', error);
      return null;
    }
  }, []);

  return {
    loading,
    previewData,
    fetchPreview,
    fetchRuleAffectedCount,
    clearPreview: () => setPreviewData(null),
  };
}
