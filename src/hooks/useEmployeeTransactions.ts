import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

export type TransactionType = 
  | "HIRE" 
  | "CONFIRMATION" 
  | "PROBATION_EXT" 
  | "ACTING" 
  | "PROMOTION" 
  | "TRANSFER" 
  | "TERMINATION";

export type TransactionStatus = 
  | "draft" 
  | "pending_approval" 
  | "approved" 
  | "rejected" 
  | "completed" 
  | "cancelled";

type LookupCategory = Database["public"]["Enums"]["lookup_category"];

export interface EmployeeTransaction {
  id: string;
  transaction_number: string;
  transaction_type_id: string;
  employee_id: string | null;
  effective_date: string;
  status: TransactionStatus;
  notes: string | null;
  
  // Hire fields
  hire_type_id: string | null;
  employment_type_id: string | null;
  contract_type_id: string | null;
  position_id: string | null;
  department_id: string | null;
  company_id: string | null;
  probation_end_date: string | null;
  
  // Confirmation fields
  confirmation_date: string | null;
  
  // Probation extension fields
  original_probation_end_date: string | null;
  new_probation_end_date: string | null;
  extension_reason_id: string | null;
  extension_days: number | null;
  
  // Acting fields
  acting_position_id: string | null;
  acting_start_date: string | null;
  acting_end_date: string | null;
  acting_reason_id: string | null;
  acting_allowance: number | null;
  
  // Promotion fields
  from_position_id: string | null;
  to_position_id: string | null;
  promotion_reason_id: string | null;
  salary_adjustment: number | null;
  salary_adjustment_type: string | null;
  
  // Transfer fields
  from_department_id: string | null;
  to_department_id: string | null;
  from_company_id: string | null;
  to_company_id: string | null;
  transfer_reason_id: string | null;
  
  // Termination fields
  termination_reason_id: string | null;
  last_working_date: string | null;
  termination_type: string | null;
  exit_interview_completed: boolean;
  terminate_all_positions: boolean;
  terminated_position_ids: string[] | null;
  
  // Workflow
  workflow_instance_id: string | null;
  requires_workflow: boolean;
  
  // Audit
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  transaction_type?: { code: string; name: string };
  employee?: { full_name: string; email: string };
  position?: { title: string; code: string };
  department?: { name: string };
  company?: { name: string };
}

export interface LookupValue {
  id: string;
  category: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
}

export function useEmployeeTransactions() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (filters?: {
    status?: TransactionStatus;
    transactionType?: string;
    employeeId?: string;
    companyId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("employee_transactions")
        .select(`
          *,
          transaction_type:lookup_values!employee_transactions_transaction_type_id_fkey(code, name),
          employee:profiles!employee_transactions_employee_id_fkey(full_name, email, company_id),
          position:positions!employee_transactions_position_id_fkey(title, code),
          department:departments!employee_transactions_department_id_fkey(name),
          company:companies!employee_transactions_company_id_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.transactionType) {
        query = query.eq("transaction_type_id", filters.transactionType);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      // For company filtering, we need to filter by either transaction.company_id OR employee.company_id
      // This is handled after fetching since Supabase doesn't support OR across tables easily
      if (filters?.fromDate) {
        query = query.gte("effective_date", filters.fromDate);
      }
      if (filters?.toDate) {
        query = query.lte("effective_date", filters.toDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Filter by company - check both transaction.company_id and employee.company_id
      let filteredData = data as unknown as EmployeeTransaction[];
      if (filters?.companyId) {
        filteredData = filteredData.filter(t => 
          t.company_id === filters.companyId || 
          (t.employee as any)?.company_id === filters.companyId
        );
      }
      
      return filteredData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("employee_transactions")
        .select(`
          *,
          transaction_type:lookup_values!employee_transactions_transaction_type_id_fkey(code, name),
          employee:profiles!employee_transactions_employee_id_fkey(full_name, email),
          position:positions!employee_transactions_position_id_fkey(title, code),
          department:departments!employee_transactions_department_id_fkey(name),
          company:companies!employee_transactions_company_id_fkey(name)
        `)
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      return data as EmployeeTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch transaction";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (data: Partial<EmployeeTransaction>) => {
    if (!user) {
      toast.error("You must be logged in");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Normalize position_id for transaction types that use alternate position fields
      const normalizedData = { ...data };
      
      // For ACTING transactions, set position_id to acting_position_id
      if (data.acting_position_id && !data.position_id) {
        normalizedData.position_id = data.acting_position_id;
      }
      
      // For PROMOTION transactions, set position_id to to_position_id
      if (data.to_position_id && !data.position_id) {
        normalizedData.position_id = data.to_position_id;
      }

      // Always populate company_id from employee's profile if not already set
      if (data.employee_id && !normalizedData.company_id) {
        const { data: employeeProfile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", data.employee_id)
          .maybeSingle();
        
        if (employeeProfile?.company_id) {
          normalizedData.company_id = employeeProfile.company_id;
        }
      }

      const { data: newTransaction, error: createError } = await supabase
        .from("employee_transactions")
        .insert({
          ...normalizedData,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (createError) throw createError;

      // For ACTING transactions, also create an employee_positions record
      if (data.acting_position_id && data.employee_id) {
        const employeePositionData = {
          employee_id: data.employee_id,
          position_id: data.acting_position_id,
          start_date: data.acting_start_date || data.effective_date,
          end_date: data.acting_end_date || null,
          is_primary: false,
          assignment_type: "acting",
          compensation_amount: null,
          compensation_currency: "USD",
          compensation_frequency: "monthly",
          benefits_profile: {},
          is_active: true,
        };

        const { error: positionError } = await supabase
          .from("employee_positions")
          .insert(employeePositionData as any);

        if (positionError) {
          console.error("Failed to create employee position for acting assignment:", positionError);
          // Don't fail the transaction, just log the error
        }
      }

      // For PROMOTION transactions, also create an employee_positions record for the new position
      if (data.to_position_id && data.employee_id) {
        // First, deactivate the current primary position assignment
        if (data.from_position_id) {
          await supabase
            .from("employee_positions")
            .update({ 
              is_active: false, 
              end_date: data.effective_date 
            })
            .eq("employee_id", data.employee_id)
            .eq("position_id", data.from_position_id)
            .eq("is_primary", true);
        }

        const employeePositionData = {
          employee_id: data.employee_id,
          position_id: data.to_position_id,
          start_date: data.effective_date,
          end_date: null,
          is_primary: true,
          assignment_type: "permanent",
          compensation_amount: null,
          compensation_currency: "USD",
          compensation_frequency: "monthly",
          benefits_profile: {},
          is_active: true,
        };

        const { error: positionError } = await supabase
          .from("employee_positions")
          .insert(employeePositionData as any);

        if (positionError) {
          console.error("Failed to create employee position for promotion:", positionError);
          // Don't fail the transaction, just log the error
        }
      }

      await logAction({
        action: "CREATE",
        entityType: "employee_transaction",
        entityId: newTransaction.id,
        entityName: newTransaction.transaction_number,
        newValues: newTransaction,
      });

      toast.success("Transaction created successfully");
      return newTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create transaction";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, logAction]);

  const updateTransaction = useCallback(async (id: string, data: Partial<EmployeeTransaction>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get old values for audit
      const { data: oldTransaction } = await supabase
        .from("employee_transactions")
        .select("*")
        .eq("id", id)
        .single();

      // Normalize position_id for transaction types that use alternate position fields
      const normalizedData = { ...data };
      
      // For ACTING transactions, set position_id to acting_position_id
      if (data.acting_position_id && !data.position_id) {
        normalizedData.position_id = data.acting_position_id;
      }
      
      // For PROMOTION transactions, set position_id to to_position_id
      if (data.to_position_id && !data.position_id) {
        normalizedData.position_id = data.to_position_id;
      }

      // Always populate company_id from employee's profile if not already set
      if (data.employee_id && !normalizedData.company_id) {
        const { data: employeeProfile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", data.employee_id)
          .maybeSingle();
        
        if (employeeProfile?.company_id) {
          normalizedData.company_id = employeeProfile.company_id;
        }
      }

      const { data: updatedTransaction, error: updateError } = await supabase
        .from("employee_transactions")
        .update(normalizedData as any)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // For ACTING transactions, also update employee_positions record
      if (data.acting_position_id && data.employee_id) {
        // First, try to find existing acting assignment for this employee and position
        const { data: existingPosition } = await supabase
          .from("employee_positions")
          .select("id")
          .eq("employee_id", data.employee_id)
          .eq("position_id", data.acting_position_id)
          .eq("assignment_type", "acting")
          .single();

        if (existingPosition) {
          // Update existing record
          await supabase
            .from("employee_positions")
            .update({
              start_date: data.acting_start_date || data.effective_date,
              end_date: data.acting_end_date || null,
              is_active: !data.acting_end_date || new Date(data.acting_end_date) >= new Date(),
            })
            .eq("id", existingPosition.id);
        } else {
          // Create new record
          const employeePositionData = {
            employee_id: data.employee_id,
            position_id: data.acting_position_id,
            start_date: data.acting_start_date || data.effective_date,
            end_date: data.acting_end_date || null,
            is_primary: false,
            assignment_type: "acting",
            compensation_amount: null,
            compensation_currency: "USD",
            compensation_frequency: "monthly",
            benefits_profile: {},
            is_active: true,
          };

          await supabase
            .from("employee_positions")
            .insert(employeePositionData as any);
        }
      }

      // For PROMOTION transactions, also update employee_positions record
      if (data.to_position_id && data.employee_id) {
        // First, try to find existing position assignment for the new position
        const { data: existingPosition } = await supabase
          .from("employee_positions")
          .select("id")
          .eq("employee_id", data.employee_id)
          .eq("position_id", data.to_position_id)
          .eq("assignment_type", "permanent")
          .single();

        if (existingPosition) {
          // Update existing record
          await supabase
            .from("employee_positions")
            .update({
              start_date: data.effective_date,
              is_active: true,
            })
            .eq("id", existingPosition.id);
        } else {
          // Deactivate the old position assignment
          if (data.from_position_id) {
            await supabase
              .from("employee_positions")
              .update({ 
                is_active: false, 
                end_date: data.effective_date 
              })
              .eq("employee_id", data.employee_id)
              .eq("position_id", data.from_position_id)
              .eq("is_primary", true);
          }

          // Create new record
          const employeePositionData = {
            employee_id: data.employee_id,
            position_id: data.to_position_id,
            start_date: data.effective_date,
            end_date: null,
            is_primary: true,
            assignment_type: "permanent",
            compensation_amount: null,
            compensation_currency: "USD",
            compensation_frequency: "monthly",
            benefits_profile: {},
            is_active: true,
          };

          await supabase
            .from("employee_positions")
            .insert(employeePositionData as any);
        }
      }

      await logAction({
        action: "UPDATE",
        entityType: "employee_transaction",
        entityId: id,
        entityName: updatedTransaction.transaction_number,
        oldValues: oldTransaction,
        newValues: updatedTransaction,
      });

      toast.success("Transaction updated successfully");
      return updatedTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update transaction";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logAction]);

  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get old values for audit
      const { data: oldTransaction } = await supabase
        .from("employee_transactions")
        .select("*")
        .eq("id", id)
        .single();

      const { error: deleteError } = await supabase
        .from("employee_transactions")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      await logAction({
        action: "DELETE",
        entityType: "employee_transaction",
        entityId: id,
        entityName: oldTransaction?.transaction_number,
        oldValues: oldTransaction,
      });

      toast.success("Transaction deleted successfully");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete transaction";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [logAction]);

  const fetchLookupValues = useCallback(async (category: LookupCategory) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("lookup_values")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("display_order");

      if (fetchError) throw fetchError;
      return data as LookupValue[];
    } catch (err) {
      console.error("Failed to fetch lookup values:", err);
      return [];
    }
  }, []);

  return {
    isLoading,
    error,
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchLookupValues,
  };
}
