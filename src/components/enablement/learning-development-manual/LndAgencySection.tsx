import { Building } from 'lucide-react';

export function LndAgencySection() {
  return (
    <div className="space-y-8">
      <section id="sec-3-1" data-manual-anchor="sec-3-1">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Building className="h-6 w-6 text-emerald-600" />
          3.1 Training Agency Concepts
        </h2>
        <p className="text-muted-foreground">External training agencies provide courses outside your internal LMS. Track vendors, ratings, certifications, and costs.</p>
      </section>
      {['3.2 Agency Setup', '3.3 Agency-Course Linking', '3.4 Course Dates & Sessions', '3.5 Course Costs', '3.6 Agency Certificates', '3.7 Competencies to be Gained', '3.8 Multi-Company Sharing', '3.9 Agency Ratings'].map((title, i) => (
        <section key={title} id={`sec-3-${i+2}`} data-manual-anchor={`sec-3-${i+2}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Configure external training providers via Training Agencies management. Reference legacy documentation for detailed field mappings.</p>
        </section>
      ))}
    </div>
  );
}
