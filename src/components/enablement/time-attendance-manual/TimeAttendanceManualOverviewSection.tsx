import { 
  TAOverviewIntroduction,
  TAOverviewCoreConcepts,
  TAOverviewArchitecture,
  TAOverviewPersonas,
  TAOverviewCalendar
} from './sections/overview';

export function TimeAttendanceManualOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1: Introduction */}
      <TAOverviewIntroduction />

      {/* Section 1.2: Core Concepts & Terminology */}
      <TAOverviewCoreConcepts />

      {/* Section 1.3: System Architecture */}
      <TAOverviewArchitecture />

      {/* Section 1.4: User Personas & Journeys */}
      <TAOverviewPersonas />

      {/* Section 1.5: Time Management Calendar */}
      <TAOverviewCalendar />
    </div>
  );
}
