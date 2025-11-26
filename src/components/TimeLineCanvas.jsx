
import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import UArrow from "./UArrow";
import SelectorArrow from "./SelectorArrow";

/* ---------- TimelineCanvas ---------- */
export default function TimelineCanvas({
  positioned,
  selectedId,
  onSelect,
  onResize,
  onReorder,
  containerRef,
  arrows = [],
  setArrows,
  labels = [],
  setLabels,
  customMarkers = [],
  verticalLines = [],
  setCustomMarkers,
  setVerticalLines,
  placingDiagonal,
  setPlacingDiagonal,
  pushHistory,
}) {
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const dragStartXRef = useRef(null);
  // Tailwind Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });

  const askConfirm = (message, onConfirm) => {
    setConfirmModal({ open: true, message, onConfirm });
  };

  const closeConfirm = (ok) => {
    if (ok && typeof confirmModal.onConfirm === "function") {
      confirmModal.onConfirm();
    }
    setConfirmModal({ open: false, message: "", onConfirm: null });
  };

  // ref + dynamic diagram height state
  const diagramRef = useRef(null);
  const [diagramHeight, setDiagramHeight] = useState(460);
  const RULER_HEIGHT = 50;

  const format = v => (v == null || v === "" ? "-" : String(v));

  // helper to update an item by index in a list
  const updateByIndex = (arr, idx, patch) => {
    const copy = [...arr];
    copy[idx] = { ...copy[idx], ...patch };
    return copy;
  };

  // delete helpers
  const removeArrow = (i) => setArrows(prev => prev.filter((_, idx) => idx !== i));
  const removeLabel = (i) => setLabels(prev => prev.filter((_, idx) => idx !== i));
  const removeMarker = (i) => setCustomMarkers(prev => prev.filter((_, idx) => idx !== i));
  const removeVerticalLine = (id) =>
    setVerticalLines(prev => prev.filter(l => l.id !== id));

  // reorder on drag stop of blocks
  const onDragStopBlock = (id, clientX) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    let acc = 0, target = positioned.length - 1;
    for (let i = 0; i < positioned.length; i++) {
      acc += positioned[i].pxWidth;
      if (x < acc) { target = i; break; }
    }
    const arr = [...positioned];
    const fromIndex = arr.findIndex(r => r.id === id);
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(target, 0, item);
    onReorder(arr.map(({ pxWidth, left, ...rest }) => rest));
  };

  // legacy drag handler (kept)
  const startDraggingVerticalLine = (e, id) => {
    e.stopPropagation();
    const startX = e.clientX;
    const line = verticalLines.find(l => l.id === id);
    if (!line) return;
    const startLineX = line.x;
    const move = (ev) => {
      const dx = ev.clientX - startX;
      setVerticalLines(prev =>
        prev.map(l => l.id === id ? { ...l, x: startLineX + dx } : l)
      );
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      pushHistory?.();
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // ResizeObserver for diagramHeight
  useEffect(() => {
    const el = diagramRef.current;
    if (!el) return;
    setDiagramHeight(el.clientHeight || 460);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDiagramHeight(entry.contentRect.height);
        }
      });
      ro.observe(el);
    }

    const onResize = () => setDiagramHeight(el.clientHeight || 460);
    window.addEventListener("resize", onResize);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [diagramRef]);

  return (
    <div className="flex-1 bg-white p-5 overflow-auto" ref={containerRef}>
      <div className="mb-2 text-sm text-gray-600">Timeline view — drag blocks or resize right edge</div>

      {/* Scale ruler */}
      <div className="flex border-b pb-2">
        {Array.from({ length: Math.ceil(positioned.reduce((s, p) => s + p.pxWidth, 0) / 50) }).map((_, i) => (
          <div key={i} style={{ width: 50 }} className="text-xs text-center text-gray-400 border-r">{i * 50}</div>
        ))}
      </div>

      {/* Diagram wrapper (ref attached) */}
      <div
        ref={diagramRef}
        style={{ position: "relative", minHeight: 460 }}
        onClick={(e) => {
          if (!placingDiagonal) return;
          const wrapper = e.currentTarget;
          const rect = wrapper.getBoundingClientRect();
          const svgX = e.clientX - rect.left - wrapper.clientLeft;
          const svgY = e.clientY - rect.top - wrapper.clientTop - RULER_HEIGHT;

          // FIRST CLICK
          if (placingDiagonal === "waiting-start") {
            setPlacingDiagonal({ x1: svgX - 10, y1: svgY });
            return;
          }

          // SECOND CLICK
          if (placingDiagonal.x1 != null) {
            const x1 = placingDiagonal.x1;
            const y1 = placingDiagonal.y1;
            const dx = (svgX) - x1;
            const dy = (svgY) - y1;
            const angle = (Math.atan2(dy, dx) * (180 / Math.PI));

            setArrows(prev => [
              ...prev,
              {
                type: "rotatable",
                x: x1,
                y: y1,
                w: Math.sqrt(dx * dx + dy * dy),
                h: 30,
                angle
              }
            ]);
            pushHistory?.();
            setPlacingDiagonal(null);
          }
        }}
      >

        {/* built-in markers (static) */}
        {[ /* none by default */].map((m, i) => {
          const leftPx = m.unitPosition;
          return (
            <div key={i} style={{ position: "absolute", left: leftPx, top: 0, bottom: 0, zIndex: 50 }}>
              <div style={{ borderLeft: "2px dotted #555", height: Math.max(0, diagramHeight), position: "absolute", left: 0, top: 0 }} />
              <div
                className="text-[10px] font-bold text-gray-800 px-1 rounded"
                style={{
                  position: "absolute",
                  top: -16,
                  left: -10,
                  whiteSpace: "nowrap",
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  zIndex: 100,
                }}
              >
                {m.label}
              </div>
            </div>
          );
        })}

        {/* custom markers added by toolbar */}
        {customMarkers.map((m, i) => (
          <Rnd
            key={"cm" + i}
            size={{ width: 2, height: Math.max(40, diagramHeight) }}
            position={{ x: m.x, y: 0 }}
            bounds="parent"
            enableResizing={false}
            onDragStop={(e, d) => {
              pushHistory();
              setCustomMarkers(prev =>
                updateByIndex(prev, i, { x: d.x })
              );
            }}
            style={{ zIndex: 60, overflow: "visible" }}
          >
            <div style={{ borderLeft: "2px dotted #444", height: "100%" }} />
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                pushHistory();
                setCustomMarkers(prev =>
                  updateByIndex(prev, i, { text: e.target.innerText })
                );
              }}
              style={{
                position: "absolute",
                top: -16,
                left: -10,
                background: "#fff",
                textAlign: "center",
                border: "5px solid #ee1f1fff",
                padding: "2px 4px",
                fontSize: 12,
                fontWeight: "bold",
                color: "red",
                borderRadius: 3,
                minWidth: 100,
              }}
              title="Edit text, drag to move, double click container to delete"
              onDoubleClick={(e) => {
                e.stopPropagation();
                askConfirm("Delete this custom marker?", () => {
                  pushHistory?.();
                  removeMarker(i);
                });
              }}
            >
              {m.text || "SWITCH"}
            </div>
          </Rnd>
        ))}


        {/* Blocks (positioned) */}
        {positioned.map(p => (
          <Rnd
            key={p.id}
            size={{ width: p.pxWidth, height: 100 }}
            position={{ x: p.left + 100, y: 200 }}
            bounds="parent"
            enableResizing={{ right: true }}
            onResizeStop={(e, dir, ref) => onResize(p.id, parseInt(ref.style.width, 10))}
            dragAxis="x"
            onDragStart={(e, d) => {
              // store start X (clientX) so we can differentiate click vs drag
              dragStartXRef.current = e?.clientX ?? (d?.x ?? null);
            }}
            onDragStop={(e, d) => {
              try {
                const startX = dragStartXRef.current;
                const endX = e?.clientX ?? (d?.x ?? null);

                // If we don't have both values, fallback to doing the reorder:
                if (typeof startX !== "number" || typeof endX !== "number") {
                  onDragStopBlock(p.id, endX);
                } else {
                  const moved = Math.abs(endX - startX);
                  const MIN_MOVE_PX = 6; // tolerance — adjust 4..10 px as you like
                  if (moved >= MIN_MOVE_PX) {
                    onDragStopBlock(p.id, endX);
                  } // else treat it as click — don't reorder
                }
              } finally {
                // clear stored startX
                dragStartXRef.current = null;
              }
            }}
            className=" flex flex-col items-center justify-center cursor-grab select-none relative text-center py-3"
            style={{
              backgroundColor: p.color,
              color: "#fff",
              border: selectedId === p.id ? "3px solid rgba(0,0,0,0.2)" : "1px solid rgba(0,0,0,0.08)",
              overflow: "visible"
            }}
            onMouseDown={() => onSelect(p.id)}
          >
            <div className="font-semibold text-sm">{p.grade}</div>
            <div className="text-xs">{p.code}</div>
            <div className="text-[11px] opacity-90">{p.type} • {format(p.ton)}T • GP:{format(p.gp)}</div>

            {/* Arrow overlay inside block */}
            {p.blockType !== "normal" && (
              <svg
                width={p.pxWidth}
                height={100}
                style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", overflow: "visible", }}>
                {p.blockType === "increase" ? (
                  <>
                    <line x1={0} y1={100} x2={p.pxWidth} y2={0} stroke="#000" strokeWidth={2} />
                    <polygon
                      fill="#000"
                      points={(() => {
                        const tipX = p.pxWidth;
                        const tipY = 0;
                        const arrowLength = 10;
                        const arrowWidth = 6;
                        const dx = tipX - 0;
                        const dy = tipY - 100;
                        const angle = Math.atan2(dy, dx);

                        const leftX = tipX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle);
                        const leftY = tipY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle);

                        const rightX = tipX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle);
                        const rightY = tipY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle);

                        return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
                      })()}
                    />
                  </>
                ) : (
                  <>
                    <line x1={0} y1={0} x2={p.pxWidth} y2={100} stroke="#000" strokeWidth={2} />
                    <polygon
                      fill="#000"
                      points={(() => {
                        const tipX = p.pxWidth;
                        const tipY = 100;
                        const arrowLength = 10;
                        const arrowWidth = 6;
                        const dx = tipX - 0;
                        const dy = tipY - 0;
                        const angle = Math.atan2(dy, dx);

                        const leftX = tipX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle);
                        const leftY = tipY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle);

                        const rightX = tipX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle);
                        const rightY = tipY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle);

                        return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
                      })()}
                    />
                  </>
                )}
              </svg>
            )}
          </Rnd>
        ))}


        {/* verticalLines (draggable & resizable) */}
        {verticalLines.map((line, i) => {
          const defaultTop = RULER_HEIGHT;
          const defaultHeight = Math.max(40, (diagramHeight || 460) - RULER_HEIGHT);

          const lineY = typeof line.y === "number" ? line.y : defaultTop;
          const lineH = typeof line.h === "number" ? line.h : defaultHeight;

          const containerWidth = 8;
          const halfContainer = Math.floor(containerWidth / 2);

          return (
            <Rnd
              key={line.id}
              size={{ width: containerWidth, height: lineH }}
              position={{ x: (line.x || 0) - halfContainer, y: lineY }}
              bounds="parent"
              enableResizing={{
                top: true,
                bottom: true,
                left: false,
                right: false,
                topRight: false,
                topLeft: false,
                bottomLeft: false,
                bottomRight: false,
              }}
              onDragStop={(e, d) => {
                pushHistory?.();
                setVerticalLines(prev => updateByIndex(prev, i, { x: d.x + halfContainer, y: d.y }));
              }}
              onResizeStop={(e, dir, ref, delta, position) => {
                pushHistory?.();
                const newH = parseInt(ref.style.height, 10);
                const newY = position.y;
                setVerticalLines(prev => updateByIndex(prev, i, { h: newH, y: newY }));
              }}
              style={{
                zIndex: 90,
                background: "transparent",
                cursor: "ew-resize",
                pointerEvents: "auto",
                overflow: "visible"
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                askConfirm("Delete this vertical line?", () => {
                  pushHistory?.();
                  setVerticalLines(prev => prev.filter(l => l.id !== line.id));
                });
              }}
            >
              <div
                onMouseDown={(e) => { e.stopPropagation(); }}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: 0,
                  height: "100%",
                  width: 2,
                  borderLeft: "2px dashed #3aa6d8ff",
                  cursor: "ew-resize",
                  background: "transparent",
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  askConfirm("Delete this vertical line?", () => {
                    pushHistory?.();
                    setVerticalLines(prev => prev.filter(l => l.id !== line.id));
                  });
                }}
              />
            </Rnd>
          );
        })}


        {/* ARROWS (including bracket connector) */}
        {arrows.map((a, i) => {
          if (a.type === "elbow") {
            return (
              <UArrow
                key={"elbow" + i}
                a={a}
                index={i}
                setArrows={setArrows}
                pushHistory={pushHistory}
                onSelect={(id) => onSelect(id)}
                askConfirm={askConfirm}
              />
            );
          }

          if (a.type === "curly-u") {
            return (
              <SelectorArrow
                key={a.id || i}
                a={a}
                index={i}
                setArrows={setArrows}
                pushHistory={pushHistory}
                onSelect={onSelect}
              />
            );
          }

          // bracket connector: render special component with separate label Rnd
          if (a.type === "bracket") {
            return (
              <BracketWithLabel
                key={a.id || `bracket-${i}`}
                a={a}
                index={i}
                arrows={arrows}
                setArrows={setArrows}
                pushHistory={pushHistory}
                onSelect={() => onSelect(i)}
                selectedArrowId={selectedId}
                askConfirm={askConfirm}
              />
            );
          }

          // Default arrow (single/double/rotatable)
          return (
            <Arrow
              key={"arrow" + i}
              a={a}
              index={i}
              setArrows={setArrows}
              pushHistory={pushHistory}
              selectedArrowId={selectedId}
              onSelect={(id) => onSelect(id)}
              askConfirm={askConfirm}
            />
          );
        })}

        {/* LABELS (editable & movable) */}
        {labels.map((l, i) => (
          <Label
            key={"label" + i}
            l={l}
            i={i}
            selectedLabelId={selectedLabelId}
            setSelectedLabelId={setSelectedLabelId}
            updateByIndex={updateByIndex}
            pushHistory={pushHistory}
            setLabels={setLabels}
            removeLabel={removeLabel}
            askConfirm={askConfirm}
          />
        ))}
      </div>

      {/* Tailwind Confirmation Modal */}
      {confirmModal.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[99999] flex items-center justify-center"
          onClick={() => closeConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-80 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Confirm Delete</h2>
            <p className="text-gray-600 mb-5">{confirmModal.message}</p>

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => closeConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600"
                onClick={() => closeConfirm(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* optional: small style for fade-in (add to your global CSS) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
      `}</style>
    </div>
  );
}

/* ---------------- Active BracketWithLabel + BracketLabelRnd ----------------
   Replace any commented / older bracket functions with these.
*/

function BracketWithLabel({ a, index, setArrows, pushHistory, onSelect, selectedArrowId, askConfirm }) {
  const isSelected = selectedArrowId === index;
  const width = Math.max(40, a.w ?? 160);
  const height = Math.max(24, a.h ?? 60);
  const thickness = a.thickness ?? 4;
  const strokeColor = a.color ?? "#302d2d";

  const update = (patch) =>
    setArrows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });

  const bracketKey = a.id || `bracket-${index}`;
  const bracketX = a.x ?? 0;
  const bracketY = a.y ?? 0;

  // delete helper using askConfirm
  const confirmDelete = (e) => {
    e.stopPropagation();
    askConfirm && askConfirm("Delete this bracket connector?", () => {
      setArrows(prev => prev.filter((_, idx) => idx !== index));
      pushHistory?.();
    });
  };

  return (
    <>
      <Rnd
        key={bracketKey}
        size={{ width, height }}
        position={{ x: bracketX, y: bracketY }}
        bounds="parent"
        enableResizing={{ top: true, bottom: true, left: true, right: true }}
        onMouseDown={(e) => { e.stopPropagation(); onSelect && onSelect(); }}
        onDragStop={(e, d) => { update({ x: d.x, y: d.y }); pushHistory?.(); }}
        onResizeStop={(e, dir, ref, delta, position) => {
          const newW = Math.max(40, parseInt(ref.style.width, 10));
          const newH = Math.max(24, parseInt(ref.style.height, 10));
          update({ x: position.x, y: position.y, w: newW, h: newH });
          pushHistory?.();
        }}
        style={{ zIndex: 75, background: "transparent", cursor: "grab", pointerEvents: "auto", overflow: "visible" }}
        onDoubleClick={confirmDelete} // confirm on double click of bracket box
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
          <line x1={0} y1={thickness / 2} x2={width} y2={thickness / 2} stroke={strokeColor} strokeWidth={thickness} strokeLinecap="square" />
          <line x1={thickness / 2} y1={thickness / 2} x2={thickness / 2} y2={height} stroke={strokeColor} strokeWidth={thickness} strokeLinecap="square" />
          <line x1={width - thickness / 2} y1={thickness / 2} x2={width - thickness / 2} y2={height} stroke={strokeColor} strokeWidth={thickness} strokeLinecap="square" />
        </svg>

        {isSelected && (
          <div style={{ position: "absolute", right: 6, bottom: 6, width: 10, height: 10, borderRadius: 2, background: "#3aa6d8", zIndex: 99, pointerEvents: "none" }} />
        )}
      </Rnd>

      <BracketLabelRnd
        key={`${bracketKey}-label`}
        a={a}
        bracketX={bracketX}
        bracketY={bracketY}
        bracketW={width}
        bracketH={height}
        index={index}
        setArrows={setArrows}
        pushHistory={pushHistory}
        isSelected={isSelected}
        askConfirm={askConfirm}
      />
    </>
  );
}

function BracketLabelRnd({ a, bracketX, bracketY, bracketW, bracketH, index, setArrows, pushHistory, isSelected, askConfirm }) {
  const labelWidth = Math.max(50, a.labelW ?? 140);
  const labelHeight = Math.max(28, a.labelH ?? 28);

  const labelPos = (typeof a.labelPos === "number") ? a.labelPos : 0.5;
  const labelRelX = Math.round(bracketW * labelPos) - Math.floor(labelWidth / 2);
  const initialX = (a.x ?? bracketX) + labelRelX;
  const initialY = (a.y ?? bracketY) + Math.max(4, (a.thickness ?? 4) + 2);

  const update = (patch) =>
    setArrows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });

  const onLabelDoubleClick = (e) => {
    e.stopPropagation();
    askConfirm && askConfirm("Delete this bracket connector?", () => {
      setArrows(prev => prev.filter((_, idx) => idx !== index));
      pushHistory?.();
    });
  };

  return (
    <Rnd
      key={`bracket-label-rnd-${index}`}
      size={{ width: labelWidth, height: labelHeight }}
      position={{ x: a.labelX ?? initialX, y: a.labelY ?? initialY }}
      bounds="parent"
      enableResizing={false}
      onDragStop={(e, d) => {
        const relX = d.x - (a.x ?? bracketX);
        const pos = Math.max(0.05, Math.min(0.95, (relX + Math.floor(labelWidth / 2)) / Math.max(1, bracketW)));
        update({ labelPos: pos, labelX: d.x, labelY: d.y });
        pushHistory?.();
      }}
      style={{ zIndex: 9999, background: "transparent", pointerEvents: "auto", overflow: "visible" }}
      onDoubleClick={onLabelDoubleClick} // double click label to trigger same confirm
    >
      <div
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        tabIndex={0}
        onMouseDown={(e) => {
          // ensure the Rnd doesn't block editing click
          e.stopPropagation();
          if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
        }}
        onFocus={(e) => {
          try {
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(e.target);
            sel.removeAllRanges();
            sel.addRange(range);
          } catch (err) { /* ignore */ }
        }}
        onBlur={(e) => {
          const text = (e.target.innerText || "").trim();
          update({ label: text });
          pushHistory?.();
        }}
        style={{
          width: "100%",
          height: "100%",
          padding: "6px 10px",
          borderRadius: 8,
          background: "#fff",
          border: isSelected ? "1px solid rgba(0,0,0,0.14)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          fontSize: 13,
          textAlign: "center",
          cursor: "text",
          color: "#111",
          userSelect: "text"
        }}
        title="Edit label (click outside to save)"
      >
        {a.label || "Click to add label"}
      </div>
    </Rnd>
  );
}


/* ---------- simple visual for arrows (unchanged) ---------- */

function RotatableArrow({ w = 120, h = 40, angle = 0, onChangeAngle }) {
  const wrapperRef = React.useRef(null);
  const onMouseDown = (e) => {
    if (!e.target.closest(".arrow-head")) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const move = (ev) => {
      const dx = ev.clientX - cx;
      const dy = ev.clientY - cy;
      const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      onChangeAngle(newAngle);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      ref={wrapperRef}
      onMouseDown={onMouseDown}
      style={{
        width: w,
        height: h,
        position: "relative",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",   // allow resizing + rotation
        cursor: "grab",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <line
          x1={0}
          y1={h / 2}
          x2={w - 12}
          y2={h / 2}
          stroke="#302d2d"
          strokeWidth="2"
        />

        <polygon
          className="arrow-head"
          points={`
            ${w},${h / 2}
            ${w - 12},${h / 2 - 8}
            ${w - 12},${h / 2 + 8}
          `}
          fill="#302d2d"
        />
      </svg>
    </div>
  );
}

function Arrow({ a, index, setArrows, pushHistory, selectedArrowId, onSelect, askConfirm }) {
  const wrapperRef = React.useRef(null);

  const updateArrow = (patch) =>
    setArrows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });

  // Rotation handler
  const onRotateMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const wrapper = wrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + 10 + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const move = (ev) => {
      const dx = ev.clientX - cx;
      const dy = ev.clientY - cy;
      const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      updateArrow({ angle: newAngle });
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      pushHistory?.();
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const isSelected = selectedArrowId === index;

  return (
    <Rnd
      ref={wrapperRef}
      size={{ width: a.w || 120, height: a.h || 24 }}
      position={{ x: a.x, y: a.y }}
      bounds="parent"
      onDragStop={(e, d) => updateArrow({ x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, position) =>
        updateArrow({
          w: parseInt(ref.style.width, 10),
          h: parseInt(ref.style.height, 10),
          x: position.x,
          y: position.y
        })
      }
      style={{
        transform: `rotate(${a.angle}deg)`,
        transformOrigin: "center center",
        cursor: "grab",
        zIndex: 70,
        overflow: "visible"
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        askConfirm("Delete this arrow?", () => {
          pushHistory?.();
          setArrows(prev => prev.filter((_, idx) => idx !== index));
        });
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>

        {/* Rotation handle - only visible if selected */}
        {isSelected && (
          <div
            onMouseDown={onRotateMouseDown}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#3aa6d8",
              position: "absolute",
              top: -20,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "grab",
              zIndex: 999,
            }}
          />
        )}

        {/* Arrow visual */}
        <div >
          {a.type === "rotatable" ? (
            <RotatableArrow
              w={a.w}
              h={a.h}
              angle={a.angle}
              onChangeAngle={(newAngle) => {
                setArrows(prev => {
                  const copy = [...prev];
                  copy[index].angle = newAngle;
                  return copy;
                });
              }}
            />
          ) : (
            <ArrowVisual type={a.type} width={a.w} offsetY={20} angle={a.angle || 0} />
          )}
        </div>

        {/* Editable Arrow Text */}
        {(() => {
          let textStyle = {
            position: "absolute",
            padding: "2px 6px",
            background: "transparent",
            border: "1px solid #ccc",
            borderRadius: 3,
            fontSize: 12,
            pointerEvents: "auto",
            zIndex: 200,
            minWidth: 40,
            textAlign: "center",
          };

          // Default (left & right): centered on arrow shaft
          let extra = {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          };

          // UP ARROW → 270 degrees
          if (a.angle === 270) {
            extra = {
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
            };
          }

          // DOWN ARROW → 90 degrees
          if (a.angle === 90) {
            extra = {
              bottom: -105,
              left: "50%",
              transform: "translateX(-50%)",
            };
          }

          return (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                pushHistory();
                updateArrow({ text: e.target.innerText });
              }}
              style={{ ...textStyle, ...extra }}
            >
              {a.text || ""}
            </div>
          );
        })()}

      </div>
    </Rnd>
  );
}

function ArrowVisual({ type = "single", width = 80, offsetY = 10, angle = 0 }) {
  const lineWidth = Math.max(20, width - 24);

  const base = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {type === "double" && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: "10px solid #423e3e",
          }}
        />
      )}

      <div style={{ height: 2, width: lineWidth, background: "#423e3e" }} />

      <div
        style={{
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderLeft: `10px solid ${type === "double" ? "#423e3e" : "#111"}`,
        }}
      />
    </div>
  );

  //Rotate the whole arrow shape
  return (
    <div
      style={{
        position: "relative",
        top: offsetY,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",
        width,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {base}
    </div>
  );
}

// --- FIXED LABEL COMPONENT ---
function Label({ l, i, updateByIndex, pushHistory, setLabels, removeLabel, askConfirm }) {
  const innerRef = React.useRef(null);

  const startRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = innerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const move = (ev) => {
      const dx = ev.clientX - cx;
      const dy = ev.clientY - cy;
      const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      setLabels((prev) => updateByIndex(prev, i, { angle: newAngle }));
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      pushHistory?.();
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <Rnd
      key={"label" + i}
      size={{ width: l.w, height: l.h }}
      position={{ x: l.x, y: l.y || 60 }}
      bounds="parent"
      onDragStop={(e, d) => {
        pushHistory();
        setLabels((prev) => updateByIndex(prev, i, { x: d.x, y: d.y }));
      }}
      onResizeStop={(e, dir, ref, delta, position) => {
        pushHistory();
        setLabels((prev) =>
          updateByIndex(prev, i, {
            w: parseInt(ref.style.width, 10),
            h: parseInt(ref.style.height, 10),
            x: position.x,
            y: position.y,
          })
        );
      }}
      style={{
        zIndex: 80,
        cursor: "grab",
      }}
    >
      {/* 🔥 Double click handler moved here to fix rotated delete problem */}
      <div
        ref={innerRef}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          askConfirm("Delete this label?", () => {
            pushHistory();
            removeLabel(i);
          });
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${l.angle || 0}deg)`,
          transformOrigin: "center center",
          position: "relative",
          userSelect: "none",
        }}
      >
        {/* Rotation handle */}
        <div
          onMouseDown={startRotate}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "transparent",
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "grab",
            zIndex: 999,
          }}
          title="Drag to rotate label"
        />

        {/* Editable text */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            pushHistory();
            setLabels((prev) =>
              updateByIndex(prev, i, { text: e.target.innerText })
            );
          }}
          style={{
            padding: 6,
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "transparent",
            minHeight: 20,
            fontSize: 14,
            textAlign: "center",
            pointerEvents: "auto",
            color: "#000",
          }}
          title="Edit text, drag to move, drag handle to rotate, double click to delete"
        >
          {l.text}
        </div>
      </div>
    </Rnd>
  );
}
