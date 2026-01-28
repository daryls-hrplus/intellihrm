export function LndWorkflowsSection() {
  return (
    <div className="space-y-8">
      {['4.1 Course Lifecycle', '4.2 Enrollment Management', '4.3 Training Request by Gap Analysis', '4.4 Request via Appraisal', '4.5 Self-Service Requests', '4.6 Onboarding Requests', '4.7 HR-Initiated Requests', '4.8 Training Invitations', '4.9 Progress Tracking', '4.10 Quiz Delivery', '4.11 Completion & Evaluation', '4.12 Certification', '4.13 Training History', '4.14 External Records', '4.15 Calendar Operations'].map((title, i) => (
        <section key={title} id={`sec-4-${i+1}`} data-manual-anchor={`sec-4-${i+1}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Operational workflow documentation. See Training Dashboard and Admin LMS for detailed procedures.</p>
        </section>
      ))}
    </div>
  );
}
