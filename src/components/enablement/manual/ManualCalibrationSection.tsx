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
      <CalibrationConceptsPurpose />
      <CalibrationSessionSetup />
      <CalibrationWorkspaceGuide />
      <AIPoweredCalibration />
      <NineBoxGridIntegration />
      <CalibrationGovernanceAudit />
    </div>
  );
}
