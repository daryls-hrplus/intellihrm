export function LndIntegrationSection() {
  return (
    <div className="space-y-8">
      {['8.1 Onboarding Integration', '8.2 Appraisal Integration', '8.3 Competency Sync', '8.4 Succession Link', '8.5 Career Development', '8.6 External LMS', '8.7 Calendar Integration', '8.8 Workflow Engine'].map((title, i) => (
        <section key={title} id={`sec-8-${i+1}`} data-manual-anchor={`sec-8-${i+1}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Cross-module integration documentation. Auto-enrollment triggers and data flow architecture.</p>
        </section>
      ))}
    </div>
  );
}
