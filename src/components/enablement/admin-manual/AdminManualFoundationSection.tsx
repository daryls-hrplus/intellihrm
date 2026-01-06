import {
  FoundationPrerequisites,
  FoundationTerritories,
  FoundationCompanyGroups,
  FoundationCompanies,
  FoundationDivisions,
  FoundationDepartments,
  FoundationSections,
  FoundationBranchLocations
} from './sections/foundation';

export function AdminManualFoundationSection() {
  return (
    <div className="space-y-8">
      <FoundationPrerequisites />
      <FoundationTerritories />
      <FoundationCompanyGroups />
      <FoundationCompanies />
      <FoundationDivisions />
      <FoundationDepartments />
      <FoundationSections />
      <FoundationBranchLocations />
    </div>
  );
}
