import { Clock, BookOpen } from 'lucide-react';
import {
  SuccessionIntroduction,
  SuccessionCoreConcepts,
  SuccessionPersonas,
  SuccessionArchitecture,
  SuccessionCalendar
} from './sections/overview';

export function SuccessionOverviewSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-1" data-manual-anchor="part-1" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1. System Architecture & Overview</h2>
            <p className="text-muted-foreground">
              Introduction to succession planning, business value, persona journeys, and complete data architecture
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~62 min read
          </span>
          <span>Target: Admin, Consultant, HR Partner</span>
        </div>
      </section>

      {/* Section 1.1: Introduction & Business Value */}
      <section id="sec-1-1" data-manual-anchor="sec-1-1" className="scroll-mt-32">
        <SuccessionIntroduction />
      </section>

      {/* Section 1.2: Core Concepts & Terminology */}
      <section id="sec-1-2" data-manual-anchor="sec-1-2" className="scroll-mt-32">
        <SuccessionCoreConcepts />
      </section>

      {/* Section 1.3: User Personas & Journeys */}
      <section id="sec-1-3" data-manual-anchor="sec-1-3" className="scroll-mt-32">
        <SuccessionPersonas />
      </section>

      {/* Section 1.4: Database Architecture */}
      <section id="sec-1-4" data-manual-anchor="sec-1-4" className="scroll-mt-32">
        <SuccessionArchitecture />
      </section>

      {/* Section 1.5: Module Dependencies & Calendar */}
      <section id="sec-1-5" data-manual-anchor="sec-1-5" className="scroll-mt-32">
        <SuccessionCalendar />
      </section>
    </div>
  );
}
