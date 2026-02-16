/**
 * Application Constants
 * Centralized location for magic numbers, durations, and config values
 */

// Animation durations (milliseconds)
export const ANIMATION = {
  CARD_REMOVAL_DURATION: 200,
  FLIP_DURATION: 200,
  SCROLL_DURATION: 500,
};

// Pagination & Display
export const DISPLAY = {
  ITEMS_PER_PAGE: 20,
  RECENT_WORDS_COUNT: 10,
  DEFAULT_VISIBLE_TAGS: 4,
};

// SRS (Spaced Repetition System) Constants
export const SRS = {
  DEFAULT_EASE: 2.5,
  MIN_EASE: 1.3,
  MAX_EASE: 3.5,
  EASE_INCREMENT: 0.15,
  EASE_DECREMENT: 0.2,
  DEFAULT_INTERVAL: 1,
  GRADUATING_INTERVAL: 1,
  EASY_INTERVAL: 4,
};

// Sort Options
export const SORT_OPTIONS = {
  DATE: "date",
  WORD: "word",
  ROOT: "root",
  TAGS: "tags",
};

export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};

// Mastery Levels (based on repetitions)
export const MASTERY = {
  NOT_REVIEWED: {
    min: 0,
    max: 0,
    label: "Not Reviewed",
    emoji: "⚪",
    color: "gray",
  },
  LEARNING: { min: 1, max: 3, label: "Learning", emoji: "🔵", color: "blue" },
  FAMILIAR: { min: 4, max: 6, label: "Familiar", emoji: "🟡", color: "yellow" },
  MASTERED: {
    min: 7,
    max: Infinity,
    label: "Mastered",
    emoji: "🟢",
    color: "green",
  },
};

// Quality Scores for Flashcards
export const QUALITY_SCORES = {
  COMPLETE_BLACKOUT: 0,
  INCORRECT: 1,
  HARD: 2,
  OK: 3,
  GOOD: 4,
  PERFECT: 5,
};

// Status Types
export const STATUS = {
  PUBLISHED: "published",
  PENDING: "pending",
  DRAFT: "draft",
};

// Storage Keys
export const STORAGE_KEYS = {
  VOCAB_ITEMS: "vocab_items_v1",
  USER_NAME: "vocab_user_name",
  THEME: "vocab_theme_v1",
};

// Tab Names
export const TABS = {
  MANAGE: "manage",
  FLASHCARDS: "flashcards",
  REVIEW: "review",
  STATS: "stats",
};

// Keyboard Shortcuts
export const KEYBOARD = {
  SPACE: "Space",
  ESCAPE: "Escape",
  ENTER: "Enter",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
};
