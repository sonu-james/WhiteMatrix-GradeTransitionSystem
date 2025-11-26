import React, { useEffect, useMemo, useRef, useState } from "react";
import TopControls from "./TopControls";
import GradeTable from "./GradeTable";
import TimelineCanvas from "./TimeLineCanvas";
import SidebarEditor from "./SidebarEditor";
import TimelineToolbar from "./TimelineToolbar";
import { exportExcel, exportTimelinePDF, exportTimelinePPT } from "../utils/exportUtils";
import { FaFilePdf, FaFileExcel, FaFilePowerpoint } from "react-icons/fa";

const LOCAL_KEY = "grade-timeline-v2";
const SCALE = 1;

const demoInitial = [
  { id: 1, grade: "A", code: "GT1", type: "Quality2", width: 220, color: "#2B86D6", ton: 20, gp: 8.5, blockType: "normal" },
  { id: 2, grade: "B", code: "—", type: "Quality1", width: 220, color: "#F2C94C", ton: 0, gp: null, blockType: "increase" },
  { id: 3, grade: "C", code: "GT2", type: "Quality3", width: 220, color: "#E74C3C", ton: 0, gp: null, blockType: "decrease" },
  { id: 4, grade: "D", code: "GT3", type: "—", width: 220, color: "#9AA0A6", ton: 0, gp: null, blockType: "normal" },
  { id: 5, grade: "E", code: "GT4", type: "Quality4", width: 220, color: "#27AE60", ton: 300, gp: 16.7, blockType: "increase" },
];

export default function GradeTimelineEditor() {
  const canvasRef = useRef(null);

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : demoInitial;
  });

  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [labels, setLabels] = useState([]);
  const [verticalLines, setVerticalLines] = useState([]);
  const [customMarkers, setCustomMarkers] = useState([]);
  const [placingDiagonal, setPlacingDiagonal] = useState(null);

  // === Undo/Redo system ===
  const pushHistory = () => {
    setHistory((h) =>
      [
        ...h,
        {
          rows: structuredClone(rows),
          arrows: structuredClone(arrows),
          labels: structuredClone(labels),
          customMarkers: structuredClone(customMarkers),
          verticalLines: structuredClone(verticalLines),
        },
      ].slice(-50)
    );
    setFuture([]);
  };

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setFuture((f) => [
        {
          rows: structuredClone(rows),
          arrows: structuredClone(arrows),
          labels: structuredClone(labels),
          customMarkers: structuredClone(customMarkers),
          verticalLines: structuredClone(verticalLines),
        },
        ...f,
      ]);
      setRows(last.rows);
      setArrows(last.arrows);
      setLabels(last.labels);
      setCustomMarkers(last.customMarkers);
      setVerticalLines(last.verticalLines);
      return h.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [
        ...h,
        {
          rows: structuredClone(rows),
          arrows: structuredClone(arrows),
          labels: structuredClone(labels),
          customMarkers: structuredClone(customMarkers),
          verticalLines: structuredClone(verticalLines),
        },
      ]);
      setRows(next.rows);
      setArrows(next.arrows);
      setLabels(next.labels);
      setCustomMarkers(next.customMarkers);
      setVerticalLines(next.verticalLines);
      return f.slice(1);
    });
  };

  useEffect(() => localStorage.setItem(LOCAL_KEY, JSON.stringify(rows)), [rows]);

  // Compute positions
  const positioned = useMemo(() => {
    let left = 0;
    return rows.map((r) => {
      const pxWidth = Math.max(20, Math.round(r.width * SCALE));
      const item = { ...r, left, pxWidth };
      left += pxWidth;
      return item;
    });
  }, [rows]);

  const updateRow = (id, patch, push = true) => {
    if (push) pushHistory();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelectedId(id);
  };

  const addRow = (insertAfterIndex = null) => {
    pushHistory();

    const newRow = {
      id: Date.now(),
      grade: "New",
      code: "",
      type: "",
      width: 100,
      color: "#60a5fa",
      ton: 0,
      gp: null,
      blockType: "normal",
    };

    setRows((prev) => {
      if (insertAfterIndex === null) return [...prev, newRow]; // normal add
      const updated = [...prev];
      updated.splice(insertAfterIndex + 1, 0, newRow); // insert in between
      return updated;
    });

    setSelectedId(newRow.id);
  };

  const deleteRow = (id) => {
    pushHistory();
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedId(null);
  };

  const handleResize = (id, newWidth) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, width: newWidth } : r)));
  };

  const handleReorder = (newOrder) => {
    setRows(newOrder);
  };

  const resetDemo = () => {
    pushHistory();
    setRows(demoInitial);
  };

  const handleAddElbowArrow = () => {
    pushHistory();
    setArrows((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "elbow",
        x: 150,
        y: 150,
        w: 120,
        h: 40,
        color: "#111",
      },
    ]);
  };
  const handleAddCurlyUArrow = () => {
    pushHistory();
    setArrows((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "curly-u",
        x: 150,
        y: 150,
        w: 160,
        h: 30,
        color: "#111",
      },
    ]);
  };

  // === RENDER ===
  return (
    <div className="p-2 md:p-6 bg-gray-50">
     <div className="flex flex-wrap justify-between items-center p-3 bg-white rounded shadow mb-3">

  {/* Left controls */}
  <TopControls
    undo={undo}
    redo={redo}
    resetDemo={resetDemo}
    addRow={addRow}
  />

  {/* Export buttons */}
  <div className="flex gap-2 items-center mt-2 md:mt-0">
    <button
      onClick={() => exportTimelinePDF(canvasRef)}
      className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
    >
      <FaFilePdf className="text-lg" />
      Export PDF
    </button>

    <button
      onClick={() => exportExcel(rows)}
      className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      <FaFileExcel className="text-lg" />
      Export Excel
    </button>

    <button
      onClick={() => exportTimelinePPT(canvasRef)}
      className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
    >
      <FaFilePowerpoint className="text-lg" />
      Export PPT
    </button>
  </div>

</div>


      <GradeTable
        rows={rows}
        selectedId={selectedId}
        onEdit={updateRow}
        onSelect={setSelectedId}
        onDelete={deleteRow}
        addRow={addRow}
      />

      <TimelineToolbar
        onAddArrow={(direction) => {
          pushHistory();
          const directionAngles = { right: 0, down: 90, left: 180, up: 270 };
          const newArrow = {
            id: Date.now(),
            type: "single",
            x: 200,
            y: 180,
            w: 120,
            h: 34,
            angle: directionAngles[direction] ?? 0,
            text: `${direction?.toUpperCase() || "Arrow"} Arrow`,
          };
          setArrows((prev) => [...prev, newArrow]);
        }}
        onAddDoubleArrow={() => {
          setArrows((prev) => [
            ...prev,
            { type: "double", x: 200, y: 200, w: 140, h: 24, angle: 0, text: "Double Arrow" },
          ]);
        }}
        onAddElbowArrow={handleAddElbowArrow}
        onAddCurlyUArrow={handleAddCurlyUArrow}
        onAddDiagonalArrow={() => setPlacingDiagonal("waiting-start")}
        onAddVerticalLine={() => {
          pushHistory();
          setVerticalLines((p) => [...p, { id: Date.now(), x: 250 }]);
        }}
        onAddLabel={() => {
          pushHistory();
          setLabels((p) => [...p, { x: 150, y: 60, text: "New Label", w: 120, h: 28 , angle: 0 }]);
        }}
        onAddSSSwitch={() => {
          pushHistory();
          setCustomMarkers((p) => [...p, { x: 300 }]);
        }}
        undo={undo}
        redo={redo}
      />

      {/* bigger canvas container now */}
      <div
        ref={canvasRef}
        className="w-full h-[55vh] md:h-[600px] relative bg-white rounded shadow"
      >
        <TimelineCanvas
          positioned={positioned}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onResize={handleResize}
          onReorder={handleReorder}
          containerRef={canvasRef}
          arrows={arrows}
          setArrows={setArrows}
          labels={labels}
          setLabels={setLabels}
          customMarkers={customMarkers}
          setCustomMarkers={setCustomMarkers}
          verticalLines={verticalLines}
          setVerticalLines={setVerticalLines}
          pushHistory={pushHistory}
          placingDiagonal={placingDiagonal}
          setPlacingDiagonal={setPlacingDiagonal}
        />
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative bg-white w-11/12 md:w-96 rounded-l-lg shadow-lg p-4 z-50 max-h-[90vh] overflow-auto">
            <SidebarEditor
              rows={rows}
              selectedId={selectedId}
              onUpdate={updateRow}
              onDelete={deleteRow}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
