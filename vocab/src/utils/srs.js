// Minimal SM-2-ish scheduler for local prototype
export function initSRS(item) {
  return Object.assign(
    { ease: 2.5, interval: 0, repetitions: 0, nextReview: null },
    item,
  );
}

export function recordReview(item, quality) {
  // quality: 0-5 (5 best)
  const out = { ...item };
  if (quality < 3) {
    out.repetitions = 0;
    out.interval = 1;
  } else {
    out.repetitions = (out.repetitions || 0) + 1;
    if (out.repetitions === 1) out.interval = 1;
    else if (out.repetitions === 2) out.interval = 6;
    else out.interval = Math.round((out.interval || 6) * out.ease);
    out.ease = Math.max(1.3, (out.ease || 2.5) + (0.1 - (5 - quality) * 0.08));
  }
  const next = new Date();
  next.setDate(next.getDate() + (out.interval || 0));
  out.nextReview = next.toISOString();
  return out;
}
// Calculate mastery level based on repetitions
// 🔵 Learning (0 reps), 🟡 Familiar (1-3 reps), 🟢 Mastered (4+ reps)
export function getMasteryLevel(item) {
  const reps = item.repetitions || 0;
  if (reps === 0) return "learning";
  if (reps <= 3) return "familiar";
  return "mastered";
}

export function getMasteryEmoji(masteryLevel) {
  if (masteryLevel === "mastered") return "🟢";
  if (masteryLevel === "familiar") return "🟡";
  return "🔵";
}

export function getMasteryLabel(masteryLevel) {
  if (masteryLevel === "mastered") return "Mastered";
  if (masteryLevel === "familiar") return "Familiar";
  return "Learning";
}
