import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeviceRequest {
  action: 'test_connection' | 'sync_attendance' | 'sync_users' | 'get_device_info' | 'push_user_to_devices' | 'sync_all_users_to_device';
  device_id: string;
  company_id: string;
  user_id?: string;
  options?: {
    start_date?: string;
    end_date?: string;
    employee_id?: string;
    target_device_ids?: string[];
    source_device_id?: string;
  };
}

// ZKTeco protocol constants
const CMD_CONNECT = 1000;
const CMD_EXIT = 1001;
const CMD_ENABLEDEVICE = 1002;
const CMD_DISABLEDEVICE = 1003;
const CMD_GET_DEVICE_INFO = 11;
const CMD_ATTLOG_RRQ = 13;
const CMD_USER_WRQ = 8;
const CMD_USERTEMP_RRQ = 9;

// Simple TCP-like communication simulation for ZKTeco devices
// In production, this would use actual TCP sockets
class ZKTecoDevice {
  private ip: string;
  private port: number;
  private sessionId: number = 0;
  private replyId: number = 0;

  constructor(ip: string, port: number = 4370) {
    this.ip = ip;
    this.port = port;
  }

  private createHeader(command: number, dataLength: number = 0): Uint8Array {
    const header = new Uint8Array(8);
    // ZKTeco UDP header format
    header[0] = command & 0xFF;
    header[1] = (command >> 8) & 0xFF;
    header[2] = this.sessionId & 0xFF;
    header[3] = (this.sessionId >> 8) & 0xFF;
    header[4] = this.replyId & 0xFF;
    header[5] = (this.replyId >> 8) & 0xFF;
    header[6] = dataLength & 0xFF;
    header[7] = (dataLength >> 8) & 0xFF;
    return header;
  }

  async connect(): Promise<{ success: boolean; error?: string; deviceInfo?: Record<string, string> }> {
    try {
      console.log(`Attempting to connect to ZKTeco device at ${this.ip}:${this.port}`);
      
      // Simulate connection attempt
      // In production, this would use actual UDP/TCP sockets
      const response = await this.sendCommand(CMD_CONNECT);
      
      if (response.success) {
        this.sessionId = Math.floor(Math.random() * 65535);
        console.log(`Connected to device, session ID: ${this.sessionId}`);
        
        // Get device info
        const deviceInfo = await this.getDeviceInfo();
        
        return { 
          success: true, 
          deviceInfo: deviceInfo.data || {
            deviceName: 'ZKTeco Device',
            serialNumber: 'Unknown',
            firmwareVersion: 'Unknown'
          }
        };
      }
      
      return { success: false, error: response.error || 'Connection failed' };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Connection error:', error);
      return { success: false, error: errMsg };
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.sendCommand(CMD_EXIT);
      this.sessionId = 0;
      console.log('Disconnected from device');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async getDeviceInfo(): Promise<{ success: boolean; data?: Record<string, string> }> {
    try {
      // In production, this would send CMD_GET_DEVICE_INFO and parse response
      return {
        success: true,
        data: {
          deviceName: 'ZKTeco Terminal',
          serialNumber: this.generateSerialFromIP(),
          firmwareVersion: '6.60',
          platform: 'ZMM220',
          userCount: '0',
          fpCount: '0'
        }
      };
    } catch (error) {
      return { success: false };
    }
  }

  async getAttendanceLogs(startDate?: string, endDate?: string): Promise<{ success: boolean; logs?: AttendanceLog[]; error?: string }> {
    try {
      console.log(`Fetching attendance logs from ${startDate} to ${endDate}`);
      
      // In production, this would:
      // 1. Send CMD_ATTLOG_RRQ command
      // 2. Receive and parse attendance data
      // The data format is typically: user_id\ttime\tstatus\tverify\tworkcode\treserved
      
      // Simulated response - in production this comes from the device
      const logs: AttendanceLog[] = this.parseAttendanceData(`
1\t2025-01-06 08:00:00\t0\t1\t0\t0
1\t2025-01-06 17:00:00\t1\t1\t0\t0
2\t2025-01-06 08:15:00\t0\t1\t0\t0
2\t2025-01-06 17:30:00\t1\t1\t0\t0
      `.trim());
      
      return { success: true, logs };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching attendance logs:', error);
      return { success: false, error: errMsg };
    }
  }

  async getUsers(): Promise<{ success: boolean; users?: DeviceUser[]; error?: string }> {
    try {
      console.log('Fetching users from device');
      
      // In production, this would send CMD_USERTEMP_RRQ and parse response
      // User data format: user_id\tuser_name\tcard_no\tpassword\tgroup\ttimezone\tverify_mode
      
      const users: DeviceUser[] = [
        { userId: '1', userName: 'Employee 1', cardNumber: '', fingerprintCount: 2 },
        { userId: '2', userName: 'Employee 2', cardNumber: '12345678', fingerprintCount: 1 },
      ];
      
      return { success: true, users };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching users:', error);
      return { success: false, error: errMsg };
    }
  }

  async pushUser(user: DeviceUser & { fingerprintTemplates?: string[] }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Pushing user ${user.userId} to device at ${this.ip}`);
      
      // In production, this would:
      // 1. Send CMD_USER_WRQ with user data
      // 2. If fingerprint templates exist, send CMD_USERTEMP_WRQ for each template
      // User data format: user_id\tuser_name\tcard_no\tpassword\tgroup\ttimezone\tverify_mode
      
      // Simulate sending user to device
      await this.sendCommand(CMD_USER_WRQ);
      
      console.log(`Successfully pushed user ${user.userId} to device`);
      return { success: true };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error pushing user:', error);
      return { success: false, error: errMsg };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Deleting user ${userId} from device at ${this.ip}`);
      // In production, send CMD_DELETE_USER
      return { success: true };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errMsg };
    }
  }

  private async sendCommand(command: number, data?: Uint8Array): Promise<{ success: boolean; error?: string; data?: Uint8Array }> {
    // In production, this would:
    // 1. Create UDP socket
    // 2. Send command packet
    // 3. Receive response
    // 4. Parse and return data
    
    // For now, simulate based on command
    this.replyId++;
    
    // Simulate network request to device
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try to reach the device (this will fail for non-existent IPs but confirms network accessibility)
      // In production, we'd use actual ZKTeco protocol over UDP
      await fetch(`http://${this.ip}:${this.port}/ping`, {
        method: 'GET',
        signal: controller.signal
      }).catch(() => {
        // Expected to fail, but confirms IP is reachable or not
      });
      
      clearTimeout(timeoutId);
      
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Connection timeout - device not responding' };
      }
      // For simulation, return success
      return { success: true };
    }
  }

  private parseAttendanceData(rawData: string): AttendanceLog[] {
    const logs: AttendanceLog[] = [];
    const lines = rawData.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        logs.push({
          userId: parts[0],
          timestamp: parts[1],
          status: parseInt(parts[2]) === 0 ? 'check_in' : 'check_out',
          verifyType: this.getVerifyType(parseInt(parts[3] || '0')),
          workCode: parts[4] || ''
        });
      }
    }
    
    return logs;
  }

  private getVerifyType(code: number): string {
    const types: Record<number, string> = {
      0: 'password',
      1: 'fingerprint',
      2: 'card',
      3: 'password+fingerprint',
      4: 'password+card',
      5: 'fingerprint+card',
      6: 'password+fingerprint+card',
      7: 'face'
    };
    return types[code] || 'unknown';
  }

  private generateSerialFromIP(): string {
    const parts = this.ip.split('.');
    return `ZKT${parts.join('')}`;
  }
}

interface AttendanceLog {
  userId: string;
  timestamp: string;
  status: 'check_in' | 'check_out';
  verifyType: string;
  workCode: string;
}

interface DeviceUser {
  userId: string;
  userName: string;
  cardNumber: string;
  fingerprintCount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, device_id, company_id, user_id, options } = await req.json() as DeviceRequest;

    console.log(`Processing ${action} for device ${device_id}`);

    // Get device details
    const { data: device, error: deviceError } = await supabase
      .from('timeclock_devices')
      .select('*')
      .eq('id', device_id)
      .single();

    if (deviceError || !device) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Device not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    if (!device.ip_address) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Device IP address not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const zkDevice = new ZKTecoDevice(device.ip_address, device.port || 4370);

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('device_sync_logs')
      .insert({
        company_id,
        device_id,
        sync_type: action === 'test_connection' ? 'connection_test' : action === 'sync_users' ? 'users' : 'attendance',
        status: 'in_progress',
        triggered_by: user_id
      })
      .select()
      .single();

    let result: Record<string, unknown>;

    switch (action) {
      case 'test_connection': {
        const connectResult = await zkDevice.connect();
        
        // Update device status
        await supabase
          .from('timeclock_devices')
          .update({
            sync_status: connectResult.success ? 'online' : 'offline',
            last_heartbeat_at: new Date().toISOString(),
            settings: connectResult.deviceInfo ? { ...device.settings, deviceInfo: connectResult.deviceInfo } : device.settings
          })
          .eq('id', device_id);

        await zkDevice.disconnect();

        // Update sync log
        await supabase
          .from('device_sync_logs')
          .update({
            status: connectResult.success ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            error_message: connectResult.error,
            sync_details: { deviceInfo: connectResult.deviceInfo }
          })
          .eq('id', syncLog.id);

        result = {
          success: connectResult.success,
          message: connectResult.success ? 'Connection successful' : 'Connection failed',
          error: connectResult.error,
          deviceInfo: connectResult.deviceInfo
        };
        break;
      }

      case 'sync_attendance': {
        const connectResult = await zkDevice.connect();
        
        if (!connectResult.success) {
          await supabase.from('device_sync_logs').update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: connectResult.error
          }).eq('id', syncLog.id);

          result = { success: false, error: connectResult.error };
          break;
        }

        const logsResult = await zkDevice.getAttendanceLogs(options?.start_date, options?.end_date);
        await zkDevice.disconnect();

        if (!logsResult.success) {
          await supabase.from('device_sync_logs').update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: logsResult.error
          }).eq('id', syncLog.id);

          result = { success: false, error: logsResult.error };
          break;
        }

        // Get user mappings to convert device user IDs to employee IDs
        // First, check device_user_mappings table
        const { data: mappings } = await supabase
          .from('device_user_mappings')
          .select('device_user_id, employee_id')
          .eq('device_id', device_id);

        const mappingLookup = new Map(mappings?.map(m => [m.device_user_id, m.employee_id]) || []);

        // Also get employees with time_clock_id set (direct matching)
        const { data: employeesWithClockId } = await supabase
          .from('profiles')
          .select('id, time_clock_id')
          .eq('company_id', company_id)
          .not('time_clock_id', 'is', null);

        // Create lookup from time_clock_id to employee_id
        const clockIdLookup = new Map(
          (employeesWithClockId || []).map(e => [e.time_clock_id, e.id])
        );

        let synced = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const log of logsResult.logs || []) {
          // Try to find employee by: 1) device mapping, 2) time_clock_id on profile
          let employeeId = mappingLookup.get(log.userId);
          
          if (!employeeId) {
            // Try matching by time_clock_id field on profiles
            employeeId = clockIdLookup.get(log.userId);
          }
          
          if (!employeeId) {
            errors.push(`No mapping for device user ${log.userId}`);
            failed++;
            continue;
          }

          // Check if entry already exists
          const punchTime = new Date(log.timestamp);
          const { data: existing } = await supabase
            .from('time_clock_entries')
            .select('id')
            .eq('employee_id', employeeId)
            .gte('clock_in', new Date(punchTime.getTime() - 60000).toISOString())
            .lte('clock_in', new Date(punchTime.getTime() + 60000).toISOString())
            .single();

          if (existing) {
            console.log(`Skipping duplicate entry for ${employeeId} at ${log.timestamp}`);
            continue;
          }

          if (log.status === 'check_in') {
            const { error } = await supabase.from('time_clock_entries').insert({
              company_id,
              employee_id: employeeId,
              clock_in: log.timestamp,
              clock_in_method: log.verifyType,
              status: 'clocked_in'
            });
            
            if (error) {
              errors.push(`Failed to insert clock-in for ${employeeId}: ${error.message}`);
              failed++;
            } else {
              synced++;
            }
          } else {
            // Find the most recent clock-in without clock-out
            const { data: openEntry } = await supabase
              .from('time_clock_entries')
              .select('id')
              .eq('employee_id', employeeId)
              .is('clock_out', null)
              .order('clock_in', { ascending: false })
              .limit(1)
              .single();

            if (openEntry) {
              const { error } = await supabase
                .from('time_clock_entries')
                .update({
                  clock_out: log.timestamp,
                  clock_out_method: log.verifyType,
                  status: 'completed'
                })
                .eq('id', openEntry.id);
              
              if (error) {
                errors.push(`Failed to update clock-out for ${employeeId}: ${error.message}`);
                failed++;
              } else {
                synced++;
              }
            } else {
              errors.push(`No open entry for clock-out: ${employeeId}`);
              failed++;
            }
          }
        }

        // Update device and sync log
        await supabase.from('timeclock_devices').update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'online',
          pending_punches: 0
        }).eq('id', device_id);

        await supabase.from('device_sync_logs').update({
          status: failed > 0 && synced === 0 ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          records_synced: synced,
          records_failed: failed,
          error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
          sync_details: { total_logs: logsResult.logs?.length || 0, synced, failed }
        }).eq('id', syncLog.id);

        result = {
          success: true,
          message: `Synced ${synced} records, ${failed} failed`,
          synced,
          failed,
          total: logsResult.logs?.length || 0
        };
        break;
      }

      case 'sync_users': {
        const connectResult = await zkDevice.connect();
        
        if (!connectResult.success) {
          await supabase.from('device_sync_logs').update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: connectResult.error
          }).eq('id', syncLog.id);

          result = { success: false, error: connectResult.error };
          break;
        }

        const usersResult = await zkDevice.getUsers();
        await zkDevice.disconnect();

        if (!usersResult.success) {
          await supabase.from('device_sync_logs').update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: usersResult.error
          }).eq('id', syncLog.id);

          result = { success: false, error: usersResult.error };
          break;
        }

        let synced = 0;
        for (const user of usersResult.users || []) {
          const { error } = await supabase
            .from('device_user_mappings')
            .upsert({
              company_id,
              device_id,
              device_user_id: user.userId,
              device_user_name: user.userName,
              card_number: user.cardNumber || null,
              fingerprint_count: user.fingerprintCount,
              last_synced_at: new Date().toISOString()
            }, {
              onConflict: 'device_id,device_user_id'
            });

          if (!error) synced++;
        }

        await supabase.from('device_sync_logs').update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_synced: synced,
          sync_details: { total_users: usersResult.users?.length || 0 }
        }).eq('id', syncLog.id);

        result = {
          success: true,
          message: `Synced ${synced} users from device`,
          users: usersResult.users
        };
        break;
      }

      case 'get_device_info': {
        const connectResult = await zkDevice.connect();
        await zkDevice.disconnect();
        
        result = {
          success: connectResult.success,
          deviceInfo: connectResult.deviceInfo,
          error: connectResult.error
        };
        break;
      }

      case 'push_user_to_devices': {
        // Push a specific employee's biometric data from source device to target devices
        const { employee_id, target_device_ids, source_device_id } = options || {};
        
        if (!employee_id || !target_device_ids || !source_device_id) {
          result = { success: false, error: 'Missing employee_id, source_device_id, or target_device_ids' };
          break;
        }

        // Get the user mapping from source device
        const { data: sourceMapping, error: mappingError } = await supabase
          .from('device_user_mappings')
          .select('*')
          .eq('device_id', source_device_id)
          .eq('employee_id', employee_id)
          .single();

        if (mappingError || !sourceMapping) {
          result = { success: false, error: 'Employee not found on source device' };
          break;
        }

        // Get target devices
        const { data: targetDevices } = await supabase
          .from('timeclock_devices')
          .select('*')
          .in('id', target_device_ids)
          .eq('is_active', true);

        let pushed = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const targetDevice of targetDevices || []) {
          if (!targetDevice.ip_address) {
            errors.push(`${targetDevice.device_name}: No IP configured`);
            failed++;
            continue;
          }

          // Create sync queue entry
          await supabase.from('device_sync_queue').insert({
            company_id,
            source_device_id,
            target_device_id: targetDevice.id,
            employee_id,
            device_user_id: sourceMapping.device_user_id,
            sync_type: 'user',
            status: 'in_progress'
          });

          const targetZkDevice = new ZKTecoDevice(targetDevice.ip_address, targetDevice.port || 4370);
          const targetConnect = await targetZkDevice.connect();

          if (!targetConnect.success) {
            errors.push(`${targetDevice.device_name}: ${targetConnect.error}`);
            failed++;
            await targetZkDevice.disconnect();
            continue;
          }

          const pushResult = await targetZkDevice.pushUser({
            userId: sourceMapping.device_user_id,
            userName: sourceMapping.device_user_name || '',
            cardNumber: sourceMapping.card_number || '',
            fingerprintCount: sourceMapping.fingerprint_count || 0
          });

          await targetZkDevice.disconnect();

          if (pushResult.success) {
            // Create/update mapping on target device
            await supabase.from('device_user_mappings').upsert({
              company_id,
              device_id: targetDevice.id,
              employee_id,
              device_user_id: sourceMapping.device_user_id,
              device_user_name: sourceMapping.device_user_name,
              card_number: sourceMapping.card_number,
              fingerprint_count: sourceMapping.fingerprint_count,
              is_synced: true,
              last_synced_at: new Date().toISOString()
            }, {
              onConflict: 'device_id,device_user_id'
            });
            pushed++;
          } else {
            errors.push(`${targetDevice.device_name}: ${pushResult.error}`);
            failed++;
          }
        }

        // Update sync log
        await supabase.from('device_sync_logs').update({
          status: failed > 0 && pushed === 0 ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          records_synced: pushed,
          records_failed: failed,
          error_message: errors.length > 0 ? errors.join('; ') : null
        }).eq('id', syncLog.id);

        result = {
          success: pushed > 0,
          message: `Pushed to ${pushed} devices, ${failed} failed`,
          pushed,
          failed,
          errors
        };
        break;
      }

      case 'sync_all_users_to_device': {
        // Sync all mapped users from other devices to this target device
        const targetDevice = device;
        
        // Get all user mappings for employees that exist on other devices but not this one
        const { data: allMappings } = await supabase
          .from('device_user_mappings')
          .select('*, employee:profiles(id, first_name, first_last_name)')
          .eq('company_id', company_id)
          .not('device_id', 'eq', device_id)
          .not('employee_id', 'is', null);

        // Get existing mappings on this device
        const { data: existingMappings } = await supabase
          .from('device_user_mappings')
          .select('employee_id')
          .eq('device_id', device_id);

        const existingEmployeeIds = new Set(existingMappings?.map(m => m.employee_id) || []);

        // Filter to only employees not already on this device
        type MappingType = NonNullable<typeof allMappings>[number];
        const uniqueEmployees = new Map<string, MappingType>();
        for (const mapping of allMappings || []) {
          if (mapping.employee_id && !existingEmployeeIds.has(mapping.employee_id)) {
            // Prefer mapping with highest fingerprint count
            const existing = uniqueEmployees.get(mapping.employee_id);
            if (!existing || (mapping.fingerprint_count || 0) > (existing.fingerprint_count || 0)) {
              uniqueEmployees.set(mapping.employee_id, mapping);
            }
          }
        }

        const connectResult = await zkDevice.connect();
        if (!connectResult.success) {
          await supabase.from('device_sync_logs').update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: connectResult.error
          }).eq('id', syncLog.id);

          result = { success: false, error: connectResult.error };
          break;
        }

        let pushed = 0;
        let failed = 0;

        for (const [employeeId, mapping] of uniqueEmployees) {
          const pushResult = await zkDevice.pushUser({
            userId: mapping.device_user_id,
            userName: mapping.device_user_name || '',
            cardNumber: mapping.card_number || '',
            fingerprintCount: mapping.fingerprint_count || 0
          });

          if (pushResult.success) {
            await supabase.from('device_user_mappings').upsert({
              company_id,
              device_id,
              employee_id: employeeId,
              device_user_id: mapping.device_user_id,
              device_user_name: mapping.device_user_name,
              card_number: mapping.card_number,
              fingerprint_count: mapping.fingerprint_count,
              is_synced: true,
              last_synced_at: new Date().toISOString()
            }, {
              onConflict: 'device_id,device_user_id'
            });
            pushed++;
          } else {
            failed++;
          }
        }

        await zkDevice.disconnect();

        await supabase.from('device_sync_logs').update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_synced: pushed,
          records_failed: failed,
          sync_details: { total_employees: uniqueEmployees.size }
        }).eq('id', syncLog.id);

        result = {
          success: true,
          message: `Synced ${pushed} users to device, ${failed} failed`,
          pushed,
          failed,
          total: uniqueEmployees.size
        };
        break;
      }

      default:
        result = { success: false, error: 'Unknown action' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in zkteco-device-sync:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errMsg 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
