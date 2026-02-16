import { useMemo, useState, useEffect } from "react";
import { SORT_OPTIONS } from "../utils/constants";

/**
 * Custom hook for filtering and sorting vocabulary items
 * @param {Array} items - Array of vocabulary items
 * @param {string} query - Search query string
 * @param {string|null} tagFilter - Tag to filter by
 * @param {string} sortBy - Sort field (date, word, root, tags)
 * @param {string} sortOrder - Sort order (asc, desc)
 * @returns {Array} Filtered and sorted items
 */
export function useFilteredList(items, query, tagFilter, sortBy, sortOrder) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = items.filter((it) => {
      if (tagFilter && !(it.tags || []).includes(tagFilter)) return false;
      if (!q) return true;
      return (
        (it.word || "").toLowerCase().includes(q) ||
        (it.definition || "").toLowerCase().includes(q) ||
        (it.root || "").toLowerCase().includes(q) ||
        (it.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === SORT_OPTIONS.WORD) {
        cmp = (a.word || "").localeCompare(b.word || "");
      } else if (sortBy === SORT_OPTIONS.ROOT) {
        cmp = (a.root || "").localeCompare(b.root || "");
      } else if (sortBy === SORT_OPTIONS.DATE) {
        cmp = (a.createdAt || "").localeCompare(b.createdAt || "");
      } else if (sortBy === SORT_OPTIONS.TAGS) {
        const aTag = (a.tags || [])[0] || "";
        const bTag = (b.tags || [])[0] || "";
        cmp = aTag.localeCompare(bTag);
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [items, query, tagFilter, sortBy, sortOrder]);
}

/**
 * Custom hook to extract available tags from vocabulary items
 * @param {Array} items - Array of vocabulary items
 * @returns {Array} Unique sorted tags
 */
export function useAvailableTags(items) {
  return useMemo(() => {
    const s = new Set();
    items.forEach((it) => (it.tags || []).forEach((t) => t && s.add(t)));
    return Array.from(s).sort();
  }, [items]);
}

/**
 * Custom hook to get mastery level for a vocabulary item
 * @param {number} repetitions - Number of times reviewed
 * @returns {Object} Mastery level object with label, emoji, color
 */
export function useMastery(repetitions) {
  return useMemo(() => {
    const reps = repetitions || 0;
    if (reps === 0) {
      return {
        level: "not-reviewed",
        emoji: "⚪",
        label: "Not Reviewed",
        color: "gray",
      };
    } else if (reps <= 3) {
      return {
        level: "learning",
        emoji: "🔵",
        label: "Learning",
        color: "blue",
      };
    } else if (reps <= 6) {
      return {
        level: "familiar",
        emoji: "🟡",
        label: "Familiar",
        color: "yellow",
      };
    } else {
      return {
        level: "mastered",
        emoji: "🟢",
        label: "Mastered",
        color: "green",
      };
    }
  }, [repetitions]);
}

/**
 * Custom hook for debouncing values (useful for search inputs)
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
