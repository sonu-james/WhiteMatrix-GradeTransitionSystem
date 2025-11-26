import React from "react";
import { Rnd } from "react-rnd";

export default function SelectorArrow({ a, index, setArrows, pushHistory, onSelect, askConfirm, // new optional prop
}) {
  const handleDoubleClick = (e) => {
    // e.stopPropagation();

    const doDelete = () => {
      setArrows((prev) => prev.filter((_, i) => i !== index));
      pushHistory?.();
    };

    if (typeof askConfirm === "function") {
      askConfirm("Delete this Bracket connector?", doDelete);
    } else {
      doDelete();
    }
  };
  return (
    <Rnd
      size={{ width: a.w, height: a.h }}
      position={{ x: a.x, y: a.y }}
      onDoubleClick={() => {
        // Remove this arrow on double click
        handleDoubleClick()
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
      {/* Editable Text Below Center Line */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          pushHistory?.();
          setArrows(prev =>
            prev.map((item, i) =>
              i === index ? { ...item, text: e.target.innerText } : item
            )
          );
        }}
        style={{
          position: "absolute",
          top: a.h + 25,          // place below bottom center vertical line (20) + 5px gap
          left: "50%",
          transform: "translateX(-50%)",
          padding: "2px 6px",
          minWidth: 40,
          textAlign: "center",
          background: "transparent",
          border: "1px solid #000",
          borderRadius: 3,
          fontSize: 12,
          cursor: "text",
          zIndex: 500,
        }}
      >
        {a.text || ""}
      </div>

    </Rnd>
  );
}
