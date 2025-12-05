import React, { useState } from "react";
import { Rnd } from "react-rnd";

export default function SelectorArrow({
  a,
  index,
  setArrows,
  pushHistory,
  onSelect,
  askConfirm,
}) {
  const [hover, setHover] = useState(false);
  const color = a.color || "#007bff";

  const handleDoubleClick = (e) => {
    e.stopPropagation();

    const doDelete = () => {
      setArrows(prev => prev.filter((_, i) => i !== index));
      pushHistory?.();
    };

    askConfirm ? askConfirm("Delete this Bracket connector?", doDelete) : doDelete();
  };

  const updateArrow = (patch) =>
    setArrows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });

  return (
    <Rnd
      size={{ width: a.w, height: a.h }}
      position={{ x: a.x, y: a.y }}
      bounds="parent"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDoubleClick={handleDoubleClick}
      onDragStop={(e, d) => updateArrow({ x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        pushHistory?.();
        updateArrow({
          w: parseFloat(ref.style.width),
          h: parseFloat(ref.style.height),
          ...pos,
        });
      }}
      style={{ overflow: "visible" }}
    >
      {/* ---- COLOR PICKER (on hover) ---- */}
      {hover && (
        <div
          style={{
            position: "absolute",
            top: -36,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: 4,
            borderRadius: 6,
            zIndex: 9999,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => {
              pushHistory?.();
              updateArrow({ color: e.target.value });
            }}
            style={{
              width: 28,
              height: 28,
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>
      )}

      {/* ---- ARROW SVG SHAPE ---- */}
      <svg width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Left vertical */}
        <line x1={0} y1={0} x2={0} y2={a.h} stroke={color} strokeWidth="3" />

        {/* Bottom horizontal */}
        <line x1={0} y1={a.h} x2={a.w} y2={a.h} stroke={color} strokeWidth="2" />

        {/* Right vertical */}
        <line x1={a.w} y1={0} x2={a.w} y2={a.h} stroke={color} strokeWidth="2" />

        {/* Middle downward line */}
        <line
          x1={a.w / 2}
          y1={a.h}
          x2={a.w / 2}
          y2={a.h + 20}
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </Rnd>
  );
}
