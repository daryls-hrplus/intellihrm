export function LndComplianceSection() {
  return (
    <div className="space-y-8">
      {['5.1 Compliance Framework', '5.2 Target Audience Rules', '5.3 Recertification Management', '5.4 Compliance Dashboard', '5.5 Audit Trail', '5.6 Regional Variations'].map((title, i) => (
        <section key={title} id={`sec-5-${i+1}`} data-manual-anchor={`sec-5-${i+1}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Compliance training configuration and tracking. Navigate to Training → Compliance for management options.</p>
        </section>
      ))}
    </div>
  );
}
