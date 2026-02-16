import React, { useMemo, useState } from "react";
import VocabModal from "./VocabModal";
import { useVocab } from "../context/VocabContext";

export default function TagManager({ onClose }) {
  const { items, updateItem } = useVocab();
  const tags = useMemo(() => {
    const s = new Set();
    items.forEach((it) => (it.tags || []).forEach((t) => t && s.add(t)));
    return Array.from(s);
  }, [items]);

  const [renaming, setRenaming] = useState(null);

  function deleteTag(tag) {
    if (!confirm(`Remove tag "${tag}" from all items?`)) return;
    items.forEach((it) => {
      if ((it.tags || []).includes(tag)) {
        const next = (it.tags || []).filter((t) => t !== tag);
        updateItem(it.id, { tags: next });
      }
    });
  }

  function renameTag(oldTag) {
    const val = prompt("Rename tag", oldTag);
    if (!val || val.trim() === oldTag) return;
    const newTag = val.trim();
    items.forEach((it) => {
      if ((it.tags || []).includes(oldTag)) {
        const next = Array.from(
          new Set((it.tags || []).map((t) => (t === oldTag ? newTag : t))),
        );
        updateItem(it.id, { tags: next });
      }
    });
  }

  return (
    <VocabModal onClose={onClose}>
      <div style={{ minWidth: 360 }}>
        <h3>Tag Manager</h3>
        {tags.length === 0 && <p className="small">No tags yet.</p>}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 8,
          }}
        >
          {tags.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div className="tag">{t}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => renameTag(t)}>
                  Rename
                </button>
                <button className="btn" onClick={() => deleteTag(t)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </VocabModal>
  );
}
