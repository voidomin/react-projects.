import React, { useState, useCallback } from "react";
import { useVocab } from "../context/VocabContext";
import { useFilteredList, useAvailableTags } from "../hooks/useVocabUtils";
import { ANIMATION, DISPLAY } from "../utils/constants";
import VocabCard from "./VocabCard";
import ImportExport from "./ImportExport";
import VocabModal from "./VocabModal";
import VocabFormSlider from "./VocabFormSlider";
import TagManager from "./TagManager";
import RecentWords from "./RecentWords";

export default function VocabList() {
  const { items, addItem, updateItem, deleteItem } = useVocab();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [removingIds, setRemovingIds] = useState([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Use custom hooks
  const availableTags = useAvailableTags(items);
  const filtered = useFilteredList(items, query, tagFilter, sortBy, sortOrder);

  // Memoized callbacks
  const handleAdd = useCallback(
    (payload) => {
      addItem(payload);
      setOpen(false);
    },
    [addItem],
  );

  const handleDeleteWithAnimation = useCallback(
    (id) => {
      setRemovingIds((r) => [...r, id]);
      setTimeout(() => {
        deleteItem(id);
        setRemovingIds((r) => r.filter((x) => x !== id));
      }, ANIMATION.CARD_REMOVAL_DURATION);
    },
    [deleteItem],
  );

  const handleRelatedWordClick = useCallback((word) => {
    setQuery(word.trim());
    setTagFilter(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-amber-50">Words</h2>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
          <ImportExport />
          <button
            onClick={() => setTagsOpen(true)}
            className="flex-1 md:flex-none"
            aria-label="Manage tags"
          >
            Manage Tags
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex-1 md:flex-none"
            aria-label="Add new word"
          >
            Add Word
          </button>
        </div>
      </div>

      <div className="search">
        <div className="relative mb-4" role="search">
          <input
            placeholder="🔍 Search words, definitions, root or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
            aria-label="Search vocabulary words"
            type="search"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-100 transition-colors text-lg"
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center mt-3">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-start md:items-center w-full md:w-auto">
            <label className="small text-amber-200 font-semibold">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto"
              aria-label="Sort vocabulary by"
            >
              <option value="date">Date Added</option>
              <option value="word">Word (A-Z)</option>
              <option value="root">Root</option>
              <option value="tags">Tags</option>
            </select>
            <button
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
              className="w-full md:w-auto"
              aria-label={`Sort order: ${sortOrder === "asc" ? "ascending" : "descending"}`}
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
            <span className="small text-amber-200 text-xs">
              {filtered.length === 0
                ? "No items"
                : `Showing 1-${Math.min(20, filtered.length)} of ${filtered.length}`}
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="small text-amber-200 font-semibold text-xs">
              Filter by Tag:
            </label>
            <input
              type="text"
              placeholder="🔍 Search tags..."
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              className="text-xs"
              style={{
                padding: "6px 10px",
                background: "var(--overlay-dark)",
                border: "1px solid var(--border-accent)",
                borderRadius: "6px",
                color: "var(--text)",
                fontSize: "12px",
                maxWidth: "200px",
              }}
            />
            {tagSearchQuery && (
              <button
                onClick={() => setTagSearchQuery("")}
                className="text-xs"
                style={{
                  padding: "4px 8px",
                  background: "var(--bg-accent-medium)",
                  border: "1px solid var(--border-accent-hover)",
                  borderRadius: "4px",
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="filter-pills">
            <div
              className={`pill ${tagFilter === null ? "active" : ""}`}
              onClick={() => setTagFilter(null)}
            >
              All
            </div>
            {(showAllTags
              ? availableTags
              : availableTags
                  .filter((t) =>
                    t.toLowerCase().includes(tagSearchQuery.toLowerCase()),
                  )
                  .slice(0, 4)
            ).map((t) => (
              <div
                key={t}
                className={`pill ${tagFilter === t ? "active" : ""}`}
                onClick={() => setTagFilter(tagFilter === t ? null : t)}
              >
                {t}
              </div>
            ))}
            {!tagSearchQuery && availableTags.length > 4 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="pill"
                style={{
                  background: "var(--bg-accent-medium)",
                  border: "1px solid var(--border-accent-hover)",
                }}
              >
                {showAllTags
                  ? "Show Less ↑"
                  : `+${availableTags.length - 4} More`}
              </button>
            )}
          </div>
        </div>
      </div>

      <RecentWords
        items={items}
        onWordClick={(word) => {
          setQuery(word);
          setTagFilter(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <div>
        {filtered.map((it) => (
          <VocabCard
            key={it.id}
            item={it}
            onEdit={updateItem}
            onDelete={() => handleDeleteWithAnimation(it.id)}
            onTagClick={setTagFilter}
            onRelatedWordClick={handleRelatedWordClick}
            removing={removingIds.includes(it.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="small text-amber-200">
            No words match — try a different search or add one.
          </p>
        )}
      </div>

      {tagsOpen && <TagManager onClose={() => setTagsOpen(false)} />}

      {open && (
        <VocabModal onClose={() => setOpen(false)}>
          <VocabFormSlider
            onSubmit={handleAdd}
            onCancel={() => setOpen(false)}
          />
        </VocabModal>
      )}
    </div>
  );
}
