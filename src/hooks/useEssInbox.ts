import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type InboxItemType = 
  | 'leave' 
  | 'rod' 
  | 'expense' 
  | 'change_request' 
  | 'appraisal' 
  | 'document' 
  | 'idp'
  | 'reminder';

export type InboxCategory = 
  | 'time_absence' 
  | 'pay_benefits' 
  | 'performance' 
  | 'tasks_approvals' 
  | 'documents' 
  | 'learning';

export type InboxUrgency = 'response_required' | 'pending' | 'info';

export interface InboxItem {
  id: string;
  type: InboxItemType;
  category: InboxCategory;
  title: string;
  description: string;
  urgency: InboxUrgency;
  actionLabel: string;
  actionPath: string;
  createdAt: string;
  dueDate?: string;
  metadata?: Record<string, unknown>;
}

export interface InboxCounts {
  total: number;
  responseRequired: number;
  pending: number;
  byCategory: Record<InboxCategory, number>;
}

export function useEssInbox() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ess-inbox", user?.id],
    queryFn: async (): Promise<{ items: InboxItem[]; counts: InboxCounts }> => {
      if (!user?.id) return { items: [], counts: { total: 0, responseRequired: 0, pending: 0, byCategory: {} as Record<InboxCategory, number> } };

      const items: InboxItem[] = [];

      // Fetch leave requests (pending) with leave type info
      const { data: leaveRequests } = await supabase
        .from("leave_requests")
        .select("id, leave_type_id, start_date, end_date, status, created_at, leave_types(name)")
        .eq("employee_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (leaveRequests) {
        leaveRequests.forEach((lr) => {
          const leaveType = lr.leave_types as { name: string } | null;
          items.push({
            id: lr.id,
            type: 'leave',
            category: 'time_absence',
            title: 'Leave Request Pending',
            description: `${leaveType?.name || 'Leave'} • ${new Date(lr.start_date).toLocaleDateString()} - ${new Date(lr.end_date).toLocaleDateString()}`,
            urgency: 'pending',
            actionLabel: 'View',
            actionPath: '/ess/leave',
            createdAt: lr.created_at,
          });
        });
      }

      // Fetch Resumption of Duty pending
      const { data: rodRequests } = await supabase
        .from("resumption_of_duty")
        .select("id, leave_request_id, status, created_at, leave_requests(leave_type_id, end_date, leave_types(name))")
        .eq("employee_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (rodRequests) {
        rodRequests.forEach((rod) => {
          const leaveRequest = rod.leave_requests as { leave_type_id: string; end_date: string; leave_types: { name: string } | null } | null;
          items.push({
            id: rod.id,
            type: 'rod',
            category: 'time_absence',
            title: 'Resumption of Duty Required',
            description: `${leaveRequest?.leave_types?.name || 'Leave'} ended ${leaveRequest?.end_date ? new Date(leaveRequest.end_date).toLocaleDateString() : ''}`,
            urgency: 'response_required',
            actionLabel: 'Complete',
            actionPath: '/ess/leave',
            createdAt: rod.created_at,
          });
        });
      }

      // Fetch expense claims (submitted/pending)
      const { data: expenseClaims } = await supabase
        .from("expense_claims")
        .select("id, claim_number, total_amount, currency, status, created_at")
        .eq("employee_id", user.id)
        .in("status", ["submitted", "pending_approval"])
        .order("created_at", { ascending: false });

      if (expenseClaims) {
        expenseClaims.forEach((ec) => {
          items.push({
            id: ec.id,
            type: 'expense',
            category: 'pay_benefits',
            title: 'Expense Claim Submitted',
            description: `${ec.claim_number || 'Claim'} • ${ec.currency || ''} ${ec.total_amount?.toLocaleString() || '0'}`,
            urgency: 'pending',
            actionLabel: 'View',
            actionPath: '/ess/expenses',
            createdAt: ec.created_at,
          });
        });
      }

      // Fetch change requests (pending/info_required)
      const { data: changeRequests } = await supabase
        .from("employee_data_change_requests")
        .select("id, request_type, change_action, status, review_notes, created_at")
        .eq("employee_id", user.id)
        .in("status", ["pending", "info_required"])
        .order("created_at", { ascending: false });

      if (changeRequests) {
        changeRequests.forEach((cr) => {
          const isInfoRequired = cr.status === 'info_required';
          items.push({
            id: cr.id,
            type: 'change_request',
            category: 'tasks_approvals',
            title: isInfoRequired ? 'Change Request - Info Required' : 'Change Request Pending',
            description: `${cr.request_type?.replace(/_/g, ' ') || 'Request'} • ${cr.change_action || 'Update'}`,
            urgency: isInfoRequired ? 'response_required' : 'pending',
            actionLabel: isInfoRequired ? 'Respond' : 'View',
            actionPath: `/ess/my-change-requests/${cr.id}`,
            createdAt: cr.created_at,
            metadata: { reviewNotes: cr.review_notes },
          });
        });
      }

      // Fetch appraisal participants (pending/in_progress or response pending)
      const { data: appraisals } = await supabase
        .from("appraisal_participants")
        .select(`
          id, 
          status, 
          employee_response_status, 
          created_at,
          appraisal_cycles(name, end_date)
        `)
        .eq("employee_id", user.id)
        .or("status.in.(pending,in_progress),employee_response_status.eq.pending")
        .order("created_at", { ascending: false });

      if (appraisals) {
        appraisals.forEach((ap) => {
          const cycle = ap.appraisal_cycles as { name: string; end_date: string } | null;
          const needsResponse = ap.employee_response_status === 'pending';
          
          items.push({
            id: ap.id,
            type: 'appraisal',
            category: 'performance',
            title: needsResponse ? 'Appraisal Response Required' : 'Appraisal In Progress',
            description: cycle?.name || 'Performance Review',
            urgency: needsResponse ? 'response_required' : 'pending',
            actionLabel: needsResponse ? 'Respond' : 'View',
            actionPath: '/ess/my-appraisals',
            createdAt: ap.created_at,
            dueDate: cycle?.end_date,
          });
        });
      }

      // Fetch expiring documents (within 30 days)
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

      const { data: expiringDocs } = await supabase
        .from("employee_documents")
        .select("id, document_name, document_type, expiry_date, created_at")
        .eq("employee_id", user.id)
        .lte("expiry_date", thirtyDaysStr)
        .gte("expiry_date", today)
        .order("expiry_date", { ascending: true });

      if (expiringDocs) {
        expiringDocs.forEach((doc) => {
          const daysUntilExpiry = Math.ceil((new Date(doc.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          items.push({
            id: doc.id,
            type: 'document',
            category: 'documents',
            title: 'Document Expiring Soon',
            description: `${doc.document_name || doc.document_type} • Expires in ${daysUntilExpiry} days`,
            urgency: daysUntilExpiry <= 7 ? 'response_required' : 'info',
            actionLabel: 'View',
            actionPath: '/ess/documents',
            createdAt: doc.created_at || today,
            dueDate: doc.expiry_date || undefined,
          });
        });
      }

      // Fetch active IDP items
      const { data: idpItems } = await supabase
        .from("individual_development_plans")
        .select("id, title, status, target_completion_date, created_at")
        .eq("employee_id", user.id)
        .in("status", ["draft", "active"])
        .order("created_at", { ascending: false });

      if (idpItems) {
        idpItems.forEach((idp) => {
          items.push({
            id: idp.id,
            type: 'idp',
            category: 'learning',
            title: 'Development Plan Active',
            description: idp.title || 'Individual Development Plan',
            urgency: idp.status === 'draft' ? 'pending' : 'info',
            actionLabel: 'View',
            actionPath: '/ess/development',
            createdAt: idp.created_at,
            dueDate: idp.target_completion_date || undefined,
          });
        });
      }

      // Fetch upcoming reminders (next 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

      const { data: reminders } = await supabase
        .from("employee_reminders")
        .select("id, title, message, reminder_date, event_date, priority, status")
        .eq("employee_id", user.id)
        .eq("status", "pending")
        .lte("reminder_date", sevenDaysStr)
        .order("reminder_date", { ascending: true });

      if (reminders) {
        reminders.forEach((rem) => {
          const reminderDate = new Date(rem.reminder_date);
          const isOverdue = reminderDate < new Date() && reminderDate.toDateString() !== new Date().toDateString();
          const isCritical = rem.priority === 'critical' || rem.priority === 'high';
          
          items.push({
            id: rem.id,
            type: 'reminder',
            category: 'tasks_approvals',
            title: isOverdue ? 'Reminder Overdue' : 'Upcoming Reminder',
            description: rem.title,
            urgency: isOverdue || isCritical ? 'response_required' : 'pending',
            actionLabel: 'View',
            actionPath: '/ess/reminders',
            createdAt: rem.reminder_date,
            dueDate: rem.event_date,
          });
        });
      }

      // Sort items: response_required first, then by date
      items.sort((a, b) => {
        const urgencyOrder = { response_required: 0, pending: 1, info: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Calculate counts
      const counts: InboxCounts = {
        total: items.length,
        responseRequired: items.filter(i => i.urgency === 'response_required').length,
        pending: items.filter(i => i.urgency === 'pending').length,
        byCategory: {
          time_absence: items.filter(i => i.category === 'time_absence').length,
          pay_benefits: items.filter(i => i.category === 'pay_benefits').length,
          performance: items.filter(i => i.category === 'performance').length,
          tasks_approvals: items.filter(i => i.category === 'tasks_approvals').length,
          documents: items.filter(i => i.category === 'documents').length,
          learning: items.filter(i => i.category === 'learning').length,
        },
      };

      return { items, counts };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
