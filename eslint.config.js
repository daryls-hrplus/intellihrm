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
      ],
    },
  },
);
