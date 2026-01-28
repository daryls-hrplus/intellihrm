import {
  LndSetupPrerequisites,
  LndSetupCategories,
  LndSetupCourses,
  LndSetupModulesLessons,
  LndSetupQuizzes,
  LndSetupLearningPaths,
  LndSetupCompetencyMapping,
  LndSetupCompliance,
  LndSetupInstructors,
  LndSetupBudgets,
  LndSetupEvaluations,
  LndSetupGamification,
  LndSetupScormXapi,
  LndSetupCertificates,
  LndSetupTrainingRequests,
  LndSetupCompanySettings
} from './sections/setup';

export function LndSetupSection() {
  return (
    <div className="space-y-12">
      <LndSetupPrerequisites />
      <LndSetupCategories />
      <LndSetupCourses />
      <LndSetupModulesLessons />
      <LndSetupQuizzes />
      <LndSetupLearningPaths />
      <LndSetupCompetencyMapping />
      <LndSetupCompliance />
      <LndSetupInstructors />
      <LndSetupBudgets />
      <LndSetupEvaluations />
      <LndSetupGamification />
      <LndSetupScormXapi />
      <LndSetupCertificates />
      <LndSetupTrainingRequests />
      <LndSetupCompanySettings />
    </div>
  );
}
