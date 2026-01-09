import { 
  PlansTypesOverview,
  PlansCreation,
  PlansContributions,
  PlansEligibility,
  PlansVersioning
} from './sections/plans';

export function BenefitsManualPlansSection() {
  return (
    <div className="space-y-12">
      <PlansTypesOverview />
      <PlansCreation />
      <PlansContributions />
      <PlansEligibility />
      <PlansVersioning />
    </div>
  );
}
