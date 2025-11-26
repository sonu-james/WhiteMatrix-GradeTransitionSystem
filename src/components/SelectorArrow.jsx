import React from "react";
import { Rnd } from "react-rnd";

export default function SelectorArrow({ a, index, setArrows, pushHistory, onSelect }) {
  return (
    <Rnd
      size={{ width: a.w, height: a.h }}
      position={{ x: a.x, y: a.y }}
      onDoubleClick={() => {
        // Remove this arrow on double click
        setArrows((prev) => prev.filter((item) => item.id !== a.id));
      }}
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
      bounds="parent"
    >
      <svg width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Left vertical line */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={a.h}
          stroke={a.color || "#007bff"}
          strokeWidth="3"
        />

        {/* Bottom horizontal line */}
        <line
          x1={0}
          y1={a.h}
          x2={a.w}
          y2={a.h}
          stroke={a.color || "#007bff"}
          strokeWidth="2"
        />

        {/* Right vertical line */}
        <line
          x1={a.w}
          y1={0}
          x2={a.w}
          y2={a.h}
          stroke={a.color || "#007bff"}
          strokeWidth="2"
        />

        {/* Center downward line */}
        <line
          x1={a.w / 2}
          y1={a.h}
          x2={a.w / 2}
          y2={a.h + 20} // adjust 30 for how long you want the line
          stroke={a.color || "#007bff"}
          strokeWidth="2"
        />
      </svg>
    </Rnd>
  );
}
