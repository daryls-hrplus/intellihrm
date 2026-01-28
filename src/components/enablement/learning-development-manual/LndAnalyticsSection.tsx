export function LndAnalyticsSection() {
  return (
    <div className="space-y-8">
      {['7.1 Analytics Dashboard', '7.2 Learner Progress Reports', '7.3 Course Effectiveness', '7.4 Budget Utilization', '7.5 Compliance Reporting', '7.6 Manager Team View', '7.7 AI-Powered BI Reports'].map((title, i) => (
        <section key={title} id={`sec-7-${i+1}`} data-manual-anchor={`sec-7-${i+1}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Training analytics and reporting. Access via Training → Analytics dashboard.</p>
        </section>
      ))}
    </div>
  );
}
