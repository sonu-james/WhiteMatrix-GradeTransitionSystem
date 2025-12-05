import React, { useState } from "react";
import { Rnd } from "react-rnd";

export default function UArrow({
  a,
  index,
  setArrows,
  pushHistory,
  onSelect,
  askConfirm,
}) {
  const [stemSide, setStemSide] = useState(a.stemSide || "left");
  const [hover, setHover] = useState(false);

  const color = a.color || "#111";

  const toggleSide = () => {
    const next = stemSide === "left" ? "right" : "left";
    setStemSide(next);
    setArrows(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, stemSide: next } : item
      )
    );
    pushHistory?.();
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    const doDelete = () => {
      setArrows(prev => prev.filter((_, i) => i !== index));
      pushHistory?.();
    };
    askConfirm ? askConfirm("Delete this elbow connector?", doDelete) : doDelete();
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
      style={{ overflow: "visible" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragStop={(e, d) => updateArrow({ x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        pushHistory?.();
        updateArrow({
          w: parseFloat(ref.style.width),
          h: parseFloat(ref.style.height),
          ...pos,
        });
      }}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        if (e.altKey) toggleSide();
      }}
    >
      {/* Color picker overlay INSIDE Rnd */}
      {hover && (
        <div
          style={{
            position: "absolute",
            bottom: -36,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: 4,
            borderRadius: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 9999,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => {
              pushHistory();
              updateArrow({ color: e.target.value });
            }}
            style={{
              width: 28,
              height: 28,
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
            }}
          />
        </div>
      )}

      {/* The arrow shape */}
      <svg width="100%" height="100%" style={{ overflow: "visible" }}>
        {stemSide === "left" ? (
          <>
            <line x1={0} y1={0} x2={0} y2={a.h} stroke={color} strokeWidth="2" />
            <line x1={0} y1={a.h} x2={a.w} y2={a.h} stroke={color} strokeWidth="2" />
            <line x1={a.w} y1={a.h} x2={a.w} y2={0} stroke={color} strokeWidth="2" />
            <polygon points={`${a.w - 6},6 ${a.w + 6},6 ${a.w},0`} fill={color} />
          </>
        ) : (
          <>
            <line x1={a.w} y1={0} x2={a.w} y2={a.h} stroke={color} strokeWidth="2" />
            <line x1={0} y1={a.h} x2={a.w} y2={a.h} stroke={color} strokeWidth="2" />
            <line x1={0} y1={0} x2={0} y2={a.h} stroke={color} strokeWidth="2" />
            <polygon points={`0,0 -8,10 8,10`} fill={color} />
          </>
        )}
      </svg>
    </Rnd>
  );
}
