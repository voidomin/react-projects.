import React from "react";

export default function VocabDetail({ item }) {
  if (!item) return null;
  return (
    <div className="card">
      <h2>{item.word}</h2>
      <p>{item.definition}</p>
      {item.root && <p className="small">Root: {item.root}</p>}
      {item.etymology && <p className="small">Etymology: {item.etymology}</p>}
      <div className="small">
        <strong>Forms:</strong>{" "}
        {Object.entries(item.forms || {})
          .map(([k, v]) => (v.length ? `${k}: ${v.join(", ")}` : null))
          .filter(Boolean)
          .join(" • ")}
      </div>
      {item.examples && (
        <div style={{ marginTop: 8 }}>
          <h4>Examples</h4>
          {Object.entries(item.examples || {})
            .filter(([k, v]) => v && v.trim())
            .map(([k, v]) => (
              <div key={k} style={{ marginTop: 6 }}>
                <strong className="small">{k}:</strong>
                <div className="small">{v}</div>
              </div>
            ))}
        </div>
      )}
      {(item.tags || []).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong className="small">Tags:</strong>
          <div className="tags">
            {(item.tags || []).map((t) => (
              <div className="tag" key={t}>
                {t}
              </div>
            ))}
          </div>
        </div>
      )}
      {item.contributors && (
        <p className="small">
          Contributors: {item.contributors.map((c) => c.name).join(", ")}
        </p>
      )}
    </div>
  );
}
