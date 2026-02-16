import React from "react";
import { getMasteryEmoji, getMasteryLevel } from "../utils/srs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function RecentWords({ items, onWordClick }) {
  const [scrollPos, setScrollPos] = React.useState(0);
  const containerRef = React.useRef(null);

  // Get recent 10 words (most recently added)
  const recent = items.slice(0, 10);

  if (recent.length === 0) return null;

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const amount = 250;
    const newPos = scrollPos + (direction === "left" ? -amount : amount);
    setScrollPos(Math.max(0, newPos));
    container.scrollTo({ left: newPos, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 12, color: "var(--text)" }}>
        📚 Recent Words
      </h3>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          onClick={() => scroll("left")}
          disabled={scrollPos === 0}
          style={{
            position: "absolute",
            left: 0,
            zIndex: 10,
            background: "var(--card)",
            border: "2px solid var(--primary)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: scrollPos === 0 ? "not-allowed" : "pointer",
            opacity: scrollPos === 0 ? 0.5 : 1,
            color: "var(--text)",
          }}
        >
          <FiChevronLeft size={16} />
        </button>

        <div
          ref={containerRef}
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            scrollBehavior: "smooth",
            paddingBottom: 8,
            marginLeft: 40,
            marginRight: 40,
            scrollbarWidth: "none",
          }}
          onWheel={(e) => {
            e.preventDefault();
            containerRef.current.scrollLeft += e.deltaY;
          }}
        >
          {recent.map((item) => (
            <button
              key={item.id}
              onClick={() => onWordClick(item.word)}
              style={{
                flex: "0 0 auto",
                minWidth: 200,
                padding: 12,
                background: "var(--card)",
                border: "2px solid var(--primary)",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.backgroundColor = `color-mix(in srgb, var(--primary) 10%, var(--card))`;
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "var(--shadow-sm)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.backgroundColor = "var(--card)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                  userSelect: "none",
                }}
              >
                <div style={{ flex: 1, userSelect: "none" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "var(--primary)",
                      marginBottom: 4,
                      userSelect: "none",
                    }}
                  >
                    {item.word}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text)",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      opacity: 0.7,
                      userSelect: "none",
                    }}
                  >
                    {item.definition}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    title: `${getMasteryEmoji(getMasteryLevel(item))} ${
                      ["Learning", "Familiar", "Mastered"][
                        ["learning", "familiar", "mastered"].indexOf(
                          getMasteryLevel(item),
                        )
                      ]
                    }`,
                  }}
                >
                  {getMasteryEmoji(getMasteryLevel(item))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          style={{
            position: "absolute",
            right: 0,
            zIndex: 10,
            background: "var(--card)",
            border: "2px solid var(--primary)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
