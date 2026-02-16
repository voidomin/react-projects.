import React, { useState, useEffect, useMemo } from "react";
import { useVocab } from "../context/VocabContext";

export default function VocabForm({ initial = {}, onSubmit, onCancel }) {
  const { items } = useVocab();
  const [word, setWord] = useState(initial.word || "");
  const [definition, setDefinition] = useState(initial.definition || "");
  const [etymology, setEtymology] = useState(initial.etymology || "");
  const [root, setRoot] = useState(initial.root || "");
  const [forms, setForms] = useState(
    initial.forms || { noun: [], verb: [], adjective: [], adverb: [] },
  );
  const [examples, setExamples] = useState(
    initial.examples || {
      base: "",
      noun: "",
      verb: "",
      adjective: "",
      adverb: "",
    },
  );
  const [tags, setTags] = useState(initial.tags || []);
  const [synonyms, setSynonyms] = useState(initial.synonyms || []);
  const [antonyms, setAntonyms] = useState(initial.antonyms || []);
  const [relatedWords, setRelatedWords] = useState(initial.relatedWords || []);
  const [errors, setErrors] = useState({});
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const allExistingTags = useMemo(() => {
    const tagSet = new Set();
    items.forEach((item) => {
      item.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    return allExistingTags.filter((tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()),
    );
  }, [tagInput, allExistingTags]);

  useEffect(() => {
    setWord(initial.word || "");
    setDefinition(initial.definition || "");
    setEtymology(initial.etymology || "");
    setRoot(initial.root || "");
    setForms(
      initial.forms || { noun: [], verb: [], adjective: [], adverb: [] },
    );
    setExamples(
      initial.examples || {
        base: "",
        noun: "",
        verb: "",
        adjective: "",
        adverb: "",
      },
    );
    setTags(initial.tags || []);
    setErrors({});
    setTagInput("");
    setSynonyms(initial.synonyms || []);
    setAntonyms(initial.antonyms || []);
    setRelatedWords(initial.relatedWords || []);
  }, [initial]);

  function validateForm() {
    const newErrors = {};
    if (!word.trim()) newErrors.word = "Word is required";
    if (!definition.trim()) newErrors.definition = "Definition is required";
    if (
      word.trim() &&
      !initial.id &&
      items.some((item) => item.word.toLowerCase() === word.toLowerCase())
    ) {
      newErrors.word = `"${word}" already exists`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      word,
      definition,
      etymology,
      root,
      forms,
      examples,
      tags,
      synonyms,
      antonyms,
      relatedWords,
    });
  }

  function addTagSuggestion(tag) {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
  }

  return (
    <form onSubmit={submit} className="card">
      {/* Core Information Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-amber-50 mb-4 flex items-center gap-2">
          <span>📝</span> Core Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              Word <span className="text-red-400">*</span>
            </label>
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter the word..."
              className={errors.word ? "border-red-500 ring-red-500" : ""}
            />
            {errors.word && (
              <div className="text-red-400 text-xs mt-2 font-medium">
                {errors.word}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              Definition <span className="text-red-400">*</span>
            </label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Clear and concise definition..."
              rows={3}
              className={errors.definition ? "border-red-500 ring-red-500" : ""}
            />
            {errors.definition && (
              <div className="text-red-400 text-xs mt-2 font-medium">
                {errors.definition}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Etymology
              </label>
              <input
                value={etymology}
                onChange={(e) => setEtymology(e.target.value)}
                placeholder="e.g., Latin 'amo'"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Root
              </label>
              <input
                value={root}
                onChange={(e) => setRoot(e.target.value)}
                placeholder="Base word form"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Word Forms Section */}
      <div className="mb-6 border-t border-amber-800/40 pt-6">
        <h3 className="text-lg font-bold text-amber-50 mb-4 flex items-center gap-2">
          <span>🔄</span> Word Forms
        </h3>
        <div className="space-y-4">
          <div className="form-row">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Noun
              </label>
              <input
                placeholder="Comma separated..."
                value={forms.noun.join(", ")}
                onChange={(e) =>
                  setForms((f) => ({
                    ...f,
                    noun: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Verb
              </label>
              <input
                placeholder="Comma separated..."
                value={forms.verb.join(", ")}
                onChange={(e) =>
                  setForms((f) => ({
                    ...f,
                    verb: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Adjective
              </label>
              <input
                placeholder="Comma separated..."
                value={forms.adjective.join(", ")}
                onChange={(e) =>
                  setForms((f) => ({
                    ...f,
                    adjective: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Adverb
              </label>
              <input
                placeholder="Comma separated..."
                value={forms.adverb.join(", ")}
                onChange={(e) =>
                  setForms((f) => ({
                    ...f,
                    adverb: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Examples Section */}
      <div className="mb-6 border-t border-amber-800/40 pt-6">
        <h3 className="text-lg font-bold text-amber-50 mb-4 flex items-center gap-2">
          <span>💡</span> Examples
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              Base Example
            </label>
            <input
              placeholder="Example sentence..."
              value={examples.base}
              onChange={(e) =>
                setExamples((x) => ({ ...x, base: e.target.value }))
              }
            />
          </div>
          <div className="form-row">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Noun
              </label>
              <input
                placeholder="Example..."
                value={examples.noun}
                onChange={(e) =>
                  setExamples((x) => ({ ...x, noun: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Verb
              </label>
              <input
                placeholder="Example..."
                value={examples.verb}
                onChange={(e) =>
                  setExamples((x) => ({ ...x, verb: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Adjective
              </label>
              <input
                placeholder="Example..."
                value={examples.adjective}
                onChange={(e) =>
                  setExamples((x) => ({ ...x, adjective: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Adverb
              </label>
              <input
                placeholder="Example..."
                value={examples.adverb}
                onChange={(e) =>
                  setExamples((x) => ({ ...x, adverb: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Words Section */}
      <div className="mb-6 border-t border-amber-800/40 pt-6">
        <h3 className="text-lg font-bold text-amber-50 mb-4 flex items-center gap-2">
          <span>🔗</span> Related Words
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              Synonyms
            </label>
            <input
              placeholder="Similar words (comma separated)..."
              value={synonyms.join(", ")}
              onChange={(e) =>
                setSynonyms(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              Antonyms
            </label>
            <input
              placeholder="Opposite words (comma separated)..."
              value={antonyms.join(", ")}
              onChange={(e) =>
                setAntonyms(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              Related Words
            </label>
            <input
              placeholder="Associated words (comma separated)..."
              value={relatedWords.join(", ")}
              onChange={(e) =>
                setRelatedWords(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-6 border-t border-amber-800/40 pt-6">
        <h3 className="text-lg font-bold text-amber-50 mb-4 flex items-center gap-2">
          <span>🏷️</span> Tags
        </h3>
        <div style={{ position: "relative" }}>
          <input
            placeholder="Add tags (comma separated or select from suggestions)..."
            value={tagInput || tags.join(", ")}
            onChange={(e) => {
              const val = e.target.value;
              setTagInput(val);
              setShowTagSuggestions(val.trim().length > 0);
            }}
            onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
          />
          {showTagSuggestions && tagSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--card)",
                border: "1px solid var(--muted)",
                borderTop: "none",
                borderRadius: "0 0 0.5rem 0.5rem",
                zIndex: 10,
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {tagSuggestions.map((tag) => (
                <div
                  key={tag}
                  onClick={() => addTagSuggestion(tag)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--muted)",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="hover:bg-green-900/30"
                >
                  ✓ {tag}
                </div>
              ))}
            </div>
          )}
        </div>
        {tags.length > 0 && (
          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  style={{
                    marginLeft: "6px",
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: "bold",
                    padding: "0 2px",
                    fontSize: "1.1em",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-amber-800/40">
        <button
          type="submit"
          className="flex-1 bg-green-700 hover:bg-green-600"
        >
          {initial.id ? "✏️ Update" : "💾 Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600"
        >
          ✕ Cancel
        </button>
      </div>
    </form>
  );
}
