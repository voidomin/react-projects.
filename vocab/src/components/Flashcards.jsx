import React, { useState, useEffect } from "react";
import { FiRotateCcw, FiRefreshCw } from "react-icons/fi";
import { useVocab } from "../context/VocabContext";

function Card({ item, onAnswer, progress }) {
  const [show, setShow] = useState(false);
  const [flipping, setFlipping] = useState(false);

  function handleFlip() {
    setFlipping(true);
    setTimeout(() => {
      setShow((s) => !s);
      setFlipping(false);
    }, 200);
  }

  // Keyboard controls: Space = flip, 5/4/3/2/1 = scores
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      }
      if (
        show &&
        ["Digit5", "Digit4", "Digit3", "Digit2", "Digit1"].includes(e.code)
      ) {
        onAnswer(parseInt(e.code[5]));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onAnswer]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-amber-200 text-xs md:text-sm font-semibold">
          📍 Card {progress.current} of {progress.total}
        </div>
        <div className="text-amber-300 text-xs">
          {Math.round((progress.current / progress.total) * 100)}%
        </div>
      </div>
      <div className="w-full bg-gray-700/60 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="bg-linear-to-r from-amber-500 to-amber-400 h-2.5 rounded-full transition-all duration-300 shadow-md"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
      </div>

      <div
        className={`card min-h-96 md:min-h-125 flex flex-col items-center justify-center cursor-pointer transition-all p-8 md:p-10 ${
          flipping ? "scale-95 opacity-80" : "hover:shadow-xl"
        }`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={show ? "Hide definition" : "Show definition"}
        onKeyPress={(e) => {
          if (e.key === "Enter") handleFlip();
        }}
      >
        <div className="text-center px-4 w-full">
          <h2 className="text-5xl md:text-6xl font-bold mb-3 md:mb-4 text-amber-50 tracking-tight">
            {item.word}
          </h2>
          {item.root && (
            <div className="text-green-300 text-sm md:text-base mb-6 font-semibold px-3 py-2 bg-green-900/20 rounded-lg inline-block border border-green-700/40">
              🌳 root: <span className="font-bold">{item.root}</span>
            </div>
          )}

          <div className="min-h-40 md:min-h-48 flex items-center justify-center mt-8">
            {show ? (
              <div className="space-y-4 w-full">
                <p className="text-xl md:text-2xl text-amber-100 leading-relaxed font-light">
                  {item.definition}
                </p>
                {item.examples?.base && (
                  <div className="mt-6 pt-6 border-t border-amber-800/40">
                    <p className="text-base md:text-lg text-amber-200 italic bg-gray-700/30 px-4 py-3 rounded-lg border border-amber-800/30">
                      "{item.examples.base}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg md:text-xl text-amber-300 font-medium">
                  Click or press{" "}
                  <span className="font-bold text-amber-100 bg-gray-700/60 px-2 py-1 rounded">
                    SPACE
                  </span>{" "}
                  to reveal
                </p>
                <p className="text-sm text-amber-300/60 mt-4">
                  💡 Take a moment to think of the definition
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {show &&
        (item.synonyms?.length > 0 ||
          item.antonyms?.length > 0 ||
          item.relatedWords?.length > 0) && (
          <div className="mt-8 pt-6 border-t border-amber-800/40 space-y-4">
            {item.synonyms?.length > 0 && (
              <div>
                <div className="text-sm font-bold text-green-300 mb-2">
                  🔗 Synonyms
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.synonyms.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-green-900/30 text-green-300 rounded-md text-sm font-medium border border-green-700/40"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.antonyms?.length > 0 && (
              <div>
                <div className="text-sm font-bold text-green-300 mb-2">
                  ⚡ Antonyms
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.antonyms.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-green-900/30 text-green-300 rounded-md text-sm font-medium border border-green-700/40"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.relatedWords?.length > 0 && (
              <div>
                <div className="text-sm font-bold text-green-300 mb-2">
                  🌱 Related
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.relatedWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-green-900/30 text-green-300 rounded-md text-sm font-medium border border-green-700/40"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {show && (
        <div className="mt-4 md:mt-6 space-y-3">
          <div className="text-center text-amber-200 text-xs md:text-sm mb-4">
            How well did you remember? (1-5 or press key)
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { score: 5, label: "Perfect", key: "5", color: "bg-green-700" },
              { score: 4, label: "Good", key: "4", color: "bg-green-600" },
              { score: 3, label: "OK", key: "3", color: "bg-amber-700" },
              { score: 2, label: "Hard", key: "2", color: "bg-amber-600" },
              { score: 1, label: "Forgot", key: "1", color: "bg-red-700" },
            ].map((btn) => (
              <button
                key={btn.score}
                onClick={() => onAnswer(btn.score)}
                className={`${btn.color} hover:opacity-80 py-2 md:py-3 rounded-lg font-semibold transition-all text-xs md:text-sm`}
                aria-label={`Rate as ${btn.label} (Press ${btn.key})`}
              >
                <div className="text-sm md:text-lg">{btn.label}</div>
                <div className="text-xs opacity-70">({btn.key})</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Flashcards() {
  const { items, recordReviewResult } = useVocab();
  // Show all words in flashcards (no publish requirement)
  const pool = items.filter((i) => i.word && i.definition);
  const [index, setIndex] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);

  if (pool.length === 0)
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-amber-200 mb-4">No words to study yet.</p>
          <p className="text-sm text-amber-200">
            Add some vocabulary words first!
          </p>
        </div>
      </div>
    );

  const item = pool[index % pool.length];

  function onAnswer(q) {
    recordReviewResult(item.id, q);
    setIndex((i) => i + 1);
    setSessionReviewed((c) => c + 1);
  }

  function resetSession() {
    setIndex(0);
    setSessionReviewed(0);
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold">📚 Flashcards</h1>
          <p className="text-amber-300 text-sm mt-2">
            Study vocab with spaced repetition
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="bg-gray-700/50 rounded-lg p-4 border border-amber-800/40">
            <div className="text-xs text-amber-200 uppercase font-semibold">
              Reviewed this session
            </div>
            <div className="text-3xl font-bold text-amber-300 mt-2">
              {sessionReviewed}
            </div>
          </div>
          {sessionReviewed > 0 && (
            <button
              onClick={resetSession}
              className="p-3 hover:bg-amber-700 rounded-lg transition-colors"
              title="Reset session"
            >
              <FiRefreshCw size={24} />
            </button>
          )}
        </div>
      </div>

      <Card
        item={item}
        onAnswer={onAnswer}
        progress={{ current: (index % pool.length) + 1, total: pool.length }}
      />

      <div className="mt-10 pt-6 border-t border-amber-800/40 text-center">
        <p className="text-amber-200 text-sm font-medium">
          <span className="bg-gray-700/60 px-3 py-1 rounded-md">SPACE</span>
          <span className="mx-2">•</span>
          <span className="bg-gray-700/60 px-3 py-1 rounded-md">1-5 keys</span>
          <span className="mx-2">•</span>
          <span className="bg-gray-700/60 px-3 py-1 rounded-md">Buttons</span>
        </p>
      </div>
    </div>
  );
}
