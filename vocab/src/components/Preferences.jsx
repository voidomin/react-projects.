import React, { useEffect, useState } from "react";
import VocabModal from "./VocabModal";
import { useUser } from "../context/UserContext";

const MODE_KEY = "vocab_import_mode";

export default function Preferences({ onClose }) {
  const { name, setName } = useUser();
  const [localName, setLocalName] = useState(name || "");
  const [mode, setMode] = useState(
    () => localStorage.getItem(MODE_KEY) || "merge",
  );

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  function save() {
    setName(localName || "Owner");
    alert("Saved contributor name");
    onClose();
  }

  function saveMode(m) {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  }

  return (
    <VocabModal onClose={onClose}>
      <div style={{ minWidth: 360 }}>
        <h3>Preferences</h3>
        <div style={{ marginTop: 8 }}>
          <label className="small">Contributor name</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Your name"
            />
            <button onClick={save} className="btn-accent">
              Save
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="small">Import behavior</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                checked={mode === "merge"}
                onChange={() => saveMode("merge")}
              />{" "}
              Merge
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                checked={mode === "replace"}
                onChange={() => saveMode("replace")}
              />{" "}
              Replace
            </label>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </VocabModal>
  );
}
