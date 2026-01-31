import { Book, Clock } from 'lucide-react';
import { LndQuickReference } from './LndQuickReference';
import { LndArchitectureDiagrams } from './LndArchitectureDiagrams';
import { LndAcronyms, LndIntegrationPoints, LndRolePermissions, LndErrorCodes } from './sections/appendix';
import { LndGlossary } from './LndGlossary';
import { LndVersionHistory } from './LndVersionHistory';

export function LndAppendixSection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <section id="chapter-10" data-manual-anchor="chapter-10" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Book className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">10. Appendix</h2>
            <p className="text-muted-foreground">
              Quick reference cards, architecture diagrams, glossary, acronyms, integration points, permissions, and error codes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~60 min read
          </span>
          <span>Target: All roles</span>
          <span>8 reference sections</span>
        </div>
      </section>

      {/* Appendix A: Quick Reference Cards */}
      <section id="app-a" data-manual-anchor="app-a" className="scroll-mt-32">
        <LndQuickReference />
      </section>

      {/* Appendix B: Architecture Diagrams */}
      <section id="app-b" data-manual-anchor="app-b" className="scroll-mt-32">
        <LndArchitectureDiagrams />
      </section>

      {/* Appendix C: Acronyms */}
      <LndAcronyms />

      {/* Appendix D: Glossary */}
      <section id="app-d" data-manual-anchor="app-d" className="scroll-mt-32">
        <LndGlossary />
      </section>

      {/* Appendix E: Integration Points Reference */}
      <LndIntegrationPoints />

      {/* Appendix F: Role-Based Permissions Matrix */}
      <LndRolePermissions />

      {/* Appendix G: Error Codes & Diagnostic Messages */}
      <LndErrorCodes />

      {/* Appendix H: Version History */}
      <section id="app-h" data-manual-anchor="app-h" className="scroll-mt-32">
        <LndVersionHistory />
      </section>
    </div>
  );
}
