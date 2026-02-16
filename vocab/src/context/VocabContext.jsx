import React, { createContext, useContext, useEffect, useState } from "react";
import { loadItems, saveItems } from "../utils/cache";
import { initSRS, recordReview } from "../utils/srs";
import { useUser } from "./UserContext";

const VocabContext = createContext();

function makeId() {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function VocabProvider({ children }) {
  const { name } = useUser();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loaded = loadItems().map((i) => initSRS(i));
    setItems(loaded);
  }, []);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  function addItem(payload) {
    const now = new Date().toISOString();
    const item = Object.assign(
      {
        id: makeId(),
        createdAt: now,
        updatedAt: now,
        status: "published",
        contributors: [{ name, ts: now }],
      },
      initSRS(payload),
    );
    setItems((s) => [item, ...s]);
    return item;
  }

  function updateItem(id, patch) {
    const now = new Date().toISOString();
    setItems((s) =>
      s.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: now } : it)),
    );
  }

  function deleteItem(id) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  function submitContribution(payload) {
    const now = new Date().toISOString();
    const item = Object.assign(
      {
        id: makeId(),
        createdAt: now,
        updatedAt: now,
        status: "pending",
        contributors: [{ name, ts: now }],
      },
      initSRS(payload),
    );
    setItems((s) => [item, ...s]);
    return item;
  }

  function importItems(newItems, { merge = true } = {}) {
    try {
      const list = Array.isArray(newItems) ? newItems : [];
      if (merge) {
        setItems((s) => {
          const map = new Map(s.map((it) => [it.id, it]));
          // Track existing words to prevent duplicates (case-insensitive)
          const existingWords = new Set(
            s.map((it) => (it.word || "").toLowerCase().trim()),
          );

          let duplicateCount = 0;
          list.forEach((it) => {
            const normalizedWord = (it.word || "").toLowerCase().trim();
            // Skip if word already exists
            if (existingWords.has(normalizedWord)) {
              duplicateCount++;
              return;
            }
            if (!it.id) it.id = makeId();
            // Ensure imported items have published status
            if (!it.status) it.status = "published";
            map.set(it.id, initSRS(it));
            existingWords.add(normalizedWord);
          });

          return Array.from(map.values()).sort((a, b) =>
            (b.createdAt || "").localeCompare(a.createdAt || ""),
          );
        });
      } else {
        setItems(
          list.map((it) => {
            if (!it.status) it.status = "published";
            return initSRS(it);
          }),
        );
      }
    } catch (e) {
      console.error("importItems", e);
    }
  }

  function getDueItems() {
    const now = new Date().toISOString();
    return items.filter(
      (it) => it.word && it.definition && it.nextReview && it.nextReview <= now,
    );
  }

  function recordReviewResult(id, quality) {
    setItems((s) =>
      s.map((it) => (it.id === id ? recordReview(it, quality) : it)),
    );
  }

  return (
    <VocabContext.Provider
      value={{
        items,
        addItem,
        importItems,
        updateItem,
        deleteItem,
        submitContribution,
        getDueItems,
        recordReviewResult,
      }}
    >
      {children}
    </VocabContext.Provider>
  );
}

export function useVocab() {
  return useContext(VocabContext);
}
