import React, { useMemo } from "react";
import { FiTrendingUp, FiRefreshCw, FiTarget, FiAward } from "react-icons/fi";
import { useVocab } from "../context/VocabContext";

export default function VocabStats() {
  const { items, getDueItems } = useVocab();

  const stats = useMemo(() => {
    const total = items.length;
    const reviewed = items.filter(
      (i) => i.repetitions && i.repetitions > 0,
    ).length;
    const notReviewed = total - reviewed;
    const due = getDueItems().length;

    // Group by mastery level based on repetitions
    const learning = items.filter((i) => {
      const reps = i.repetitions || 0;
      return reps > 0 && reps <= 3;
    }).length;
    const familiar = items.filter((i) => {
      const reps = i.repetitions || 0;
      return reps > 3 && reps <= 6;
    }).length;
    const mastered = items.filter((i) => {
      const reps = i.repetitions || 0;
      return reps > 6;
    }).length;

    // Average ease factor
    const avgEase =
      items.filter((i) => i.ease).length > 0
        ? (
            items.reduce((sum, i) => sum + (i.ease || 0), 0) /
            items.filter((i) => i.ease).length
          ).toFixed(2)
        : "N/A";

    return {
      total,
      reviewed,
      notReviewed,
      due,
      learning,
      familiar,
      mastered,
      avgEase,
    };
  }, [items, getDueItems]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
        Learning Stats
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <FiTarget className="text-amber-600 text-lg" />
            <div className="text-amber-100 text-xs md:text-sm">Total Words</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-50">
            {stats.total}
          </div>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <FiRefreshCw className="text-green-500 text-lg" />
            <div className="text-amber-100 text-xs md:text-sm">Due Today</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-400">
            {stats.due}
          </div>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-amber-600 text-lg" />
            <div className="text-amber-100 text-xs md:text-sm">
              Total Reviews
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-500">
            {stats.totalReviews}
          </div>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 md:p-4 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <FiAward className="text-green-600 text-lg" />
            <div className="text-amber-100 text-xs md:text-sm">Avg Ease</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-500">
            {stats.avgEase}
          </div>
        </div>
      </div>

      {/* Mastery Levels */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-amber-50">
          Mastery Levels
        </h2>
        <div className="space-y-3">
          {[
            {
              label: "Not Reviewed",
              count: stats.notReviewed,
              color: "bg-gray-600",
              icon: "🆕",
            },
            {
              label: "Learning (1-3 reviews)",
              count: stats.learning,
              color: "bg-amber-700",
              icon: "🔵",
            },
            {
              label: "Familiar (4-6 reviews)",
              count: stats.familiar,
              color: "bg-amber-600",
              icon: "🟡",
            },
            {
              label: "Mastered (7+ reviews)",
              count: stats.mastered,
              color: "bg-green-600",
              icon: "🟢",
            },
          ].map((level) => (
            <div key={level.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{level.icon}</span>
                  <span className="text-amber-100">{level.label}</span>
                </div>
                <span className="text-amber-200 text-xs md:text-sm">
                  {level.count} (
                  {stats.total > 0
                    ? ((level.count / stats.total) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-700/60 rounded-full h-2">
                <div
                  className={`${level.color} h-2 rounded-full transition-all duration-300`}
                  style={{
                    width: `${stats.total > 0 ? (level.count / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Insights */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-amber-100 font-semibold mb-4">Insights</h3>
          <div className="space-y-2 text-sm text-amber-100">
            {stats.due > 0 && (
              <p>
                📚 You have{" "}
                <span className="text-orange-400 font-semibold">
                  {stats.due}
                </span>{" "}
                words due for review today!
              </p>
            )}
            {stats.reviewed > 0 && (
              <p>
                ✨ You've reviewed{" "}
                <span className="text-green-400 font-semibold">
                  {stats.reviewed}
                </span>{" "}
                word{stats.reviewed !== 1 ? "s" : ""}.
              </p>
            )}
            {stats.mastered > 0 && (
              <p>
                🏆{" "}
                <span className="text-purple-400 font-semibold">
                  {stats.mastered}
                </span>{" "}
                word{stats.mastered !== 1 ? "s" : ""} mastered!
              </p>
            )}
            {stats.notReviewed > 0 && (
              <p>
                🆕{" "}
                <span className="text-amber-200 font-semibold">
                  {stats.notReviewed}
                </span>{" "}
                word{stats.notReviewed !== 1 ? "s" : ""} not yet reviewed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
