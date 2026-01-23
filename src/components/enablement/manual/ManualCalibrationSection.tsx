import {
  CalibrationConceptsPurpose,
  CalibrationSessionSetup,
  CalibrationWorkspaceGuide,
  AIPoweredCalibration,
  NineBoxGridIntegration,
  CalibrationGovernanceAudit
} from './sections/calibration';

export function ManualCalibrationSection() {
  return (
    <div className="space-y-8">
      <section id="sec-4-1" data-manual-anchor="sec-4-1" className="scroll-mt-32">
        <CalibrationConceptsPurpose />
      </section>
      <section id="sec-4-2" data-manual-anchor="sec-4-2" className="scroll-mt-32">
        <CalibrationSessionSetup />
      </section>
      <section id="sec-4-3" data-manual-anchor="sec-4-3" className="scroll-mt-32">
        <CalibrationWorkspaceGuide />
      </section>
      <section id="sec-4-4" data-manual-anchor="sec-4-4" className="scroll-mt-32">
        <AIPoweredCalibration />
      </section>
      <section id="sec-4-5" data-manual-anchor="sec-4-5" className="scroll-mt-32">
        <NineBoxGridIntegration />
      </section>
      <section id="sec-4-6" data-manual-anchor="sec-4-6" className="scroll-mt-32">
        <CalibrationGovernanceAudit />
      </section>
    </div>
  );
}
