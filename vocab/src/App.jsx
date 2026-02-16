import React, { useState } from "react";
import Layout from "./components/Layout";
import Header from "./components/Header";
import VocabList from "./components/VocabList";
import Flashcards from "./components/Flashcards";
import ReviewQueue from "./components/ReviewQueue";
import VocabStats from "./components/VocabStats";
import Onboarding from "./components/Onboarding";
import { useVocab } from "./context/VocabContext";

export default function App() {
  const [tab, setTab] = useState("manage");
  const { items } = useVocab();

  return (
    <Layout>
      <Header onChangeTab={setTab} activeTab={tab} />
      <main className="container">
        {tab === "manage" && <VocabList />}
        {tab === "flashcards" && <Flashcards />}
        {tab === "review" && <ReviewQueue />}
        {tab === "stats" && <VocabStats />}
        {items.length === 0 && <Onboarding />}
      </main>
    </Layout>
  );
}
