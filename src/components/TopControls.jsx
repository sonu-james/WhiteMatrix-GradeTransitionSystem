import React from "react";

export default function TopControls({ undo, redo, resetDemo, addRow }) {
  return (
    <div
      className="
        flex flex-wrap items-center gap-2
        p-5 border border-gray-300  bg-gray-50 
      "
    >
      {/* Buttons */}
      <div className="flex flex-wrap gap-2">

        <button
          onClick={resetDemo}
          className="
    flex items-center gap-2 px-3 py-1
    border border-green-500 text-green-600
    bg-white rounded-lg font-medium
    hover:bg-green-50 active:bg-green-100
    transition-all duration-200
    shadow-sm active:scale-95
  "
        >
          Reset Demo
        </button>

        <button
          onClick={() => addRow(null)}
          className="
    flex items-center gap-2 px-3 py-1
    border border-blue-600 text-blue-600
    bg-white rounded-lg font-medium
    hover:bg-blue-600 hover:text-white
    active:bg-blue-700
    transition-all duration-200
    shadow-sm active:scale-95
  "
        >
          + Add Row
        </button>

      </div>

      {/* Info text */}
      <div
        className="
          text-sm text-gray-600 ml-auto
          w-full md:w-auto
          mt-2 md:mt-0
        "
      >
        Blocks are touch-aligned — resize or reorder to adjust timeline
      </div>
    </div>
  );
}
