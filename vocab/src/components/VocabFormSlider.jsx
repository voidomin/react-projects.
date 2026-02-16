import React, { useState, useEffect, useMemo } from "react";
import { useVocab } from "../context/VocabContext";
import { FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";

export default function VocabFormSlider({ initial = {}, onSubmit, onCancel }) {
  const { items } = useVocab();
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
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
    setCurrentStep(0);
  }, [initial]);

  const steps = [
    { id: 0, title: "Basic Info", icon: "📝" },
    { id: 1, title: "Word Forms", icon: "🔄" },
    { id: 2, title: "Examples", icon: "💡" },
    { id: 3, title: "Relations", icon: "🔗" },
    { id: 4, title: "Tags", icon: "🏷️" },
  ];

  function validateStep() {
    const newErrors = {};
    if (currentStep === 0) {
      if (!word.trim()) newErrors.word = "Word is required";
      if (!definition.trim()) newErrors.definition = "Definition is required";
      if (
        word.trim() &&
        !initial.id &&
        items.some((item) => item.word.toLowerCase() === word.toLowerCase())
      ) {
        newErrors.word = `"${word}" already exists`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleSubmit() {
    if (!validateStep()) return;
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

  function renderStep() {
    switch (currentStep) {
      case 0: // Basic Info
        return (
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
                autoFocus
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
                rows={4}
                className={
                  errors.definition ? "border-red-500 ring-red-500" : ""
                }
              />
              {errors.definition && (
                <div className="text-red-400 text-xs mt-2 font-medium">
                  {errors.definition}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Etymology
                </label>
                <input
                  value={etymology}
                  onChange={(e) => setEtymology(e.target.value)}
                  placeholder="e.g., Latin 'amo'"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Root
                </label>
                <input
                  value={root}
                  onChange={(e) => setRoot(e.target.value)}
                  placeholder="Base form"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Word Forms
        return (
          <div className="space-y-4">
            <p className="text-sm text-amber-200/80 mb-4">
              Enter different forms of the word (comma separated)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Noun
                </label>
                <input
                  placeholder="e.g., beauty, beauties"
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
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Verb
                </label>
                <input
                  placeholder="e.g., beautify, beautified"
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
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Adjective
                </label>
                <input
                  placeholder="e.g., beautiful"
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
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Adverb
                </label>
                <input
                  placeholder="e.g., beautifully"
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
        );

      case 2: // Examples
        return (
          <div className="space-y-4">
            <p className="text-sm text-amber-200/80 mb-4">
              Provide example sentences for the word
            </p>
            <div>
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Base Example
              </label>
              <input
                placeholder="Example sentence using the word..."
                value={examples.base}
                onChange={(e) =>
                  setExamples((x) => ({ ...x, base: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Noun Example
                </label>
                <input
                  placeholder="Example..."
                  value={examples.noun}
                  onChange={(e) =>
                    setExamples((x) => ({ ...x, noun: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Verb Example
                </label>
                <input
                  placeholder="Example..."
                  value={examples.verb}
                  onChange={(e) =>
                    setExamples((x) => ({ ...x, verb: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Adjective Example
                </label>
                <input
                  placeholder="Example..."
                  value={examples.adjective}
                  onChange={(e) =>
                    setExamples((x) => ({ ...x, adjective: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-200 mb-2">
                  Adverb Example
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
        );

      case 3: // Relations (Synonyms, Antonyms, Related)
        return (
          <div className="space-y-4">
            <p className="text-sm text-amber-200/80 mb-4">
              Add related vocabulary (comma separated)
            </p>
            <div>
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                Synonyms
              </label>
              <input
                placeholder="Similar words, e.g., beautiful, gorgeous, stunning"
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
                placeholder="Opposite words, e.g., ugly, hideous"
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
                placeholder="Associated words, e.g., aesthetic, elegance"
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
        );

      case 4: // Tags
        return (
          <div className="space-y-4">
            <p className="text-sm text-amber-200/80 mb-4">
              Add tags to organize your vocabulary
            </p>
            <div style={{ position: "relative" }}>
              <input
                placeholder="Type to add or select existing tags..."
                value={tagInput || tags.join(", ")}
                onChange={(e) => {
                  const val = e.target.value;
                  setTagInput(val);
                  setShowTagSuggestions(val.trim().length > 0);
                }}
                onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowTagSuggestions(false), 150)
                }
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
        );

      default:
        return null;
    }
  }

  return (
    <div
      className="card"
      style={{ minHeight: "450px", display: "flex", flexDirection: "column" }}
    >
      {/* Header with progress */}
      <div style={{ marginBottom: "24px" }}>
        <h2 className="text-xl font-bold text-amber-50 mb-4">
          {initial.id ? "✏️ Edit Word" : "➕ Add New Word"}
        </h2>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {steps.map((step, idx) => (
            <div
              key={step.id}
              style={{
                flex: 1,
                height: "4px",
                background:
                  idx <= currentStep
                    ? "var(--gradient-progress)"
                    : "var(--overlay-light)",
                borderRadius: "2px",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Current step info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            background: "var(--bg-accent-subtle)",
            border: "1px solid var(--border-accent)",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px" }}>{steps[currentStep].icon}</span>
          <div>
            <div className="text-amber-50 font-semibold">
              {steps[currentStep].title}
            </div>
            <div className="text-xs text-amber-200/70">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div style={{ flex: 1, marginBottom: "24px" }}>{renderStep()}</div>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-accent-subtle)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600"
          style={{ flex: "0 0 auto" }}
        >
          ✕ Cancel
        </button>

        <div style={{ flex: 1 }} />

        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="bg-amber-800 hover:bg-amber-700"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FiChevronLeft size={18} />
            Previous
          </button>
        )}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-green-700 hover:bg-green-600"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            Next
            <FiChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-green-700 hover:bg-green-600"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FiCheck size={18} />
            {initial.id ? "Update" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
