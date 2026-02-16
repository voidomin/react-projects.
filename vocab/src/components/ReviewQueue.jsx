import React, { useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { useVocab } from "../context/VocabContext";

export default function ReviewQueue() {
  const { getDueItems, recordReviewResult } = useVocab();
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const due = getDueItems();
  const remaining = due.filter((it) => !reviewedIds.has(it.id));

  const handleReview = (id, quality) => {
    recordReviewResult(id, quality);
    setReviewedIds((s) => new Set([...s, id]));
  };

  const stats = {
    total: due.length,
    completed: reviewedIds.size,
    remaining: remaining.length,
  };

  if (due.length === 0)
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiCheckCircle className="w-12 md:w-16 h-12 md:h-16 text-green-500 mx-auto mb-4" />
          <p className="text-base md:text-lg text-amber-100 mb-2">
            All caught up! 🎉
          </p>
          <p className="text-xs md:text-sm text-amber-200">
            No items due for review.
          </p>
        </div>
      </div>
    );

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-amber-50">
          Spaced Repetition Review
        </h1>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
            <div className="text-amber-100 text-xs md:text-sm mb-1">
              Total Due
            </div>
            <div className="text-2xl md:text-3xl font-bold text-amber-400">
              {stats.total}
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
            <div className="text-amber-100 text-xs md:text-sm mb-1">
              Completed
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-400">
              {stats.completed}
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
            <div className="text-amber-100 text-xs md:text-sm mb-1">
              Remaining
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-500">
              {stats.remaining}
            </div>
          </div>
        </div>
        <div className="mt-4 bg-gray-700/60 rounded-lg h-2">
          <div
            className="bg-amber-600 h-2 rounded-lg transition-all duration-300"
            style={{
              width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {remaining.map((it, idx) => (
          <div key={it.id} className="card border-l-4 border-amber-700">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-3 md:gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs bg-gray-700/60 px-2 py-1 rounded text-amber-100">
                    {idx + 1} of {remaining.length}
                  </span>
                  {it.interval && (
                    <span className="text-xs flex items-center gap-1 text-amber-200">
                      <FiClock size={12} /> {Math.ceil(it.interval)} days
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-amber-50">
                  {it.word}
                </h3>
                <p className="text-amber-100 mb-3 text-sm md:text-base">
                  {it.definition}
                </p>

                {it.examples?.base && (
                  <div className="bg-gray-700/30 rounded p-3 mb-3">
                    <div className="text-xs text-green-400 mb-1">Example:</div>
                    <p className="text-amber-100 italic text-sm">
                      "{it.examples.base}"
                    </p>
                  </div>
                )}

                {(it.synonyms?.length > 0 ||
                  it.antonyms?.length > 0 ||
                  it.relatedWords?.length > 0) && (
                  <div className="bg-green-900/20 rounded p-3 mb-3 space-y-2">
                    {it.synonyms?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-green-400 font-semibold">
                          Synonyms:
                        </span>
                        <span className="text-amber-100 ml-2">
                          {it.synonyms.join(", ")}
                        </span>
                      </div>
                    )}
                    {it.antonyms?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-green-400 font-semibold">
                          Antonyms:
                        </span>
                        <span className="text-amber-100 ml-2">
                          {it.antonyms.join(", ")}
                        </span>
                      </div>
                    )}
                    {it.relatedWords?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-green-400 font-semibold">
                          Related:
                        </span>
                        <span className="text-amber-100 ml-2">
                          {it.relatedWords.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {it.reviews && it.reviews.length > 0 && (
                  <div className="text-xs text-amber-200">
                    Reviews: {it.reviews.length} • Ease:{" "}
                    {(it.easeFactor || 2.5).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-6 pt-4 border-t border-amber-900/30">
              <div className="text-xs text-amber-200 mb-3 text-center">
                Rate your recall (1-5)
              </div>
              <div className="grid grid-cols-5 gap-1 md:gap-2">
                {[
                  {
                    score: 5,
                    label: "Perfect",
                    color: "bg-green-700 hover:bg-green-600",
                  },
                  {
                    score: 4,
                    label: "Easy",
                    color: "bg-green-600 hover:bg-green-500",
                  },
                  {
                    score: 3,
                    label: "Good",
                    color: "bg-amber-700 hover:bg-amber-600",
                  },
                  {
                    score: 2,
                    label: "Hard",
                    color: "bg-amber-600 hover:bg-amber-500",
                  },
                  {
                    score: 1,
                    label: "Again",
                    color: "bg-red-700 hover:bg-red-600",
                  },
                ].map((btn) => (
                  <button
                    key={btn.score}
                    onClick={() => handleReview(it.id, btn.score)}
                    className={`${btn.color} py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm transition-all`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.remaining === 0 && stats.completed > 0 && (
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-green-900/20 border border-green-700/50 rounded-lg text-center">
          <FiCheckCircle className="w-10 md:w-12 h-10 md:h-12 text-green-500 mx-auto mb-2" />
          <p className="text-green-300 font-semibold text-sm md:text-base">
            Session Complete!
          </p>
          <p className="text-green-300/70 text-xs md:text-sm mt-1">
            You reviewed {stats.completed} items. Great work! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
