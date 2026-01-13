import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();
    console.log(`Starting expired notifications cleanup at ${now}`);

    // Track cleanup statistics
    let notificationsArchived = 0;
    let remindersExpired = 0;

    // 1. Archive expired notifications (past expires_at)
    const { data: expiredNotifications, error: notifQueryError } = await supabase
      .from('notifications')
      .select('id')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .eq('is_read', false); // Only unread expired ones need archiving

    if (notifQueryError) {
      console.error('Error querying expired notifications:', notifQueryError);
    } else if (expiredNotifications && expiredNotifications.length > 0) {
      // Mark expired notifications as read (archived)
      const expiredIds = expiredNotifications.map(n => n.id);
      
      const { error: archiveError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: now 
        })
        .in('id', expiredIds);

      if (archiveError) {
        console.error('Error archiving expired notifications:', archiveError);
      } else {
        notificationsArchived = expiredIds.length;
        console.log(`Archived ${notificationsArchived} expired notifications`);
      }
    }

    // 2. Update expired reminders to 'cancelled' status
    const { data: expiredReminders, error: reminderQueryError } = await supabase
      .from('employee_reminders')
      .select('id')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .in('status', ['pending', 'sent']); // Only active reminders

    if (reminderQueryError) {
      console.error('Error querying expired reminders:', reminderQueryError);
    } else if (expiredReminders && expiredReminders.length > 0) {
      const expiredReminderIds = expiredReminders.map(r => r.id);
      
      const { error: updateError } = await supabase
        .from('employee_reminders')
        .update({ 
          status: 'cancelled',
          notes: 'Auto-expired by system cleanup'
        })
        .in('id', expiredReminderIds);

      if (updateError) {
        console.error('Error updating expired reminders:', updateError);
      } else {
        remindersExpired = expiredReminderIds.length;
        console.log(`Expired ${remindersExpired} reminders`);
      }
    }

    // 3. Clean up very old notifications (older than 90 days and read)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { count: oldNotificationsDeleted, error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString())
      .eq('is_read', true);

    if (deleteError) {
      console.error('Error deleting old notifications:', deleteError);
    } else {
      console.log(`Deleted ${oldNotificationsDeleted || 0} old notifications (90+ days)`);
    }

    // 4. Clean up old dismissed reminders (older than 180 days)
    const oneEightyDaysAgo = new Date();
    oneEightyDaysAgo.setDate(oneEightyDaysAgo.getDate() - 180);

    const { count: oldRemindersDeleted, error: reminderDeleteError } = await supabase
      .from('employee_reminders')
      .delete()
      .lt('created_at', oneEightyDaysAgo.toISOString())
      .in('status', ['dismissed', 'cancelled']);

    if (reminderDeleteError) {
      console.error('Error deleting old reminders:', reminderDeleteError);
    } else {
      console.log(`Deleted ${oldRemindersDeleted || 0} old reminders (180+ days)`);
    }

    const summary = {
      timestamp: now,
      notificationsArchived,
      remindersExpired,
      oldNotificationsDeleted: oldNotificationsDeleted || 0,
      oldRemindersDeleted: oldRemindersDeleted || 0,
    };

    console.log('Cleanup complete:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        ...summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in cleanup-expired-notifications:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
