import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, MapPin, Target, Shield, GraduationCap,
  Smartphone
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  WarningCallout,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationGeofencing() {
  const learningObjectives = [
    'Configure geofence boundaries for work locations',
    'Set appropriate radius sizes for different site types',
    'Handle remote work zones and traveling employees',
    'Review geofence validation logs and exceptions',
    'Troubleshoot GPS accuracy issues'
  ];

  const geofenceLocationFields: FieldDefinition[] = [
    { name: 'geofence_name', required: true, type: 'text', description: 'Descriptive name for the geofence', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'location_id', required: true, type: 'uuid', description: 'Linked work location', defaultValue: '—', validation: 'Must reference valid location' },
    { name: 'latitude', required: true, type: 'decimal', description: 'Center point latitude', defaultValue: '—', validation: '-90 to 90' },
    { name: 'longitude', required: true, type: 'decimal', description: 'Center point longitude', defaultValue: '—', validation: '-180 to 180' },
    { name: 'radius_meters', required: true, type: 'integer', description: 'Geofence radius from center', defaultValue: '100', validation: '10-10000 meters' },
    { name: 'geofence_type', required: false, type: 'enum', description: 'Type of geofence zone', defaultValue: 'work_site', validation: 'work_site, client_site, remote_zone, travel' },
    { name: 'altitude_min', required: false, type: 'integer', description: 'Minimum altitude (multi-story)', defaultValue: 'null', validation: 'Meters above sea level' },
    { name: 'altitude_max', required: false, type: 'integer', description: 'Maximum altitude (multi-story)', defaultValue: 'null', validation: 'Meters above sea level' },
    { name: 'enforce_on_clock_in', required: false, type: 'boolean', description: 'Validate location on clock-in', defaultValue: 'true', validation: 'true/false' },
    { name: 'enforce_on_clock_out', required: false, type: 'boolean', description: 'Validate location on clock-out', defaultValue: 'false', validation: 'true/false' },
    { name: 'allow_override', required: false, type: 'boolean', description: 'Allow punch with manual override', defaultValue: 'true', validation: 'true/false' },
    { name: 'override_requires_note', required: false, type: 'boolean', description: 'Require justification for override', defaultValue: 'true', validation: 'true/false' },
    { name: 'active_days', required: false, type: 'jsonb', description: 'Days of week geofence is active', defaultValue: '[1,2,3,4,5]', validation: '0=Sun, 6=Sat' },
    { name: 'active_start_time', required: false, type: 'time', description: 'Daily start of enforcement', defaultValue: '00:00', validation: 'HH:MM format' },
    { name: 'active_end_time', required: false, type: 'time', description: 'Daily end of enforcement', defaultValue: '23:59', validation: 'HH:MM format' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether geofence is enforced', defaultValue: 'true', validation: 'true/false' }
  ];

  const geofenceValidationFields: FieldDefinition[] = [
    { name: 'validation_id', required: true, type: 'uuid', description: 'Unique validation record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'time_clock_entry_id', required: true, type: 'uuid', description: 'Linked clock entry', defaultValue: '—', validation: 'Must reference valid entry' },
    { name: 'geofence_id', required: true, type: 'uuid', description: 'Geofence being validated against', defaultValue: '—', validation: 'Must reference valid geofence' },
    { name: 'captured_latitude', required: true, type: 'decimal', description: 'Employee GPS latitude', defaultValue: '—', validation: '-90 to 90' },
    { name: 'captured_longitude', required: true, type: 'decimal', description: 'Employee GPS longitude', defaultValue: '—', validation: '-180 to 180' },
    { name: 'distance_from_center', required: true, type: 'integer', description: 'Distance from geofence center', defaultValue: '—', validation: 'Meters' },
    { name: 'gps_accuracy_meters', required: false, type: 'integer', description: 'GPS accuracy reported by device', defaultValue: '—', validation: 'Lower is better' },
    { name: 'validation_result', required: true, type: 'enum', description: 'Pass/fail result', defaultValue: '—', validation: 'passed, failed, overridden, skipped' },
    { name: 'override_reason', required: false, type: 'text', description: 'Justification if overridden', defaultValue: 'null', validation: 'Required if overridden' },
    { name: 'validated_at', required: true, type: 'timestamp', description: 'When validation occurred', defaultValue: 'now()', validation: 'Auto-set' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'GPS Accuracy Threshold',
      enforcement: 'Advisory',
      description: 'If device-reported GPS accuracy exceeds 50 meters, validation is flagged as "low accuracy" and may require manager review.'
    },
    {
      rule: 'Override Audit Trail',
      enforcement: 'System',
      description: 'All geofence overrides are logged with employee justification and manager notification for compliance audit.'
    },
    {
      rule: 'Multi-Location Employees',
      enforcement: 'System',
      description: 'Employees assigned to multiple locations can clock in at any of their assigned geofences without override.'
    },
    {
      rule: 'Remote Work Exception',
      enforcement: 'Policy',
      description: 'Employees with remote work flag can bypass geofencing or use designated remote work zones.'
    },
    {
      rule: 'Time-Based Enforcement',
      enforcement: 'System',
      description: 'Geofences can be configured to only enforce during specific hours (e.g., business hours only).'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Geofence Configuration',
      description: 'Access geofence settings from the Time & Attendance setup menu.',
      notes: ['Time & Attendance → Setup → Geofence Locations']
    },
    {
      title: 'Add New Geofence',
      description: 'Click "Add Geofence" and select the work location to link.',
      notes: ['Location must exist in Workforce → Locations with address']
    },
    {
      title: 'Set Center Coordinates',
      description: 'Use the map interface to position the geofence center, or enter exact lat/long.',
      notes: ['Click on map or paste from Google Maps']
    },
    {
      title: 'Configure Radius',
      description: 'Set the radius based on site size. Consider GPS accuracy in the area.',
      notes: ['Office: 50-100m', 'Campus: 200-500m', 'Field site: 500-1000m']
    },
    {
      title: 'Set Enforcement Options',
      description: 'Choose whether to enforce on clock-in, clock-out, or both. Enable override if needed.',
      notes: ['Most organizations enforce on clock-in only']
    },
    {
      title: 'Test with Sample Punch',
      description: 'Have an employee test clock-in from inside and outside the geofence to verify.',
      notes: ['Check geofence_validations table for test results']
    }
  ];

  return (
    <Card id="ta-sec-2-4" data-manual-anchor="ta-sec-2-4" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.4</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Geofencing Configuration</CardTitle>
        <CardDescription>
          GPS-based clock-in validation, location boundaries, and remote work zones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Is Geofencing?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Geofencing uses GPS coordinates to verify that employees are at their designated 
                work location when clocking in. A geofence defines a circular boundary around a 
                location's center point. When an employee attempts to clock in via mobile app, 
                their GPS position is compared against the geofence boundary. If they're within 
                the radius, the punch is validated. If outside, they can either be blocked or 
                allowed to override with a justification note.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Geofence Map Configuration"
          caption="Interactive map showing geofence boundary with radius adjustment controls"
        />

        {/* Radius Guidelines */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Recommended Radius by Site Type
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { type: 'Small Office', radius: '50-100m', description: 'Single building, urban area with good GPS', icon: '🏢' },
              { type: 'Office Campus', radius: '200-500m', description: 'Multiple buildings, parking lots included', icon: '🏛️' },
              { type: 'Industrial Site', radius: '500-1000m', description: 'Warehouse, factory, large outdoor areas', icon: '🏭' },
              { type: 'Construction Site', radius: '1000-2000m', description: 'Temporary locations with variable boundaries', icon: '🚧' },
              { type: 'Field Work Area', radius: '2000-5000m', description: 'Agricultural, mining, or large outdoor zones', icon: '🌾' },
              { type: 'Client Site', radius: '100-300m', description: 'External locations employees visit', icon: '🏪' }
            ].map((site, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl mb-2">{site.icon}</div>
                <h4 className="font-medium mb-1">{site.type}</h4>
                <div className="text-lg font-bold text-primary mb-1">{site.radius}</div>
                <p className="text-xs text-muted-foreground">{site.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Field Reference Tables */}
        <FieldReferenceTable 
          fields={geofenceLocationFields}
          title="geofence_locations Table Fields"
        />

        <FieldReferenceTable 
          fields={geofenceValidationFields}
          title="geofence_validations Table Fields"
        />

        {/* GPS Accuracy Info */}
        <InfoCallout>
          <strong>GPS Accuracy Matters:</strong> Mobile GPS accuracy varies from 3-15 meters in 
          ideal conditions to 50+ meters in urban canyons or indoors. Set your radius larger 
          than the minimum expected accuracy to avoid false failures. The system logs reported 
          GPS accuracy with each validation.
        </InfoCallout>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Configuration
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Validation Results */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Validation Result Types
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Result</th>
                  <th className="text-left p-3 font-medium">Condition</th>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { result: 'Passed', condition: 'Within radius', action: 'Punch accepted immediately', audit: 'Standard log entry' },
                  { result: 'Failed', condition: 'Outside radius, no override', action: 'Punch blocked', audit: 'Logged with GPS data' },
                  { result: 'Overridden', condition: 'Outside radius, override used', action: 'Punch accepted with note', audit: 'Requires justification, manager notified' },
                  { result: 'Skipped', condition: 'Geofence inactive or remote worker', action: 'Punch accepted without validation', audit: 'Logged as not enforced' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.result}</td>
                    <td className="p-3 text-muted-foreground">{row.condition}</td>
                    <td className="p-3 text-muted-foreground">{row.action}</td>
                    <td className="p-3 text-muted-foreground">{row.audit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning */}
        <WarningCallout>
          <strong>Indoor GPS Limitations:</strong> GPS signals are unreliable inside buildings. 
          For indoor locations (malls, large offices, underground), consider using Wi-Fi-based 
          positioning or exempt indoor workers from geofencing and use device-based clock-in instead.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Remote Workers:</strong> Create "Remote Work Zones" linked to employee home 
          addresses for hybrid workers. This allows location validation even for work-from-home 
          days while maintaining audit compliance.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
