import React from "react";
import {
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import {
  ArrowLeftRight,
  ArrowUpRight,
  CornerRightUp,
  Repeat2,
  Redo2,
  SeparatorVertical,
  ToggleLeft,
  Type,
  Undo2,
  Brackets,
  LucideBrackets,
  BracesIcon,
  Repeat,
  Repeat1Icon,
  Repeat1,
} from "lucide-react";

export default function TimelineToolbar({
  onAddArrow,
  onAddCurlyUArrow,
  onAddDoubleArrow,
  onAddLabel,
  onAddSSSwitch,
  onAddDiagonalArrow,
  onAddVerticalLine,
  onAddElbowArrow,
  undo,
  redo,
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 bg-white p-4  items-center">
      {/* --- Undo / Redo --- */}
      <div className="flex gap-2">
        <button
          onClick={undo}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
        >
          <Undo2 size={16} />
          Undo
        </button>
        <button
          onClick={redo}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
        >
          <Redo2 size={16} />
          Redo
        </button>
      </div>

      {/* --- Arrows Section --- */}
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        <span className="text-xs text-gray-600 mr-2">Arrows:</span>

        <button
          onClick={() => onAddArrow("left")}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          title="Left Arrow"
        >
          <ArrowBack fontSize="small" />
        </button>
        <button
          onClick={() => onAddArrow("up")}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          title="Up Arrow"
        >
          <ArrowUpward fontSize="small" />
        </button>
        <button
          onClick={() => onAddArrow("down")}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          title="Down Arrow"
        >
          <ArrowDownward fontSize="small" />
        </button>
        <button
          onClick={() => onAddArrow("right")}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          title="Right Arrow"
        >
          <ArrowForward fontSize="small" />
        </button>
      </div>

      {/* --- Special Arrows --- */}
      <button
        onClick={onAddElbowArrow}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <Repeat size={16} />
        Elbow Arrow
      </button>

      <button
        onClick={onAddCurlyUArrow}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <BracesIcon size={16} />
        Bracket Connector
      </button>

      <button
        onClick={onAddDoubleArrow}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <ArrowLeftRight size={16} />
        Double Arrow
      </button>

      <button
        onClick={onAddDiagonalArrow}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <ArrowUpRight size={16} />
        Custom Arrow
      </button>

      {/* --- Other Tools --- */}
      <button
        onClick={onAddVerticalLine}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <SeparatorVertical size={16} />
        Vertical Line
      </button>

      <button
        onClick={onAddLabel}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <Type size={16} />
        Label
      </button>

      <button
        onClick={onAddSSSwitch}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm font-medium"
      >
        <ToggleLeft size={16} />
        Switch
      </button>
    </div>
  );
}
