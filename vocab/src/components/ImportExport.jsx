import React, { useRef, useState, useEffect } from "react";
import { useVocab } from "../context/VocabContext";
import { exportJSON } from "../utils/cache";
import VocabModal from "./VocabModal";
import { SAMPLE_VOCAB } from "../utils/sample-data";

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ImportExport() {
  const { items, importItems } = useVocab();
  const ref = useRef();
  const [pending, setPending] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!importMenuOpen) return;

    const handleClickOutside = (e) => {
      const dropdown = document.querySelector("[data-dropdown-menu]");
      const button = e.target.closest("button");

      if (
        dropdown &&
        !dropdown.contains(e.target) &&
        button?.textContent !== "Import"
      ) {
        setImportMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [importMenuOpen]);

  function handleExport() {
    const text = exportJSON(items);
    download("vocab-export.json", text);
  }

  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setPending(parsed);
        setConfirmOpen(true);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(f);
    if (ref.current) ref.current.value = null;
  }

  function confirmImport(choice) {
    if (!pending) return;
    const merge = choice === "merge";
    importItems(pending, { merge });
    alert(
      `Imported ${Array.isArray(pending) ? pending.length : 0} items (${merge ? "merged" : "replaced"}).`,
    );
    setPending(null);
    setConfirmOpen(false);
  }

  function handleLoadSampleData() {
    setPending(SAMPLE_VOCAB);
    setConfirmOpen(true);
    setImportMenuOpen(false);
  }

  function handleFilePickerClick() {
    if (ref.current) {
      ref.current.click();
    }
    setImportMenuOpen(false);
  }

  return (
    <>
      <div
        style={{
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
          position: "relative",
        }}
      >
        <button className="btn-accent" onClick={handleExport}>
          Export JSON
        </button>
        <button
          onClick={() => setImportMenuOpen(!importMenuOpen)}
          style={{
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--overlay-light)",
            padding: "6px 10px",
            borderRadius: 8,
          }}
        >
          Import
        </button>
        <input
          ref={ref}
          type="file"
          accept="application/json"
          onChange={handleFile}
          style={{ display: "none" }}
        />

        {importMenuOpen && (
          <div
            data-dropdown-menu
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              background: "var(--card)",
              border: "1px solid var(--border-accent)",
              borderRadius: 8,
              padding: "8px 0",
              minWidth: 200,
              zIndex: 1000,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <button
              onClick={handleFilePickerClick}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "var(--bg-accent-medium)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              📁 Upload JSON File
            </button>
            <button
              onClick={handleLoadSampleData}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "var(--bg-accent-medium)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              📚 Load Sample Data (50+ words)
            </button>
          </div>
        )}
      </div>

      {confirmOpen && (
        <VocabModal
          onClose={() => {
            setConfirmOpen(false);
            setPending(null);
          }}
        >
          <div>
            <h3>Confirm Import</h3>
            <p className="small">
              Do you want to merge the imported items into your existing list,
              or replace your current list?
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={() => confirmImport("merge")}>
                Merge
              </button>
              <button className="btn" onClick={() => confirmImport("replace")}>
                Replace
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setPending(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </VocabModal>
      )}
    </>
  );
}
