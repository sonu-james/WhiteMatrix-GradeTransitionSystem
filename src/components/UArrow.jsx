import React, { useState } from "react";
import { Rnd } from "react-rnd";

export default function UArrow({
  a,
  index,
  setArrows,
  pushHistory,
  onSelect,
  askConfirm, // new optional prop
}) {
  const [stemSide, setStemSide] = useState(a.stemSide || "left");

  // Toggle side (Alt + Click)
  const toggleSide = () => {
    const next = stemSide === "left" ? "right" : "left";
    setStemSide(next);
    setArrows((prev) =>
      prev.map((item, i) => (i === index ? { ...item, stemSide: next } : item))
    );
    pushHistory?.();
  };

  // Delete on double-click, using askConfirm if provided
  const handleDoubleClick = (e) => {
    e.stopPropagation();

    const doDelete = () => {
      setArrows((prev) => prev.filter((_, i) => i !== index));
      pushHistory?.();
    };

    if (typeof askConfirm === "function") {
      askConfirm("Delete this elbow connector?", doDelete);
    } else {
      doDelete();
    }
  };

  return (
    <Rnd
      size={{ width: a.w, height: a.h }}
      position={{ x: a.x, y: a.y }}
      onDragStop={(e, d) => {
        setArrows((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, x: d.x, y: d.y } : item
          )
        );
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        pushHistory?.();
        setArrows((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  w: parseFloat(ref.style.width),
                  h: parseFloat(ref.style.height),
                  ...pos,
                }
              : item
          )
        );
      }}
      onClick={(e) => {
        if (e.altKey) toggleSide(); // ALT + click toggles stem side
      }}
      onDoubleClick={handleDoubleClick} // Double click deletes (with confirmation if provided)
      bounds="parent"
      style={{ overflow: "visible" }}
    >
      <svg width="100%" height="100%" style={{ overflow: "visible" }}>
        {stemSide === "left" ? (
          <>
            {/* Left stem */}
            <line x1={0} y1={0} x2={0} y2={a.h} stroke="#111" strokeWidth="2" />
            {/* Bottom line */}
            <line x1={0} y1={a.h} x2={a.w} y2={a.h} stroke="#111" strokeWidth="2" />
            {/* Right stem */}
            <line x1={a.w} y1={a.h} x2={a.w} y2={0} stroke="#111" strokeWidth="2" />
            {/* Arrowhead on right top */}
            <polygon points={`${a.w - 6},6 ${a.w + 6},6 ${a.w},0`} fill="#111" />
          </>
        ) : (
          <>
            {/* Right stem */}
            <line x1={a.w} y1={0} x2={a.w} y2={a.h} stroke="#111" strokeWidth="2" />
            {/* Bottom line */}
            <line x1={0} y1={a.h} x2={a.w} y2={a.h} stroke="#111" strokeWidth="2" />
            {/* Left stem */}
            <line x1={0} y1={0} x2={0} y2={a.h} stroke="#111" strokeWidth="2" />
            {/* Arrowhead on left top */}
            <polygon points={`0,0 -8,10 8,10`} fill="#111" />
          </>
        )}
      </svg>
    </Rnd>
  );
}
