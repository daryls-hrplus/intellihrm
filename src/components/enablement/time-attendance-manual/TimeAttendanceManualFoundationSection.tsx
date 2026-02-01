import { 
  TAFoundationPrerequisites,
  TAFoundationTimePolicies,
  TAFoundationDevices,
  TAFoundationGeofencing,
  TAFoundationFaceVerification,
  TAFoundationPunchImport
} from './sections/foundation';

export function TimeAttendanceManualFoundationSection() {
  return (
    <div className="space-y-8">
      {/* Section 2.1: Prerequisites Checklist */}
      <TAFoundationPrerequisites />

      {/* Section 2.2: Time Policies Configuration */}
      <TAFoundationTimePolicies />

      {/* Section 2.3: Timeclock Devices Setup */}
      <TAFoundationDevices />

      {/* Section 2.4: Geofencing Configuration */}
      <TAFoundationGeofencing />

      {/* Section 2.5: Face Verification Setup */}
      <TAFoundationFaceVerification />

      {/* Section 2.6: Punch Import Configuration */}
      <TAFoundationPunchImport />
    </div>
  );
}
