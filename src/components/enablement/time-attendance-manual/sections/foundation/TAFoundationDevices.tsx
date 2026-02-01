import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Fingerprint, CreditCard, Smartphone, Globe, Wifi,
  GraduationCap, AlertTriangle, CheckCircle, Settings, Server
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  WarningCallout,
  TipCallout,
  SecurityCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationDevices() {
  const learningObjectives = [
    'Configure different timeclock device types',
    'Set up biometric readers and card-based devices',
    'Manage device connectivity and punch queue processing',
    'Troubleshoot common device communication issues',
    'Implement device-level security and access controls'
  ];

  const timeclockDeviceFields: FieldDefinition[] = [
    { name: 'device_name', required: true, type: 'text', description: 'Human-readable device identifier', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'device_code', required: true, type: 'text', description: 'Unique device code for API communication', defaultValue: '—', validation: 'Alphanumeric, no spaces' },
    { name: 'device_type', required: true, type: 'enum', description: 'Type of timeclock device', defaultValue: 'biometric', validation: 'biometric, card_reader, mobile, web, terminal' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company owning this device', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'location_id', required: true, type: 'uuid', description: 'Physical location of device', defaultValue: '—', validation: 'Must reference valid location' },
    { name: 'ip_address', required: false, type: 'text', description: 'Device IP for network communication', defaultValue: '—', validation: 'Valid IPv4/IPv6' },
    { name: 'serial_number', required: false, type: 'text', description: 'Hardware serial number', defaultValue: '—', validation: 'Manufacturer format' },
    { name: 'firmware_version', required: false, type: 'text', description: 'Current firmware version', defaultValue: '—', validation: 'Semantic version' },
    { name: 'last_sync_at', required: false, type: 'timestamp', description: 'Last successful data sync', defaultValue: 'null', validation: 'Auto-updated' },
    { name: 'sync_interval_minutes', required: false, type: 'integer', description: 'How often device syncs punches', defaultValue: '5', validation: '1-60 minutes' },
    { name: 'is_online', required: false, type: 'boolean', description: 'Current connectivity status', defaultValue: 'false', validation: 'Auto-detected' },
    { name: 'offline_mode_enabled', required: false, type: 'boolean', description: 'Store punches locally when offline', defaultValue: 'true', validation: 'true/false' },
    { name: 'max_offline_punches', required: false, type: 'integer', description: 'Max punches to store offline', defaultValue: '1000', validation: 'Device-dependent' },
    { name: 'require_photo', required: false, type: 'boolean', description: 'Capture photo on each punch', defaultValue: 'false', validation: 'Biometric devices only' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether device is in service', defaultValue: 'true', validation: 'true/false' }
  ];

  const punchQueueFields: FieldDefinition[] = [
    { name: 'punch_id', required: true, type: 'uuid', description: 'Unique punch identifier', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'device_id', required: true, type: 'uuid', description: 'Source device reference', defaultValue: '—', validation: 'Must reference valid device' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee who punched', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'punch_timestamp', required: true, type: 'timestamp', description: 'Exact time of punch on device', defaultValue: '—', validation: 'Device local time' },
    { name: 'punch_type', required: true, type: 'enum', description: 'Type of punch', defaultValue: 'clock_in', validation: 'clock_in, clock_out, break_start, break_end' },
    { name: 'verification_method', required: true, type: 'enum', description: 'How employee was verified', defaultValue: 'fingerprint', validation: 'fingerprint, card, pin, face, mobile' },
    { name: 'photo_url', required: false, type: 'text', description: 'Captured photo if required', defaultValue: 'null', validation: 'Storage URL' },
    { name: 'processing_status', required: true, type: 'enum', description: 'Queue processing state', defaultValue: 'pending', validation: 'pending, processed, failed, duplicate' },
    { name: 'processed_at', required: false, type: 'timestamp', description: 'When punch was processed', defaultValue: 'null', validation: 'Auto-set on processing' },
    { name: 'error_message', required: false, type: 'text', description: 'Error if processing failed', defaultValue: 'null', validation: 'System-generated' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Offline Punch Storage',
      enforcement: 'System',
      description: 'When a device loses connectivity, punches are stored locally and synced when connection is restored. FIFO order is maintained.'
    },
    {
      rule: 'Duplicate Punch Prevention',
      enforcement: 'System',
      description: 'Punches from the same employee within 2 minutes are flagged as potential duplicates and require review.'
    },
    {
      rule: 'Device-Location Binding',
      enforcement: 'Policy',
      description: 'Each device is bound to a specific location. Employees can only punch at devices in their assigned locations unless multi-location is enabled.'
    },
    {
      rule: 'Verification Fallback',
      enforcement: 'System',
      description: 'If primary verification fails (e.g., fingerprint not recognized), device can fall back to secondary method if configured.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Register Device in System',
      description: 'Navigate to device management and add a new device with its unique code and type.',
      notes: ['Time & Attendance → Setup → Timeclock Devices → Add Device']
    },
    {
      title: 'Assign to Location',
      description: 'Select the physical location where the device is installed. This affects location-based validation.',
      notes: ['Location must exist in Workforce → Locations first']
    },
    {
      title: 'Configure Connectivity',
      description: 'Enter IP address (for network devices) or enable cloud sync (for mobile/web).',
      notes: ['Network devices need firewall rules for outbound sync']
    },
    {
      title: 'Set Sync Interval',
      description: 'Configure how often the device syncs punches to the server. Lower intervals = more real-time but higher bandwidth.',
      notes: ['Recommended: 5 minutes for most environments']
    },
    {
      title: 'Enable Offline Mode',
      description: 'Turn on offline storage to prevent punch loss during network outages.',
      notes: ['Set max_offline_punches based on device capacity']
    },
    {
      title: 'Test Device Communication',
      description: 'Perform a test punch and verify it appears in the punch queue within the sync interval.',
      notes: ['Check both successful punch and photo capture if enabled']
    }
  ];

  return (
    <Card id="ta-sec-2-3" data-manual-anchor="ta-sec-2-3" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Timeclock Devices Setup</CardTitle>
        <CardDescription>
          Biometric readers, card readers, mobile app, and web clock configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Device Types Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            Supported Device Types
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Fingerprint,
                type: 'Biometric Terminal',
                description: 'Fingerprint or face recognition scanners. Highest security, no buddy punching.',
                pros: ['Highest accuracy', 'No lost cards', 'Fraud prevention'],
                cons: ['Higher cost', 'Requires enrollment', 'Hygiene concerns']
              },
              {
                icon: CreditCard,
                type: 'Card Reader',
                description: 'RFID, proximity, or magnetic stripe card readers. Fast and familiar.',
                pros: ['Fast punch', 'Low cost', 'Easy deployment'],
                cons: ['Cards can be shared', 'Replacement cost', 'Lost cards']
              },
              {
                icon: Smartphone,
                type: 'Mobile App',
                description: 'Employee smartphone app with GPS and optional face verification.',
                pros: ['No hardware', 'GPS location', 'Remote workers'],
                cons: ['Requires phone', 'Battery dependent', 'GPS accuracy']
              },
              {
                icon: Globe,
                type: 'Web Clock',
                description: 'Browser-based clock-in from any computer. Good for office workers.',
                pros: ['No hardware', 'Any browser', 'Low friction'],
                cons: ['IP-based validation', 'Less secure', 'Shared computers']
              },
              {
                icon: Server,
                type: 'Hardware Terminal',
                description: 'Dedicated timeclock with keypad/PIN entry. Traditional approach.',
                pros: ['Reliable', 'No network needed', 'Simple UI'],
                cons: ['Manual entry', 'PIN sharing risk', 'Limited features']
              }
            ].map((device, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="pt-4">
                  <device.icon className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">{device.type}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{device.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                      <span className="text-muted-foreground">{device.pros.join(', ')}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5" />
                      <span className="text-muted-foreground">{device.cons.join(', ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Timeclock Device Management Screen"
          caption="Device list showing connectivity status, last sync, and configuration options"
        />

        {/* Field Reference - Devices */}
        <FieldReferenceTable 
          fields={timeclockDeviceFields}
          title="timeclock_devices Table Fields"
        />

        {/* Field Reference - Punch Queue */}
        <FieldReferenceTable 
          fields={punchQueueFields}
          title="timeclock_punch_queue Table Fields"
        />

        {/* Security Callout */}
        <SecurityCallout>
          <strong>Device Security:</strong> Biometric data (fingerprint templates) should be stored 
          encrypted on-device, not transmitted to the server. Only match/no-match results and 
          employee ID are sent. Comply with biometric data protection laws (GDPR, BIPA, etc.).
        </SecurityCallout>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Device Setup
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Connectivity Status */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Device Connectivity Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Indicator</th>
                  <th className="text-left p-3 font-medium">Meaning</th>
                  <th className="text-left p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { status: 'Online', indicator: '🟢 Green', meaning: 'Device syncing normally', action: 'None required' },
                  { status: 'Syncing', indicator: '🔵 Blue', meaning: 'Currently uploading punches', action: 'Wait for completion' },
                  { status: 'Offline (buffered)', indicator: '🟡 Yellow', meaning: 'Offline but storing punches', action: 'Check network when possible' },
                  { status: 'Offline (full)', indicator: '🟠 Orange', meaning: 'Offline, buffer near capacity', action: 'Restore connection urgently' },
                  { status: 'Error', indicator: '🔴 Red', meaning: 'Device communication failed', action: 'Investigate immediately' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.status}</td>
                    <td className="p-3">{row.indicator}</td>
                    <td className="p-3 text-muted-foreground">{row.meaning}</td>
                    <td className="p-3 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning */}
        <WarningCallout>
          <strong>Punch Queue Processing:</strong> The punch queue processes entries in FIFO order. 
          If a punch fails validation (unknown employee, invalid location), it remains in the queue 
          with status "failed" until manually resolved. Monitor the queue daily for stuck punches.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Multi-Factor Verification:</strong> For high-security environments, configure 
          devices to require two verification methods (e.g., fingerprint + PIN). This prevents 
          both buddy punching and unauthorized access.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
