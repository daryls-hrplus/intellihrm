export function LndTroubleshootingSection() {
  return (
    <div className="space-y-8">
      {['9.1 Common Setup Issues', '9.2 Course Visibility Issues', '9.3 Progress Tracking Issues', '9.4 Quiz Issues', '9.5 Certificate Issues', '9.6 Integration Troubleshooting', '9.7 Best Practices'].map((title, i) => (
        <section key={title} id={`sec-9-${i+1}`} data-manual-anchor={`sec-9-${i+1}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Troubleshooting guide and best practices for L&D administrators.</p>
        </section>
      ))}
    </div>
  );
}
