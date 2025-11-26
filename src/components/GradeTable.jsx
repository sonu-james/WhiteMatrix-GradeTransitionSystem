import React, { useState } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

export default function GradeTable({
  rows,
  selectedId,
  onEdit,
  onSelect,
  onDelete,
  addRow,
}) {
  const [gpLabel, setGpLabel] = useState("GP");
  const [editingRowId, setEditingRowId] = useState(null); // 🔥 track inline edit row

  const handleChange = (id, field, value) => {
    const patch =
      field === "width" || field === "ton" || field === "gp"
        ? { [field]: Number(value) || 0 }
        : { [field]: value };

    onEdit(id, patch, true); // inline edit only
  };
  const isEditable = (id) => editingRowId === id;

  return (
    <div className="bg-white border  p-6 mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="font-semibold text-gray-800 text-lg">Grade Input Table</h3>

        <div className="flex items-center gap-3">
          <div className="rounded-md overflow-hidden border bg-white">
            <select
              value={gpLabel}
              onChange={(e) => setGpLabel(e.target.value)}
              className="text-xs px-3 py-1 border-none bg-transparent focus:outline-none"
              aria-label="GP label"
            >
              <option value="GP">GP</option>
              <option value="Profit %">Profit %</option>
              <option value="Margin">Margin</option>
              <option value="Yield">Yield</option>
            </select>
          </div>

        <button
  onClick={() => { setEditingRowId(null); addRow(null); }}
  className="
    flex items-center gap-1 
    text-green-600 text-sm font-medium 
    border border-green-500 
    px-3 py-1 rounded 
    bg-white 
    hover:bg-green-50 
    active:bg-green-100 
    transition
  "
>
  <FiPlus size={16} />
  Add
</button>

        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {[
                "#",
                "Grade",
                "Code / Spec",
                "Type",
                "Width",
                "Color",
                "Ton",
                gpLabel,
                "BlockType",
                "Action",
              ].map((h) => (
                <th key={h} className="border-b p-3 text-center text-sm font-medium text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                className={`${editingRowId === r.id ? "bg-blue-50" : "bg-white"} even:bg-white odd:bg-white`}
              >
                <td className="border p-2 text-center w-10 text-xs">{i + 1}</td>

                {/* Editable or Read-only Inputs */}
                <td className="border p-2">
                  <input
                    value={r.grade ?? ""}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "grade", e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-transparent disabled:opacity-90"
                  />
                </td>

                <td className="border p-2">
                  <input
                    value={r.code ?? ""}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "code", e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-transparent disabled:opacity-90"
                  />
                </td>

                <td className="border p-2">
                  <input
                    value={r.type ?? ""}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "type", e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-transparent disabled:opacity-90"
                  />
                </td>

                <td className="border p-2 w-[100px]">
                  <input
                    type="number"
                    value={r.width ?? ""}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "width", e.target.value)}
                    className="w-full px-2 py-1 text-sm text-right bg-transparent disabled:opacity-90"
                  />
                </td>

                <td className="border p-2 w-[86px]">
                  <input
                    type="color"
                    value={r.color ?? "#60a5fa"}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "color", e.target.value)}
                    className="w-full h-8 p-0 border rounded disabled:opacity-60"
                  />
                </td>

                <td className="border p-2 w-[90px]">
                  <input
                    type="number"
                    value={r.ton ?? ""}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "ton", e.target.value)}
                    className="w-full px-2 py-1 text-sm text-right bg-transparent disabled:opacity-90"
                  />
                </td>

                <td className="border p-2 w-[90px]">
                  <input
                    type="number"
                    step="0.1"
                    value={r.gp ?? ""}
                    disabled={!isEditable(r.id)}
                    onChange={(e) => handleChange(r.id, "gp", e.target.value)}
                    className="w-full px-2 py-1 text-sm text-right bg-transparent disabled:opacity-90"
                    placeholder={gpLabel}
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={r.blockType || "normal"}
                    disabled={!isEditable(r.id)}
                    onChange={(e) =>
                      handleChange(r.id, "blockType", e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm bg-transparent disabled:opacity-90"
                  >
                    <option value="normal">Normal</option>
                    <option value="increase">Increase ↗</option>
                    <option value="decrease">Decrease ↘</option>
                  </select>
                </td>

                {/* Action Column */}
                <td className="p-2 text-center w-36">
                  <div className="flex items-center justify-center gap-2">
                    {/* Edit / Save Toggle */}
                    {editingRowId === r.id ? (
                      <button
                        onClick={() => setEditingRowId(null)}
                        className="px-2 py-1 rounded-md text-green-700 hover:bg-green-50 text-sm"
                        title="Save"
                      >
                        ✔
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingRowId(r.id)}
                        className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(r.id)}
                      className="p-2 rounded-md text-red-600 hover:bg-red-50"
                      title="Delete Row"
                    >
                      <FiTrash2 size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingRowId(null);
                        addRow(i);
                      }}
                      className="p-2 rounded-md text-green-600 hover:bg-green-50"
                      title="Add Row Below"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
