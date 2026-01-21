import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Files allowed to use raw semantic color classes (the semantic components themselves)
const SEMANTIC_COMPONENT_FILES = [
  "**/components/ui/semantic-badge.tsx",
  "**/components/ui/semantic-callout.tsx",
  "**/components/ui/semantic-tooltip.tsx",
  "**/components/ui/semantic-text.tsx",
  "**/components/ui/semantic-link.tsx",
  "**/components/ui/semantic-index.ts",
  "**/components/ui/entity-status-badge.tsx",
  "**/index.css",
  "**/tailwind.config.ts",
  // Legacy components being migrated
  "**/components/capabilities/ProficiencyLevelPicker.tsx",
  "**/components/employee/ProficiencyGapBadge.tsx",
];

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // UI Color Semantics Governance: Block raw color classes outside semantic components
  // This rule catches bg-green-*, text-green-*, bg-emerald-*, text-emerald-*, etc.
  // in string literals, template literals, and function calls (cn, clsx, classNames)
  {
    files: ["**/*.{ts,tsx}"],
    ignores: SEMANTIC_COMPONENT_FILES,
    rules: {
      "no-restricted-syntax": [
        "warn",
        // Catch raw color classes in string literals
        {
          selector: "Literal[value=/(?:bg|text|border)-(?:green|emerald|red|rose|amber|yellow|blue|sky|cyan)-\\d+/]",
          message: "⚠️ UI Color Semantics: Use SemanticBadge, SemanticCallout, or SemanticTooltip instead of raw color classes. See /enablement/ui-color-semantics for guidelines.",
        },
      // Catch in template literals
      {
        selector: "TemplateLiteral[quasis.0.value.raw=/(?:bg|text|border)-(?:green|emerald|red|rose|amber|yellow|blue|sky|cyan)-\\d+/]",
        message: "⚠️ UI Color Semantics: Use SemanticBadge, SemanticCallout, or SemanticTooltip instead of raw color classes. See /enablement/ui-color-semantics for guidelines.",
      },
      // Icon Color Enforcement: Info icons MUST be blue (text-info)
      {
        selector: "Literal[value=/Info.*text-muted-foreground|text-muted-foreground.*Info/]",
        message: "⚠️ Icon Color Standard: Info icons MUST use text-info (blue), not text-muted-foreground. Use <InfoIcon> from semantic-tooltip.tsx or apply text-info class. See /enablement/ui-color-semantics.",
      },
      // Icon Color Enforcement: HelpCircle icons MUST be blue (text-info)
      {
        selector: "Literal[value=/HelpCircle.*text-muted-foreground|text-muted-foreground.*HelpCircle/]",
        message: "⚠️ Icon Color Standard: HelpCircle icons MUST use text-info (blue), not text-muted-foreground. Use <InfoIcon> from semantic-tooltip.tsx or apply text-info class. See /enablement/ui-color-semantics.",
      },
      // Icon Color Enforcement: Lightbulb icons MUST be blue (text-info)
      {
        selector: "Literal[value=/Lightbulb.*text-muted-foreground|text-muted-foreground.*Lightbulb/]",
        message: "⚠️ Icon Color Standard: Lightbulb icons MUST use text-info (blue), not text-muted-foreground. See /enablement/ui-color-semantics.",
      },
      // Icon Color Enforcement: Success icons (CheckCircle, Check) should use text-success
      {
        selector: "Literal[value=/CheckCircle.*text-muted-foreground|text-muted-foreground.*CheckCircle/]",
        message: "⚠️ Icon Color Standard: CheckCircle icons should use text-success (green) for confirmed/completed states, not text-muted-foreground. See /enablement/ui-color-semantics.",
      },
      // Icon Color Enforcement: Warning icons (AlertTriangle) should use text-warning
      {
        selector: "Literal[value=/AlertTriangle.*text-muted-foreground|text-muted-foreground.*AlertTriangle/]",
        message: "⚠️ Icon Color Standard: AlertTriangle icons should use text-warning (amber) for attention states, not text-muted-foreground. See /enablement/ui-color-semantics.",
      },
      // Icon Color Enforcement: Error icons (XCircle) should use text-destructive
      {
        selector: "Literal[value=/XCircle.*text-muted-foreground|text-muted-foreground.*XCircle/]",
        message: "⚠️ Icon Color Standard: XCircle icons should use text-destructive (red) for error states, not text-muted-foreground. See /enablement/ui-color-semantics.",
      },
      // Entity Status Badge Enforcement: Catch is_active with variant="default" (blue)
      {
        selector: "Literal[value=/is_active.*variant.*default|variant.*default.*Active/]",
        message: "⚠️ Entity Status Standard: Use <EntityStatusBadge status='active' /> or <ActiveInactiveBadge isActive={...} /> instead. Blue 'default' variant is NOT for entity state. Active must be green. See /enablement/ui-color-semantics.",
      },
    ],
  },
},
);
