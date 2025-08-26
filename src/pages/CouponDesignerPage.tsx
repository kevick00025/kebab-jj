


// ...resto del codice e dichiarazione del componente CouponDesignerPage...
import React, { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
import ElementOptionsPanel from "../components/ElementOptionsPanel";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import QRCodeWithLogo from "../components/QRCodeWithLogo";
import DesignerMenu from "../components/DesignerMenu";
import { saveDesignerState } from "@/lib/canvasState";
import Guides from "../components/Guides";
import Moveable from "react-moveable";
import { FaUndo, FaRedo, FaSave, FaDownload, FaRegClone, FaImage } from "react-icons/fa";

type CanvasElement =
  | { id: string; type: 'title' | 'qr' | 'code' | 'desc'; x: number; y: number; width: number; height: number }
  | { id: string; type: 'customText'; x: number; y: number; width: number; height: number; content: string; color: string; fontSize: number; fontFamily: string }
  | { id: string; type: 'customImage'; x: number; y: number; width: number; height: number; src: string }
  | { id: string; type: 'shape'; shape: 'rect' | 'circle' | 'line'; x: number; y: number; width: number; height: number; color: string; strokeWidth?: number }
  | { id: string; type: 'icon'; icon: string; x: number; y: number; width: number; height: number; color: string };
import { FaStar, FaHeart, FaGift, FaCheck, FaSmile } from "react-icons/fa";
// Icone disponibili
const iconOptions = [
  { name: "Stella", value: "FaStar", icon: <FaStar /> },
  { name: "Cuore", value: "FaHeart", icon: <FaHeart /> },
  { name: "Regalo", value: "FaGift", icon: <FaGift /> },
  { name: "Check", value: "FaCheck", icon: <FaCheck /> },
  { name: "Smile", value: "FaSmile", icon: <FaSmile /> },
];
type CouponData = {
  id: string;
  title: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  expires_at?: string;
  status?: string;
  max_usage?: number;
  conditions?: string;
};

const defaultState = {
  title: "Titolo Coupon",
  code: "CODICE123",
  description: "Descrizione del coupon",
  canvasSize: "square",
  bgType: "color", // "color" | "gradient-preset" | "gradient-custom"
  bgColor: "#ffffff",
  bgGradientPreset: "spice-mint", // id del gradiente predefinito
  bgGradientCustom: { from: "#d7263d", to: "#2d9cdb", angle: 90 },
  fontFamily: "Montserrat",
  qrColor: "#d7263d",
  showTitle: true,
  showQR: true,
  showCode: true,
  showDescription: true,
  showDiscount: true,
  showExpiry: true,
  discount: "",
  expiry: ""
};

const CouponDesignerPage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const [state, setState] = useState<any>(defaultState);
  // Gradienti predefiniti
  const gradientPresets = [
    { id: "spice-mint", name: "Rosso → Mint", value: "linear-gradient(90deg, #d7263d 0%, #2dcdb2 100%)" },
    { id: "blue-violet", name: "Blu → Viola", value: "linear-gradient(90deg, #2d9cdb 0%, #8f5cff 100%)" },
  { id: "orange-yellow", name: "Arancio → Giallo", value: "linear-gradient(90deg, #ff9800 0%, #ffff00 100%)" },
    { id: "mint-green", name: "Mint → Verde", value: "linear-gradient(90deg, #2dcdb2 0%, #43ea7f 100%)" },
  ];
  const size = state.canvasSize === "square"
    ? { w: 500, h: 500 }
    : state.canvasSize === "A4"
      ? { w: 600, h: 350 }
      : state.canvasSize === "A5"
        ? { w: 420, h: 297 }
        : { w: 500, h: 500 };

  // Funzione per calcolare i punti di snap di un elemento
  function getSnapPoints(el: { x: number; y: number; width: number; height: number }) {
    const { x, y, width, height } = el;
    return [
      // Angoli
      { x: x, y: y }, // top-left
      { x: x + width, y: y }, // top-right
      { x: x, y: y + height }, // bottom-left
      { x: x + width, y: y + height }, // bottom-right
      // Metà lati
      { x: x + width / 2, y: y }, // top-center
      { x: x + width, y: y + height / 2 }, // right-center
      { x: x + width / 2, y: y + height }, // bottom-center
      { x: x, y: y + height / 2 }, // left-center
      // Centro
      { x: x + width / 2, y: y + height / 2 }, // center
    ];
  }

  // Linee guida principali del foglio
  const mainGuides = {
    x: [size.w / 2], // verticale centrale
    y: [size.h / 2], // orizzontale centrale
    diagonals: [
      // Da top-left a bottom-right
      { x1: 0, y1: 0, x2: size.w, y2: size.h },
      // Da top-right a bottom-left
      { x1: size.w, y1: 0, x2: 0, y2: size.h },
    ],
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [elements, setElements] = useState<CanvasElement[]>([
    // Titolo centrato in alto
    { id: "title", type: "title", x: 100, y: 32, width: 300, height: 60 },
    // QR centrato sotto il titolo
    { id: "qr", type: "qr", x: 190, y: 110, width: 120, height: 120 },
    // Codice centrato sotto il QR
    { id: "code", type: "code", x: 140, y: 240, width: 220, height: 40 },
    // Descrizione centrata sotto il codice
    { id: "desc", type: "desc", x: 60, y: 300, width: 380, height: 40 }
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] } | null>(null);
  const elementRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // Stato per linee guida di allineamento stile PowerPoint
  const [alignGuides, setAlignGuides] = useState<Array<{ x1: number, y1: number, x2: number, y2: number }>>([]);
  // Ref per input di editing testo
  const textInputRef = useRef<HTMLInputElement>(null);
  // Stato globale per gestire l'editing del testo personalizzato
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Toolbar popup posizione
  const [toolbarPos, setToolbarPos] = useState<{ left: number; top: number } | null>(null);
  // Stato per la sezione Forme espandibile
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  useEffect(() => {
    if (selected) {
      const el = elements.find(e => e.id === selected);
      if (el && el.type === 'customText' && !editingTextId && elementRefs.current[el.id]) {
        const rect = (elementRefs.current[el.id] as HTMLDivElement).getBoundingClientRect();
        setToolbarPos({
          left: rect.left + rect.width / 2,
          top: rect.top - 12,
        });
      } else {
        setToolbarPos(null);
      }
    } else {
      setToolbarPos(null);
    }
  }, [selected, editingTextId, elements]);

  useEffect(() => {
    if (editingTextId) {
      const el = elements.find(e => e.id === editingTextId);
      if (el && el.type === 'customText' && textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }
  }, [editingTextId, elements]);

  useEffect(() => {
    let cancelled = false;
    const fetchCoupon = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();
      if (cancelled) return;
      if (error) {
        setLoading(false);
        return;
      }
      if (data) {
        const coupon = data as CouponData & { design_json?: string };
        setState(s => ({
          ...s,
          title: coupon.title || s.title,
          code: coupon.code || s.code,
          description: coupon.description || s.description,
          discount: coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`,
          expiry: coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('it-IT') : s.expiry,
        }));
        if (coupon.design_json) {
          try {
            const parsed = JSON.parse(coupon.design_json);
            if (parsed.state) setState((s: any) => ({ ...s, ...parsed.state }));
            if (parsed.elements) setElements(parsed.elements);
          } catch {}
        }
      }
      setLoading(false);
    };
    fetchCoupon();
    return () => { cancelled = true; };
  }, [id]);

  // Salvataggio automatico su Supabase (debounced)
  const saveDesign = React.useCallback(
    debounce(async (id: string, state: any, elements: any[]) => {
      setSaveStatus('saving');
      setSaving(true);
      const design_json = JSON.stringify({ state, elements });
      const { error } = await supabase.from('coupons').update({ design_json }).eq('id', id);
      if (error) {
        setSaveStatus('error');
        toast({ title: 'Errore salvataggio design', description: error.message, variant: 'destructive' });
      } else {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1200);
      }
      setSaving(false);
    }, 600),
    []
  );

  useEffect(() => {
    if (!id) return;
    // Salva solo se non in caricamento
    if (!loading) {
      setSaveStatus('saving');
      saveDesign(id, state, elements);
    }
  }, [state, elements]);

  // Deseleziona se l'elemento selezionato non esiste più
  useEffect(() => {
    if (selected && !elements.find(e => e.id === selected)) {
      setSelected(null);
    }
  }, [elements, selected]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-spice-red font-bold">Caricamento coupon...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-spice-red/10 to-mint-green/10 overflow-hidden">
      {/* Sidebar sinistra fissa - restyling */}
      <aside className="w-80 min-w-[260px] max-w-[320px] bg-gradient-to-b from-white/80 to-mint-green/10 border-r border-spice-red/10 p-0 flex flex-col gap-0 shadow-2xl h-screen overflow-y-auto fixed left-0 top-0 z-20">
        {/* Header fisso con logo e titolo */}
        <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-md flex items-center gap-3 px-6 py-4 border-b border-mint-green/30 shadow-sm">
          <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 rounded-full shadow" />
          <span className="font-extrabold text-2xl text-spice-red tracking-tight drop-shadow-sm">Editor Coupon</span>
        </div>
        {/* Separatore animato */}
        <div className="h-1 w-full bg-gradient-to-r from-mint-green/0 via-mint-green/60 to-mint-green/0 animate-pulse" />
        {/* Card: Aggiungi nuovo elemento */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-4 mt-4 mb-2 border border-mint-green/30 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.015] hover:shadow-2xl">
          <h3 className="font-extrabold text-xl text-spice-red mb-2 flex items-center gap-2 tracking-tight">
            <span className="text-2xl animate-bounce">🧩</span> <span className="inline-flex items-center gap-1">Aggiungi elemento <span className='ml-1 text-xs bg-mint-green/20 text-mint-green px-2 py-0.5 rounded-full font-bold animate-pulse'>Nuovo</span></span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-mint-green/90 text-white rounded-xl shadow-md hover:bg-mint-green/100 hover:-translate-y-1 transition-all duration-150 text-base font-bold focus:outline-none focus:ring-2 focus:ring-mint-green/60"
              onClick={() => {
                const id = `text${Date.now()}`;
                setElements(els => [...els, {
                  id,
                  type: 'customText',
                  x: 60,
                  y: 60,
                  width: 180,
                  height: 32,
                  content: 'Nuovo testo',
                  color: '#222',
                  fontSize: 18,
                  fontFamily: 'Montserrat'
                }]);
              }}
            >✏️ Testo</button>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-spice-red/90 text-white rounded-xl shadow-md hover:bg-spice-red/100 hover:-translate-y-1 transition-all duration-150 text-base font-bold focus:outline-none focus:ring-2 focus:ring-spice-red/60"
              onClick={() => {
                const id = `img${Date.now()}`;
                setElements(els => [...els, {
                  id,
                  type: 'customImage',
                  x: 80,
                  y: 120,
                  width: 100,
                  height: 100,
                  src: ''
                }]);
              }}
            >🖼️ Immagine</button>
            {/* Sezione Forme espandibile - stato gestito a livello di componente */}
            <div className="col-span-2">
              <button
                className={`flex items-center justify-center w-full gap-2 px-3 py-2 bg-blue-500/90 text-white rounded-xl shadow-md hover:bg-blue-600/100 hover:-translate-y-1 transition-all duration-150 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${isShapesOpen ? 'ring-2 ring-blue-400/60' : ''}`}
                type="button"
                onClick={() => setIsShapesOpen(v => !v)}
                aria-expanded={isShapesOpen}
              >
                <span>➕</span> Forme
                <svg className={`ml-2 transition-transform duration-200 ${isShapesOpen ? 'rotate-180' : ''}`} width="18" height="18" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              </button>
              {isShapesOpen && (
                <div className="mt-2 w-full bg-white rounded-xl shadow-lg border border-blue-200 flex flex-col overflow-hidden animate-fade-in">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-700 text-base" onClick={() => {
                    const id = `rect${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'shape',
                      shape: 'rect',
                      x: 120,
                      y: 120,
                      width: 120,
                      height: 80,
                      color: '#2d9cdb',
                      // strokeWidth opzionale
                    }]);
                    setIsShapesOpen(false);
                  }}>▭ Rettangolo</button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-700 text-base" onClick={() => {
                    const id = `circle${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'shape',
                      shape: 'circle',
                      x: 180,
                      y: 180,
                      width: 80,
                      height: 80,
                      color: '#43ea7f',
                      // strokeWidth opzionale
                    }]);
                    setIsShapesOpen(false);
                  }}>⚪ Cerchio</button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 text-yellow-700 text-base" onClick={() => {
                    const id = `star${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'icon',
                      icon: 'FaStar',
                      x: 220,
                      y: 220,
                      width: 48,
                      height: 48,
                      color: '#d7263d',
                    }]);
                    setIsShapesOpen(false);
                  }}>⭐ Stella</button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-pink-50 text-pink-700 text-base" onClick={() => {
                    const id = `heart${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'icon',
                      icon: 'FaHeart',
                      x: 220,
                      y: 220,
                      width: 48,
                      height: 48,
                      color: '#d7263d',
                    }]);
                    setIsShapesOpen(false);
                  }}>❤️ Cuore</button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-purple-700 text-base" onClick={() => {
                    const id = `gift${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'icon',
                      icon: 'FaGift',
                      x: 220,
                      y: 220,
                      width: 48,
                      height: 48,
                      color: '#d7263d',
                    }]);
                    setIsShapesOpen(false);
                  }}>🎁 Regalo</button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-700 text-base" onClick={() => {
                    const id = `check${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'icon',
                      icon: 'FaCheck',
                      x: 220,
                      y: 220,
                      width: 48,
                      height: 48,
                      color: '#d7263d',
                    }]);
                    setIsShapesOpen(false);
                  }}>✔️ Check</button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 text-yellow-700 text-base" onClick={() => {
                    const id = `smile${Date.now()}`;
                    setElements(els => [...els, {
                      id,
                      type: 'icon',
                      icon: 'FaSmile',
                      x: 220,
                      y: 220,
                      width: 48,
                      height: 48,
                      color: '#d7263d',
                    }]);
                    setIsShapesOpen(false);
                  }}>😊 Smile</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Card: Font family e dimensioni foglio */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-4 border border-mint-green/20 flex flex-col gap-4 mt-2 transition-all duration-200 hover:scale-[1.01] hover:shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-mint-green"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="#2dcdb2" strokeWidth="2" strokeLinecap="round"/></svg></span>
            <span className="font-bold text-base text-spice-red">Font Titolo</span>
          </div>
          <select className="w-full border rounded-lg p-2 shadow focus:ring-2 focus:ring-spice-red/40 transition-all" value={state.fontFamily} onChange={e => setState(s => ({ ...s, fontFamily: e.target.value }))}>
            <option value="Montserrat">Montserrat</option>
            <option value="Roboto">Roboto</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
          </select>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-lg text-mint-green"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" stroke="#2dcdb2" strokeWidth="2"/></svg></span>
            <span className="font-bold text-base text-spice-red">Dimensioni foglio</span>
          </div>
          <select className="w-full border rounded-lg p-2 shadow focus:ring-2 focus:ring-spice-red/40 transition-all" value={state.canvasSize} onChange={e => setState(s => ({ ...s, canvasSize: e.target.value }))}>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="square">Quadrato</option>
          </select>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-spice-red/0 via-spice-red/40 to-spice-red/0 animate-pulse" />
        {/* Card: Personalizza Coupon */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-4 border border-mint-green/20 flex flex-col gap-4 mt-2 transition-all duration-200 hover:scale-[1.01] hover:shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-spice-red"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" fill="#d7263d"/></svg></span>
            <h2 className="font-extrabold text-lg text-spice-red tracking-wide">Personalizza Coupon</h2>
          </div>
          {/* Sfondo: colore o gradiente */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-mint-green"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="#2dcdb2" fillOpacity=".2" stroke="#2dcdb2" strokeWidth="2"/></svg></span>
              <label className="block font-semibold text-spice-red">Sfondo</label>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                className={`px-2 py-1 rounded-lg transition-all duration-150 font-bold text-sm ${state.bgType === "color" ? "bg-spice-red text-white shadow" : "bg-white text-spice-red border border-spice-red/40"}`}
                onClick={() => setState(s => ({ ...s, bgType: "color" }))}
              >Colore</button>
              <button
                className={`px-2 py-1 rounded-lg transition-all duration-150 font-bold text-sm ${state.bgType === "gradient-preset" ? "bg-spice-red text-white shadow" : "bg-white text-spice-red border border-spice-red/40"}`}
                onClick={() => setState(s => ({ ...s, bgType: "gradient-preset" }))}
              >Gradiente</button>
              <button
                className={`px-2 py-1 rounded-lg transition-all duration-150 font-bold text-sm ${state.bgType === "gradient-custom" ? "bg-spice-red text-white shadow" : "bg-white text-spice-red border border-spice-red/40"}`}
                onClick={() => setState(s => ({ ...s, bgType: "gradient-custom" }))}
              >Personalizzato</button>
            </div>
            {state.bgType === "color" && (
              <input type="color" className="w-10 h-10 p-0 border-2 border-spice-red/40 rounded-lg shadow focus:ring-2 focus:ring-spice-red/40" value={state.bgColor} onChange={e => setState(s => ({ ...s, bgColor: e.target.value }))} />
            )}
            {state.bgType === "gradient-preset" && (
              <select className="w-full border rounded-lg p-2 shadow focus:ring-2 focus:ring-spice-red/40 mt-2 transition-all" value={state.bgGradientPreset} onChange={e => setState(s => ({ ...s, bgGradientPreset: e.target.value }))}>
                {gradientPresets.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              )}
            {state.bgType === "gradient-custom" && (
              <div className="flex gap-2 items-center mt-2">
                <input type="color" value={state.bgGradientCustom.from} onChange={e => setState(s => ({ ...s, bgGradientCustom: { ...s.bgGradientCustom, from: e.target.value } }))} />
                <span>→</span>
                <input type="color" value={state.bgGradientCustom.to} onChange={e => setState(s => ({ ...s, bgGradientCustom: { ...s.bgGradientCustom, to: e.target.value } }))} />
                <input type="number" min={0} max={360} value={state.bgGradientCustom.angle} onChange={e => setState(s => ({ ...s, bgGradientCustom: { ...s.bgGradientCustom, angle: Number(e.target.value) } }))} className="w-16 border rounded p-1 ml-2" />
                <span>°</span>
              </div>
            )}
          </div>
          {/* Elementi da mostrare/togliere */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-mint-green"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#2dcdb2" fillOpacity=".2" stroke="#2dcdb2" strokeWidth="2"/></svg></span>
              <label className="block font-semibold text-spice-red">Elementi</label>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={state.showTitle} onChange={e => setState(s => ({ ...s, showTitle: e.target.checked }))} className="accent-spice-red w-4 h-4 rounded transition-all" /> <span className="text-base">Titolo</span></label>
              <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={state.showQR} onChange={e => setState(s => ({ ...s, showQR: e.target.checked }))} className="accent-spice-red w-4 h-4 rounded transition-all" /> <span className="text-base">QR Code</span></label>
              <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={state.showCode} onChange={e => setState(s => ({ ...s, showCode: e.target.checked }))} className="accent-spice-red w-4 h-4 rounded transition-all" /> <span className="text-base">Codice coupon</span></label>
              <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={state.showDescription} onChange={e => setState(s => ({ ...s, showDescription: e.target.checked }))} className="accent-spice-red w-4 h-4 rounded transition-all" /> <span className="text-base">Descrizione</span></label>
              <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={state.showDiscount} onChange={e => setState(s => ({ ...s, showDiscount: e.target.checked }))} className="accent-spice-red w-4 h-4 rounded transition-all" /> <span className="text-base">Sconto</span></label>
              <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={state.showExpiry} onChange={e => setState(s => ({ ...s, showExpiry: e.target.checked }))} className="accent-spice-red w-4 h-4 rounded transition-all" /> <span className="text-base">Scadenza</span></label>
            </div>
          </div>
          {/* Stile QR Code */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-mint-green"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#d7263d" fillOpacity=".2" stroke="#d7263d" strokeWidth="2"/></svg></span>
              <label className="block font-semibold text-spice-red">Colore QR Code</label>
            </div>
            <input type="color" className="w-10 h-10 p-0 border-2 border-spice-red/40 rounded-lg shadow focus:ring-2 focus:ring-spice-red/40" value={state.qrColor} onChange={e => setState(s => ({ ...s, qrColor: e.target.value }))} />
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-mint-green/0 via-mint-green/40 to-mint-green/0 animate-pulse" />
        {/* Card: Testo live */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-4 border border-mint-green/20 flex flex-col gap-3 mb-2 mt-2 transition-all duration-200 hover:scale-[1.01] hover:shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-spice-red"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2M7 9V7a5 5 0 1110 0v2m-1 4v2a3 3 0 11-6 0v-2" stroke="#d7263d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="font-bold text-base text-spice-red">Testo live</span>
          </div>
          <label className="block font-semibold mb-1 text-spice-red">Titolo</label>
          <input type="text" className="border rounded-lg p-2 shadow focus:ring-2 focus:ring-spice-red/40 transition-all" value={state.title} onChange={e => setState(s => ({ ...s, title: e.target.value }))} />
          <label className="block font-semibold mb-1 text-spice-red">Codice coupon</label>
          <input type="text" className="border rounded-lg p-2 shadow focus:ring-2 focus:ring-spice-red/40 transition-all" value={state.code} onChange={e => setState(s => ({ ...s, code: e.target.value }))} />
          <label className="block font-semibold mb-1 text-spice-red">Descrizione</label>
          <input type="text" className="border rounded-lg p-2 shadow focus:ring-2 focus:ring-spice-red/40 transition-all" value={state.description} onChange={e => setState(s => ({ ...s, description: e.target.value }))} />
        </div>
        {/* Footer */}
        <div className="mt-auto py-3 px-6 text-xs text-gray-500 flex items-center justify-between opacity-80">
          <span>© {new Date().getFullYear()} Kebab JJ</span>
          <a href="#" className="underline hover:text-spice-red transition-all">Guida</a>
        </div>
      </aside>
      {/* Canvas centrale sempre centrato */}
      <main
        className="flex-1 min-h-screen"
        style={{ marginLeft: '320px', position: 'relative' }}
        onClick={e => {
          // Deseleziona se clicchi su una zona vuota del canvas
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {/* Menu circolare in alto a destra */}
        <DesignerMenu
          onBeforeNext={() => {
            saveDesignerState(state, elements);
          }}
        />
        {/* Preview fissa e perfettamente centrata */}
        <div
          id="coupon-canvas-preview"
          style={{
            position: 'fixed',
            left: 'calc(50% + 160px)',
            top: '50%',
            transform: `translate(-50%, -50%)`,
            width: size.w,
            height: size.h,
            background:
              state.bgType === "color"
                ? state.bgColor
                : state.bgType === "gradient-preset"
                  ? gradientPresets.find(g => g.id === state.bgGradientPreset)?.value
                  : `linear-gradient(${state.bgGradientCustom.angle}deg, ${state.bgGradientCustom.from} 0%, ${state.bgGradientCustom.to} 100%)`,
            borderRadius: 24,
            boxShadow: 'none', // niente ombra per lo screenshot
            border: 'none', // niente bordo per lo screenshot
            overflow: 'hidden',
            zIndex: 1,
            padding: 0,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          {/* Linee guida principali (SVG) - visibili solo se snap attivo */}
          <svg width={size.w} height={size.h} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 10 }}>
            {/* Linee guida blu rimosse */}
            {/* Linea verticale centrale */}
            {guides?.x?.some(x => Math.abs(x - size.w/2) < 1) && (
              <line x1={size.w/2} y1={0} x2={size.w/2} y2={size.h} stroke="#d7263d" strokeWidth={4} strokeDasharray="8 4" opacity={0.8} />
            )}
            {/* Linea orizzontale centrale */}
            {guides?.y?.some(y => Math.abs(y - size.h/2) < 1) && (
              <line x1={0} y1={size.h/2} x2={size.w} y2={size.h/2} stroke="#d7263d" strokeWidth={4} strokeDasharray="8 4" opacity={0.8} />
            )}
            {/* Diagonale da top-left a bottom-right */}
            {guides?.x?.some(x => Math.abs(x - size.w/2) < 1) || guides?.y?.some(y => Math.abs(y - size.h/2) < 1) ? (
              <line x1={0} y1={0} x2={size.w} y2={size.h} stroke="#d7263d" strokeWidth={3} strokeDasharray="4 4" opacity={0.7} />
            ) : null}
            {/* Diagonale da top-right a bottom-left */}
            {guides?.x?.some(x => Math.abs(x - size.w/2) < 1) || guides?.y?.some(y => Math.abs(y - size.h/2) < 1) ? (
              <line x1={size.w} y1={0} x2={0} y2={size.h} stroke="#d7263d" strokeWidth={3} strokeDasharray="4 4" opacity={0.7} />
            ) : null}
          </svg>
          {/* Linee guida per il drag & drop */}
          <Guides x={guides?.x ?? []} y={guides?.y ?? []} width={size.w} height={size.h} />
          {/* Elementi canvas */}
          {elements.map(el => {
            if (!elementRefs.current[el.id]) {
              elementRefs.current[el.id] = null;
            }
            const isEditing = selected === el.id && el.type === 'customText';
            // Render forme base
            if (el.type === 'shape') {
              // Renderizza rettangolo o cerchio SVG
              return (
                <div
                  key={el.id}
                  ref={ref => { elementRefs.current[el.id] = ref; }}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: 'move',
                    zIndex: selected === el.id ? 2 : 1,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSelected(el.id)}
                >
                  <svg width={el.width} height={el.height} style={{ display: 'block' }}>
                    {el.shape === 'rect' && (
                      <rect x={0} y={0} width={el.width} height={el.height} rx={12} fill={el.color} />
                    )}
                    {el.shape === 'circle' && (
                      <ellipse cx={el.width/2} cy={el.height/2} rx={el.width/2} ry={el.height/2} fill={el.color} />
                    )}
                  </svg>
                </div>
              );
            }
            // Render icona
            if (el.type === 'icon') {
              const IconComp = {
                FaStar,
                FaHeart,
                FaGift,
                FaCheck,
                FaSmile,
              }[el.icon] || FaStar;
              return (
                <div
                  key={el.id}
                  ref={ref => { elementRefs.current[el.id] = ref; }}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: 'move',
                    zIndex: selected === el.id ? 2 : 1,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSelected(el.id)}
                >
                  <IconComp size={Math.min(el.width, el.height)} color={el.color} />
                </div>
              );
            }
            // Elemento titolo
            if (el.type === 'title') {
              return state.showTitle ? (
                <div
                  key={el.id}
                  ref={ref => { elementRefs.current[el.id] = ref; }}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: 'move',
                    zIndex: selected === el.id ? 2 : 1,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSelected(el.id)}
                >
                  <h1 style={{
                    fontSize: 32,
                    fontFamily: state.fontFamily,
                    color: state.qrColor,
                    textAlign: 'center',
                    width: '100%',
                    margin: 0,
                    wordBreak: 'break-word',
                  }}>{state.title}</h1>
                </div>
              ) : null;
            }
            // Elemento QR
            if (el.type === 'qr') {
              if (state.showQR) {
                console.log('[QR] Render QR element', {
                  code: state.code,
                  color: state.qrColor,
                  width: el.width,
                  height: el.height,
                  logo: "/src/assets/logo.png"
                });
                return (
                  <div
                    key={el.id}
                    ref={ref => { elementRefs.current[el.id] = ref; }}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      cursor: 'move',
                      zIndex: selected === el.id ? 2 : 1,
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setSelected(el.id)}
                  >
                    <QRCodeWithLogo
                      data={state.code}
                      color={state.qrColor}
                      width={el.width}
                      height={el.height}
                      logo={"/src/assets/logo.png"}
                    />
                  </div>
                );
              }
              return null;
            }
            // Elemento codice
            if (el.type === 'code') {
              return state.showCode ? (
                <div
                  key={el.id}
                  ref={ref => { elementRefs.current[el.id] = ref; }}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: 'move',
                    zIndex: selected === el.id ? 2 : 1,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSelected(el.id)}
                >
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: 20,
                    color: state.qrColor,
                    textAlign: 'center',
                    width: '100%',
                  }}>{state.code}</div>
                </div>
              ) : null;
            }
            // Elemento descrizione
            if (el.type === 'desc') {
              return state.showDescription ? (
                <div
                  key={el.id}
                  ref={ref => { elementRefs.current[el.id] = ref; }}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: 'move',
                    zIndex: selected === el.id ? 2 : 1,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSelected(el.id)}
                >
                  <div style={{
                    fontFamily: state.fontFamily,
                    fontSize: 18,
                    color: '#222',
                    textAlign: 'center',
                    width: '100%',
                  }}>{state.description}</div>
                </div>
              ) : null;
            }
            // Elemento testo personalizzato
            if (el.type === 'customText') {
              if (editingTextId === el.id) {
                return (
                  <div
                    key={el.id}
                    ref={ref => { elementRefs.current[el.id] = ref; }}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      cursor: 'move',
                      zIndex: selected === el.id ? 2 : 1,
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <input
                      ref={textInputRef}
                      type="text"
                      value={el.content}
                      style={{
                        fontFamily: el.fontFamily,
                        fontSize: el.fontSize,
                        color: el.color,
                        textAlign: 'center',
                        width: '100%',
                        background: '#ffffff',
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        padding: 4,
                        border: '1px solid #d7263d',
                      }}
                      onChange={e => setElements(els => els.map(elem => elem.id === el.id ? { ...elem, content: e.target.value } : elem))}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setEditingTextId(null); }}
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={el.id}
                    ref={ref => { elementRefs.current[el.id] = ref; }}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      cursor: 'move',
                      zIndex: selected === el.id ? 2 : 1,
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setSelected(el.id)}
                  >
                    <div
                      style={{
                        fontFamily: el.fontFamily,
                        fontSize: el.fontSize,
                        color: el.color,
                        textAlign: 'center',
                        width: '100%',
                        background: '#ffffff',
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        padding: 4,
                        cursor: 'pointer',
                      }}
                      onDoubleClick={e => {
                        e.stopPropagation();
                        if (selected === el.id) setEditingTextId(el.id);
                        else setSelected(el.id);
                      }}
                    >{el.content}</div>
                  </div>
                );
              }
            }
            // Elemento immagine personalizzata
            if (el.type === 'customImage') {
              return (
                <div
                  key={el.id}
                  ref={ref => { elementRefs.current[el.id] = ref; }}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: 'move',
                    zIndex: selected === el.id ? 2 : 1,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSelected(el.id)}
                >
                  {el.src ? (
                    <img src={el.src} alt="Immagine" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  ) : (
                    <label style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: 8, border: '1px dashed #d7263d', color: '#d7263d', cursor: 'pointer', fontSize: 14 }}>
                      Carica immagine
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setElements(els => els.map(elem => elem.id === el.id ? { ...elem, src: ev.target?.result as string } : elem));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>
              );
            }
          })}
          {/* Moveable per drag&resize */}
          {selected && elementRefs.current[selected] && (
            <Moveable
              target={elementRefs.current[selected]}
              draggable={true}
              resizable={true}
              throttleDrag={0}
              throttleResize={0}
              onDrag={({ left, top }) => {
                // SNAP MAGNETICO MIGLIORATO
                const SNAP_RADIUS = 5; // px
                const ALIGN_TOLERANCE = 2; // px
                const currentEl = elements.find(el => el.id === selected);
                if (!currentEl) return;
                const points = getSnapPoints({ x: left, y: top, width: currentEl.width, height: currentEl.height });
                const mainX = [0, size.w / 2, size.w];
                const mainY = [0, size.h / 2, size.h];
                let otherX = [];
                let otherY = [];
                const others = elements.filter(e => e.id !== selected);
                others.forEach(e => {
                  getSnapPoints(e).forEach(pt => {
                    otherX.push(pt.x);
                    otherY.push(pt.y);
                  });
                });
                // Trova il punto di snap più vicino su X e Y
                let minDistX = SNAP_RADIUS + 1, minDistY = SNAP_RADIUS + 1;
                let snapX = null, snapY = null;
                let snapLeft = left, snapTop = top;
                points.forEach(pt => {
                  [...mainX, ...otherX].forEach(gx => {
                    const dist = Math.abs(pt.x - gx);
                    if (dist < minDistX) {
                      minDistX = dist;
                      snapX = { gx, pt };
                    }
                  });
                  [...mainY, ...otherY].forEach(gy => {
                    const dist = Math.abs(pt.y - gy);
                    if (dist < minDistY) {
                      minDistY = dist;
                      snapY = { gy, pt };
                    }
                  });
                });
                // Applica snap solo se la distanza è entro il raggio
                if (snapX && minDistX <= SNAP_RADIUS) {
                  snapLeft = left + (snapX.gx - snapX.pt.x);
                }
                if (snapY && minDistY <= SNAP_RADIUS) {
                  snapTop = top + (snapY.gy - snapY.pt.y);
                }
                // Visualizza solo la linea guida del punto più vicino
                setGuides({
                  x: snapX && minDistX <= SNAP_RADIUS ? [snapLeft + (snapX.pt.x - left)] : [],
                  y: snapY && minDistY <= SNAP_RADIUS ? [snapTop + (snapY.pt.y - top)] : [],
                });
                setElements(els => els.map(el => el.id === selected ? { ...el, x: snapLeft, y: snapTop } : el));

                // LOGICA LINEE GUIDA DI ALLINEAMENTO (PowerPoint)
                // Calcola distanze tra i lati dell'elemento spostato e quelli degli altri
                const alignLines = [];
                // Lati dell'elemento spostato
                const elSides = [
                  { side: 'left', x: snapLeft, y1: snapTop, y2: snapTop + currentEl.height },
                  { side: 'right', x: snapLeft + currentEl.width, y1: snapTop, y2: snapTop + currentEl.height },
                  { side: 'top', y: snapTop, x1: snapLeft, x2: snapLeft + currentEl.width },
                  { side: 'bottom', y: snapTop + currentEl.height, x1: snapLeft, x2: snapLeft + currentEl.width },
                ];
                // Per ogni lato, cerca due elementi con la stessa distanza
                ['left', 'right'].forEach(side => {
                  const elX = side === 'left' ? snapLeft : snapLeft + currentEl.width;
                  // Trova distanze da altri elementi
                  const dists = others.map(e => {
                    const otherX = side === 'left' ? e.x : e.x + e.width;
                    return { e, dist: Math.abs(elX - otherX), elX, otherX };
                  });
                  // Cerca due distanze uguali
                  for (let i = 0; i < dists.length; i++) {
                    for (let j = i + 1; j < dists.length; j++) {
                      if (Math.abs(dists[i].dist - dists[j].dist) <= ALIGN_TOLERANCE && dists[i].dist > 0) {
                        // Mostra linea tra i lati
                        alignLines.push({
                          x1: dists[i].otherX,
                          y1: others[i].y,
                          x2: elX,
                          y2: snapTop,
                        });
                        alignLines.push({
                          x1: dists[j].otherX,
                          y1: others[j].y,
                          x2: elX,
                          y2: snapTop,
                        });
                      }
                    }
                  }
                });
                ['top', 'bottom'].forEach(side => {
                  const elY = side === 'top' ? snapTop : snapTop + currentEl.height;
                  const dists = others.map(e => {
                    const otherY = side === 'top' ? e.y : e.y + e.height;
                    return { e, dist: Math.abs(elY - otherY), elY, otherY };
                  });
                  for (let i = 0; i < dists.length; i++) {
                    for (let j = i + 1; j < dists.length; j++) {
                      if (Math.abs(dists[i].dist - dists[j].dist) <= ALIGN_TOLERANCE && dists[i].dist > 0) {
                        alignLines.push({
                          x1: others[i].x,
                          y1: dists[i].otherY,
                          x2: snapLeft,
                          y2: elY,
                        });
                        alignLines.push({
                          x1: others[j].x,
                          y1: dists[j].otherY,
                          x2: snapLeft,
                          y2: elY,
                        });
                      }
                    }
                  }
                });
                setAlignGuides(alignLines);
              }}
              onDragEnd={() => setGuides(null)}
              onResize={({ width, height }) => {
                setElements(els => els.map(el => el.id === selected ? { ...el, width, height } : el));
              }}
              keepRatio={false}
              edge={false}
              origin={false}
              padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
            />
          )}
          {/* Sconto e scadenza fissi in basso */}
          <div style={{ position: 'absolute', left: 32, bottom: 24, width: size.w - 64, display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
            {state.showDiscount && <div><strong>Sconto:</strong> {state.discount}</div>}
            {state.showExpiry && <div><strong>Scadenza:</strong> {state.expiry}</div>}
          </div>
        </div>
      {/* Toolbar popup per personalizzazione testo */}
      {selected && toolbarPos && (() => {
        const el = elements.find(e => e.id === selected);
        if (el && el.type === 'customText' && !editingTextId) {
          return (
            <div
              style={{
                position: 'fixed',
                left: toolbarPos.left,
                top: toolbarPos.top,
                transform: 'translate(-50%, -100%)',
                background: '#ffffff',
                borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                padding: '8px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                zIndex: 100,
                border: '1px solid #d7263d22',
              }}
            >
              {/* Colore testo */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16 }}>🎨</span>
                <input
                  type="color"
                  value={el.color}
                  onChange={e => setElements(els => els.map(elem => elem.id === el.id ? { ...elem, color: e.target.value } : elem))}
                />
              </label>
              {/* Grandezza testo */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16 }}>A</span>
                <input
                  type="number"
                  min={8}
                  max={64}
                  value={el.fontSize}
                  onChange={e => setElements(els => els.map(elem => elem.id === el.id ? { ...elem, fontSize: Number(e.target.value) } : elem))}
                  style={{ width: 48, borderRadius: 4, border: '1px solid #ccc', padding: 2 }}
                />
              </label>
              {/* Font family */}
              <select
                value={el.fontFamily}
                onChange={e => setElements(els => els.map(elem => elem.id === el.id ? { ...elem, fontFamily: e.target.value } : elem))}
                style={{ borderRadius: 4, border: '1px solid #ccc', padding: 2 }}
              >
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
          );
        }
        return null;
      })()}

      {/* Pannello opzioni contestuali per elemento selezionato */}
      {/* Mostra il pannello opzioni per icone e forme (rettangolo, cerchio) */}
      <ElementOptionsPanel
        element={selected ? elements.find(e => e.id === selected && (e.type === 'icon' || e.type === 'shape')) : null}
        onDelete={() => {
          setElements(els => {
            const newEls = els.filter(e => e.id !== selected);
            if (!newEls.find(e => e.id === selected)) setSelected(null);
            return newEls;
          });
        }}
        onChange={changes => setElements(els => els.map(e => e.id === selected ? { ...e, ...changes } : e))}
        iconOptions={iconOptions}
      />
      </main>
      {/* Feedback salvataggio automatico */}
      <div className="fixed bottom-6 right-6 z-50">
        {saveStatus === 'saving' && <div className="px-4 py-2 bg-yellow-200 text-yellow-900 rounded shadow font-semibold animate-pulse">Salvataggio in corso...</div>}
        {saveStatus === 'saved' && <div className="px-4 py-2 bg-mint-green text-white rounded shadow font-semibold">Salvato!</div>}
        {saveStatus === 'error' && <div className="px-4 py-2 bg-destructive text-white rounded shadow font-semibold">Errore salvataggio</div>}
      </div>
    </div>
  );
};

export default CouponDesignerPage;
