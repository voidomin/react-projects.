import React, { useEffect, useState } from "react";
import VocabModal from "./VocabModal";
import { useVocab } from "../context/VocabContext";

const ONBOARD_KEY = "vocab_onboard_shown";

export default function Onboarding({ visible }) {
  const { items, importItems } = useVocab();
  const [open, setOpen] = useState(visible);

  useEffect(() => {
    const shown = localStorage.getItem(ONBOARD_KEY);
    if (!shown && items.length === 0) setOpen(true);
  }, [items.length]);

  function close() {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOpen(false);
  }

  async function importSample() {
    try {
      const res = await fetch("/sample-data.json");
      const data = await res.json();
      importItems(data, { merge: true });
      close();
      alert("Sample data imported");
    } catch (e) {
      console.error(e);
      alert("Failed to import sample data");
    }
  }

  if (!open) return null;

  return (
    <VocabModal onClose={close}>
      <div style={{ minWidth: 360 }}>
        <h3>Welcome to Vocab</h3>
        <p className="small">
          Would you like to import a small sample dataset to get started?
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn-accent" onClick={importSample}>
            Import sample data
          </button>
          <button onClick={close}>Maybe later</button>
        </div>
      </div>
    </VocabModal>
  );
}
