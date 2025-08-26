import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
// import { saveCanvasImage } from "@/lib/canvasImage";

type DesignerMenuProps = {
  onBeforeNext?: () => void;
};
const DesignerMenu: React.FC<DesignerMenuProps> = ({ onBeforeNext }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
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
          <button
            className="flex items-center justify-center gap-2 bg-spice-red text-white hover:bg-spice-red/90 px-4 py-2 rounded font-bold text-lg transition"
            onClick={() => {
              if (onBeforeNext) onBeforeNext();
              if (params.id) {
                navigate(`/coupon/${params.id}`);
              } else {
                navigate('/dashboard');
              }
            }}
          >
            Avanti
          </button>
        </div>
      )}
    </div>
  );
};

export default DesignerMenu;
