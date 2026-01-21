/**
 * SEMANTIC UI COMPONENT LIBRARY
 * 
 * Enterprise-grade UI components with enforced color semantics.
 * 
 * COLOR SEMANTIC STANDARD (HRMS-Aligned):
 * 
 * | Intent   | Color | Usage                                           |
 * |----------|-------|------------------------------------------------|
 * | info     | Blue  | Tooltips, guidance, required/reference values   |
 * | success  | Green | Achieved, validated, met expectations           |
 * | warning  | Amber | Needs attention, requires action                |
 * | error    | Red   | Validation failures, critical gaps              |
 * | neutral  | Grey  | Pending, disabled, placeholder, not assessed    |
 * 
 * CRITICAL RULES:
 * 1. Tooltips and "i" icons → Always Blue (Info). No exceptions.
 * 2. Required/Target/Reference values → Neutral or Info Blue. Never Green.
 * 3. Pending/Not assessed → Neutral Grey (not Amber).
 * 4. Amber → Reserved for "needs attention" states only.
 * 5. Green → Only for achievements, validated results, met expectations.
 */

// Badges
export {
  SemanticBadge,
  InfoBadge,
  SuccessBadge,
  WarningBadge,
  ErrorBadge,
  NeutralBadge,
  PendingBadge,
  type SemanticIntent,
  type SemanticBadgeProps,
} from "./semantic-badge";

// Callouts
export {
  SemanticCallout,
  InfoCallout,
  SuccessCallout,
  WarningCallout,
  ErrorCallout,
  NeutralCallout,
  type SemanticCalloutProps,
} from "./semantic-callout";

// Tooltips
export {
  SemanticTooltip,
  InfoIcon,
  TooltipInfoPair,
  type SemanticTooltipProps,
} from "./semantic-tooltip";

// Text
export {
  SemanticText,
  InfoText,
  SuccessText,
  WarningText,
  ErrorText,
  MutedText,
  type SemanticTextProps,
} from "./semantic-text";

// Links
export {
  SemanticLink,
  InfoLink,
  SuccessLink,
  WarningLink,
  ErrorLink,
  MutedLink,
  type SemanticLinkProps,
} from "./semantic-link";

// Entity Status Badges
export {
  EntityStatusBadge,
  ActiveInactiveBadge,
  getEntityStatus,
  type EntityStatus,
  type EntityStatusBadgeProps,
} from "./entity-status-badge";
