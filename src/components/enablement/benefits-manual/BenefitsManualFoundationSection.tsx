import { 
  FoundationPrerequisites,
  FoundationCategories,
  FoundationProviders,
  FoundationContracts
} from './sections/foundation';

export function BenefitsManualFoundationSection() {
  return (
    <div className="space-y-12">
      <FoundationPrerequisites />
      <FoundationCategories />
      <FoundationProviders />
      <FoundationContracts />
    </div>
  );
}
