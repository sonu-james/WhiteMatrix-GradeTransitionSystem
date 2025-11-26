import React from "react";

export default function SidebarEditor({ rows, selectedId, onUpdate, onDelete, onClose }) {
  const sel = rows.find(r => r.id === selectedId);
  if (!selectedId) return <div className="w-[320px] bg-white border rounded shadow p-3 text-sm text-gray-500">Select a block to edit.</div>;
  if (!sel) return <div className="w-[320px] bg-white border rounded shadow p-3 text-sm text-gray-500">(removed)</div>;

  const handleChange = (field, value) => {
    const patch = field === "gp" || field === "width" || field === "ton"
      ? { [field]: value === "" ? null : Number(value) }
      : { [field]: value };
    onUpdate(sel.id, patch);
  };

  return (
    <div className="w-[320px] bg-white border rounded shadow p-3 space-y-2 mx-auto">
      <h4 className="font-semibold mb-2">Selected Block</h4>

      {["grade", "code", "type"].map(f => (
        <div key={f}>
          <label className="text-xs text-gray-600 capitalize">{f}</label>
          <input className="w-full border px-2 py-1 rounded" value={sel[f]} onChange={e => handleChange(f, e.target.value)} />
        </div>
      ))}

      <div>
        <label className="text-xs text-gray-600">Width</label>
        <input type="number" value={sel.width} onChange={e => handleChange("width", e.target.value)} className="w-full border px-2 py-1 rounded text-right" />
      </div>

      <div>
        <label className="text-xs text-gray-600">Ton</label>
        <input type="number" value={sel.ton || ""} onChange={e => handleChange("ton", e.target.value)} className="w-full border px-2 py-1 rounded text-right" />
      </div>

      <div>
        <label className="text-xs text-gray-600">GP</label>
        <input type="number" step="0.1" value={sel.gp ?? ""} onChange={e => handleChange("gp", e.target.value)} className="w-full border px-2 py-1 rounded text-right" />
      </div>

      <div>
        <label className="text-xs text-gray-600">Color</label>
        <input type="color" value={sel.color} onChange={e => handleChange("color", e.target.value)} className="w-full h-8 border rounded" />
      </div>

      {/* New blockType selector */}
      <div>
        <label className="text-xs text-gray-600">Block Type</label>
        <select
          value={sel.blockType || "normal"}
          onChange={e => handleChange("blockType", e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="normal">Normal</option>
          <option value="increase">Increase ↗</option>
          <option value="decrease">Decrease ↘</option>
        </select>
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={() => onDelete(sel.id)} className="flex-1 bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        <button onClick={onClose} className="flex-1 border px-2 py-1 rounded">Close</button>
      </div>
    </div>
  );
}
