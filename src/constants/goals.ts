export const GOAL_CATEGORY_KEYS = [
  'emergency_fund', 'home', 'vehicle', 'education', 'travel', 'family', 'health',
  'business', 'debt_payoff', 'technology', 'wedding', 'religious_event', 'personal', 'other',
] as const;

export const GOAL_VECTOR_KEYS = [
  'shield', 'umbrella', 'medical_cross', 'home', 'key', 'car', 'maintenance',
  'graduation_cap', 'book', 'school', 'airplane', 'suitcase', 'map', 'family',
  'gift', 'wallet', 'piggy_bank', 'debt_free', 'target', 'briefcase', 'store',
  'laptop', 'heart', 'celebration', 'star', 'custom_goal',
] as const;

export const GOAL_COLOR_KEYS = [
  'pocket_blue', 'deep_navy', 'positive_lime', 'teal', 'violet',
  'amber', 'coral', 'rose', 'sky', 'neutral',
] as const;

export type GoalCategoryKey = typeof GOAL_CATEGORY_KEYS[number];
export type GoalVectorKey = typeof GOAL_VECTOR_KEYS[number];
export type GoalColorKey = typeof GOAL_COLOR_KEYS[number];

export const DEFAULT_GOAL_CATEGORY: GoalCategoryKey = 'other';
export const DEFAULT_GOAL_VECTOR: GoalVectorKey = 'target';
export const DEFAULT_GOAL_COLOR: GoalColorKey = 'pocket_blue';

export const isGoalCategoryKey = (value: unknown): value is GoalCategoryKey =>
  GOAL_CATEGORY_KEYS.includes(value as GoalCategoryKey);
export const isGoalVectorKey = (value: unknown): value is GoalVectorKey =>
  GOAL_VECTOR_KEYS.includes(value as GoalVectorKey);
export const isGoalColorKey = (value: unknown): value is GoalColorKey =>
  GOAL_COLOR_KEYS.includes(value as GoalColorKey);
