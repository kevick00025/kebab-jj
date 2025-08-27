import React from "react";
import { FaTrash, FaPalette, FaFont, FaImage } from "react-icons/fa";

// Tipi base, da adattare secondo la struttura degli elementi
interface ElementBase {
  id: string;
  type: string;
  [key: string]: any;
}

interface IconOption {
  name: string;
  value: string;
  icon: React.ReactNode;
}

interface Props {
  element: ElementBase | null;
  onDelete: () => void;
  onChange: (changes: any) => void;
  iconOptions: IconOption[];
  mobile?: boolean;
}

const ElementOptionsPanel: React.FC<Props> = ({ element, onDelete, onChange, iconOptions, mobile }) => {
  if (!element) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-6 py-4 flex gap-4 items-center z-50 border border-red-400"
      style={{ minWidth: 320, maxWidth: 480, justifyContent: 'center', left: '50%', transform: 'translate(-50%, 0)' }}
    >
      <button onClick={onDelete} className="text-red-500 hover:bg-red-100 rounded-full p-2" title="Elimina">
        <FaTrash size={20} />
      </button>
      {/* Opzioni per testo */}
      {element.type === "customText" && (
        <>
          <label className="flex items-center gap-2">
            <FaPalette />
            <input
              type="color"
              value={element.color || "#000000"}
              onChange={e => onChange({ color: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2">
            <FaFont />
            <input
              type="number"
              min={8}
              max={64}
              value={element.fontSize || 16}
              onChange={e => onChange({ fontSize: Number(e.target.value) })}
              className="w-16 border rounded p-1"
            />
          </label>
          <select
            value={element.fontFamily || "Montserrat"}
            onChange={e => onChange({ fontFamily: e.target.value })}
            className="border rounded p-1"
          >
            <option value="Montserrat">Montserrat</option>
            <option value="Roboto">Roboto</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
          </select>
        </>
      )}
      {/* Opzioni per icona */}
      {element.type === "icon" && (
        <>
          <label className="flex items-center gap-2">
            <FaPalette />
            <input
              type="color"
              value={element.color || "#000000"}
              onChange={e => onChange({ color: e.target.value })}
            />
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg">Icona:</span>
            <select
              value={element.icon || iconOptions[0]?.value}
              onChange={e => onChange({ icon: e.target.value })}
              className="border rounded p-1"
              style={{ fontFamily: 'inherit', fontSize: 18 }}
            >
              {iconOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.name}
                </option>
              ))}
            </select>
            {/* Anteprima icona selezionata */}
            <span className="ml-2">
              {iconOptions.find(opt => opt.value === (element.icon || iconOptions[0]?.value))?.icon}
            </span>
          </div>
        </>
      )}
      {/* Opzioni per immagine */}
      {element.type === "customImage" && (
        <>
          <label className="flex items-center gap-2">
            <FaImage />
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => onChange({ src: ev.target?.result as string });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </>
      )}
    </div>
  );
};

export default ElementOptionsPanel;
