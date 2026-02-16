import React, { useState } from "react";
import PropTypes from "prop-types";
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import VocabModal from "./VocabModal";
import VocabFormSlider from "./VocabFormSlider";
import {
  getMasteryLevel,
  getMasteryEmoji,
  getMasteryLabel,
} from "../utils/srs";

export default function VocabCard({
  item,
  onEdit,
  onDelete,
  onTagClick,
  onRelatedWordClick,
  removing,
}) {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  function handleDelete() {
    if (window.confirm(`Are you sure you want to delete "${item.word}"?`)) {
      onDelete(item.id);
    }
  }

  return (
    <div className={`card ${removing ? "removing" : ""}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-2xl font-bold text-amber-50">{item.word}</h3>
            <span
              title={getMasteryLabel(getMasteryLevel(item))}
              style={{ fontSize: "18px", cursor: "default" }}
            >
              {getMasteryEmoji(getMasteryLevel(item))}
            </span>
            {item.root && (
              <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-300 rounded-md border border-green-700/40">
                root: {item.root}
              </span>
            )}
          </div>
          <p className="text-amber-100 mt-2 text-base leading-relaxed">
            {item.definition}
          </p>
          {(item.tags || []).length > 0 && (
            <div className="tags mt-3">
              {(item.tags || []).map((t) => (
                <div
                  key={t}
                  className="tag cursor-pointer"
                  onClick={() => onTagClick && onTagClick(t)}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowDetails((s) => !s)}
            title="Toggle details"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {showDetails ? (
              <FiChevronUp size={18} />
            ) : (
              <FiChevronDown size={18} />
            )}
          </button>
          <button
            onClick={() => setOpen(true)}
            title="Edit word"
            className="p-2 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            title="Delete word"
            className="p-2 hover:bg-red-600 rounded-lg transition-colors"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-5 pt-5 border-t border-amber-800/50">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-amber-200 mb-3 flex items-center gap-2">
                📝 Word Forms
              </h4>
              {Object.entries(item.forms || {})
                .filter(([k, v]) => v && v.length > 0)
                .map(([k, v]) => (
                  <div key={k} className="text-sm text-amber-100/70 mt-2 ml-2">
                    <span className="font-semibold text-amber-200 block mb-1">
                      {k}
                    </span>
                    <span className="text-amber-100/80">
                      {Array.isArray(v) ? v.join(", ") : v}
                    </span>
                  </div>
                ))}
            </div>
            {item.examples && (
              <div className="pt-3 border-t border-amber-800/30">
                <h4 className="text-sm font-bold text-amber-200 mb-3 flex items-center gap-2">
                  💡 Examples
                </h4>
                {Object.entries(item.examples || {})
                  .filter(([k, v]) => v && v.trim())
                  .map(([k, v]) => (
                    <div key={k} className="text-sm mt-2 ml-2">
                      <span className="font-semibold text-amber-200 block mb-1">
                        {k === "base" ? "Example" : k}
                      </span>
                      <p className="text-amber-100/80 italic bg-gray-700/30 px-3 py-2 rounded-md border border-amber-800/30">
                        "{v}"
                      </p>
                    </div>
                  ))}
              </div>
            )}
            {(item.synonyms || []).length > 0 && (
              <div className="pt-3 border-t border-amber-800/30">
                <h4 className="text-sm font-bold text-green-300 mb-3 flex items-center gap-2">
                  🔗 Synonyms
                </h4>
                <div className="text-sm text-amber-100/70 mt-1 flex flex-wrap gap-2">
                  {item.synonyms.map((word, idx) => (
                    <span
                      key={idx}
                      onClick={() =>
                        onRelatedWordClick && onRelatedWordClick(word)
                      }
                      className="px-2.5 py-1 bg-green-900/30 hover:bg-green-800/50 text-green-300 rounded-md cursor-pointer transition-colors border border-green-700/40 hover:border-green-600/60 text-xs font-medium hover:shadow-md"
                      title="Click to view this word"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(item.antonyms || []).length > 0 && (
              <div className="pt-3 border-t border-amber-800/30">
                <h4 className="text-sm font-bold text-green-300 mb-3 flex items-center gap-2">
                  ⚡ Antonyms
                </h4>
                <div className="text-sm text-amber-100/70 mt-1 flex flex-wrap gap-2">
                  {item.antonyms.map((word, idx) => (
                    <span
                      key={idx}
                      onClick={() =>
                        onRelatedWordClick && onRelatedWordClick(word)
                      }
                      className="px-2.5 py-1 bg-green-900/30 hover:bg-green-800/50 text-green-300 rounded-md cursor-pointer transition-colors border border-green-700/40 hover:border-green-600/60 text-xs font-medium hover:shadow-md"
                      title="Click to view this word"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(item.relatedWords || []).length > 0 && (
              <div className="pt-3 border-t border-amber-800/30">
                <h4 className="text-sm font-bold text-green-300 mb-3 flex items-center gap-2">
                  🌱 Related Words
                </h4>
                <div className="text-sm text-amber-100/70 mt-1 flex flex-wrap gap-2">
                  {item.relatedWords.map((word, idx) => (
                    <span
                      key={idx}
                      onClick={() =>
                        onRelatedWordClick && onRelatedWordClick(word)
                      }
                      className="px-2.5 py-1 bg-green-900/30 hover:bg-green-800/50 text-green-300 rounded-md cursor-pointer transition-colors border border-green-700/40 hover:border-green-600/60 text-xs font-medium hover:shadow-md"
                      title="Click to view this word"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <VocabModal onClose={() => setOpen(false)}>
          <VocabFormSlider
            initial={item}
            onSubmit={(p) => {
              onEdit(item.id, p);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </VocabModal>
      )}
    </div>
  );
}

VocabCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    word: PropTypes.string.isRequired,
    definition: PropTypes.string.isRequired,
    root: PropTypes.string,
    forms: PropTypes.object,
    examples: PropTypes.object,
    synonyms: PropTypes.arrayOf(PropTypes.string),
    antonyms: PropTypes.arrayOf(PropTypes.string),
    relatedWords: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    repetitions: PropTypes.number,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTagClick: PropTypes.func,
  onRelatedWordClick: PropTypes.func,
  removing: PropTypes.bool,
};

VocabCard.defaultProps = {
  onTagClick: () => {},
  onRelatedWordClick: () => {},
  removing: false,
};
