import React, { useState } from "react";
import { FaEllipsisV, FaUndo, FaRedo, FaSave, FaDownload, FaRegClone } from "react-icons/fa";

const DesignerMenu: React.FC<{
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onTemplate?: () => void;
}> = ({ onUndo, onRedo, onSave, onDownload, onTemplate }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "absolute", top: 24, right: 32, zIndex: 50 }}>
      <button
        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-spice-red hover:bg-spice-red/10 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu designer"
      >
        <FaEllipsisV size={24} className="text-spice-red" />
      </button>
      {open && (
        <div className="mt-2 bg-white rounded-xl shadow-xl border border-spice-red/30 p-4 flex flex-col gap-3 min-w-[180px] animate-fade-in" style={{ position: "absolute", right: 0 }}>
          <button className="flex items-center gap-2 text-spice-red hover:bg-spice-red/10 px-3 py-2 rounded font-bold" onClick={onUndo}><FaUndo /> Annulla</button>
          <button className="flex items-center gap-2 text-spice-red hover:bg-spice-red/10 px-3 py-2 rounded font-bold" onClick={onRedo}><FaRedo /> Ripristina</button>
          <button className="flex items-center gap-2 text-mint-green hover:bg-mint-green/10 px-3 py-2 rounded font-bold" onClick={onSave}><FaSave /> Salva</button>
          <button className="flex items-center gap-2 text-spice-red hover:bg-spice-red/10 px-3 py-2 rounded font-bold" onClick={onDownload}><FaDownload /> Scarica</button>
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded font-bold" onClick={onTemplate}><FaRegClone /> Template</button>
        </div>
      )}
    </div>
  );
};

export default DesignerMenu;
