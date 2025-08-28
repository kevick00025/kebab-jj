import React, { useState } from "react";
import html2canvas from "html2canvas";
import QRCodeWithLogo from "../components/QRCodeWithLogo";
import { FaStar, FaHeart, FaGift, FaCheck, FaSmile } from "react-icons/fa";

// Preview read-only del canvas, identica al designer
export default function PreviewCanvas({ state, elements, size }: { state: any, elements: any[], size: { w: number, h: number } }) {
  const gradientPresets = [
    { id: "spice-mint", value: "linear-gradient(90deg, #d7263d 0%, #2dcdb2 100%)" },
    { id: "blue-violet", value: "linear-gradient(90deg, #2d9cdb 0%, #8f5cff 100%)" },
    { id: "orange-yellow", value: "linear-gradient(90deg, #ff9800 0%, #ffff00 100%)" },
    { id: "mint-green", value: "linear-gradient(90deg, #2dcdb2 0%, #43ea7f 100%)" },
  ];
  // Responsive: su mobile la preview occupa tutto, su desktop resta centrata e fissa
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const dynamicSize = state.canvasSize === 'smartphone'
    ? isMobile
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 360, h: 740 }
    : size;
  const [instaImg, setInstaImg] = useState<string|null>(null);
  const [showInstaModal, setShowInstaModal] = useState(false);

  const handleInstagramStory = async () => {
    const node = document.getElementById("preview-canvas-sheet");
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: null, useCORS: true, scale: 2 });
    const url = canvas.toDataURL("image/png");
    setInstaImg(url);
    setShowInstaModal(true);
  };

  return (
    <div className="w-full flex flex-col items-center px-0 sm:px-0 gap-6">
      <div
        id="preview-canvas-sheet"
        className="relative"
        style={{
          width: isMobile && state.canvasSize === 'smartphone' ? '100vw' : dynamicSize.w,
          maxWidth: isMobile && state.canvasSize === 'smartphone' ? '100vw' : dynamicSize.w,
          aspectRatio: `${dynamicSize.w} / ${dynamicSize.h}`,
          background:
            state.bgType === "color"
              ? state.bgColor
              : state.bgType === "gradient-preset"
                ? gradientPresets.find(g => g.id === state.bgGradientPreset)?.value
                : `linear-gradient(${state.bgGradientCustom.angle}deg, ${state.bgGradientCustom.from} 0%, ${state.bgGradientCustom.to} 100%)`,
          borderRadius: isMobile && state.canvasSize === 'smartphone' ? 0 : 24,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isMobile && state.canvasSize === 'smartphone' ? 'none' : '0 4px 32px 0 rgba(45,205,178,0.08)',
          minHeight: isMobile && state.canvasSize === 'smartphone' ? '100dvh' : dynamicSize.h * 0.6,
          height: isMobile && state.canvasSize === 'smartphone' ? '100dvh' : undefined,
          touchAction: 'pan-x pan-y',
        }}
      >
 </div>
  );

  {elements.map(el => {
        if (el.type === 'shape') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
        if (el.type === 'icon') {
          const IconComp = { FaStar, FaHeart, FaGift, FaCheck, FaSmile }[el.icon] || FaStar;
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComp size={Math.min(el.width, el.height)} color={el.color} />
            </div>
          );
        }
        if (el.type === 'title' && state.showTitle) {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
          );
        }
        if (el.type === 'qr' && state.showQR) {
          // Il QR code ora contiene il link di riscatto
          const redeemUrl = `${window.location.origin}/riscatta/${state.id}`;
          // Ingrandisci il QR code nella preview e centrato
          const qrSize = Math.max(Math.round((size.w || 360) * 0.4), 140);
          const centerLeft = ((size.w || 360) - qrSize) / 2;
          const centerTop = ((size.h || 740) - qrSize) / 2;
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: centerLeft,
                top: centerTop,
                width: qrSize,
                height: qrSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <QRCodeWithLogo
                data={redeemUrl}
                color={state.qrColor}
                width={qrSize}
                height={qrSize}
                logo={"/logo.png"}
              />
            </div>
          );
        }
        if (el.type === 'code' && state.showCode) {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                fontFamily: 'monospace',
                fontSize: 20,
                color: state.qrColor,
                textAlign: 'center',
                width: '100%',
              }}>{state.code}</div>
            </div>
          );
        }
        if (el.type === 'desc' && state.showDescription) {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                fontFamily: state.fontFamily,
                fontSize: 18,
                color: '#222',
                textAlign: 'center',
                width: '100%',
              }}>{state.description}</div>
            </div>
          );
        }
        if (el.type === 'customText') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
                }}
              >{el.content}</div>
            </div>
          );
        }
        if (el.type === 'customImage') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {el.src ? (
                <img src={el.src} alt="Immagine" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
              ) : null}
            </div>
          );
        }
        return null;
      })}
      {/* Sconto e scadenza fissi in basso, padding ridotto su mobile */}
      <div
        style={{
          position: 'absolute',
          left: '4vw',
          right: '4vw',
          bottom: '3vw',
          width: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'clamp(13px,2.5vw,16px)',
          gap: 8,
        }}
      >
        {state.showDiscount && <div><strong>Sconto:</strong> {state.discount}</div>}
        {state.showExpiry && <div><strong>Scadenza:</strong> {state.expiry}</div>}
      </div>
      {/* Bottone Instagram Story */}
      <button
        className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold shadow-lg hover:scale-105 transition-transform"
        onClick={handleInstagramStory}
      >
        Aggiungi a Instagram Story
      </button>

      {/* Modal Instagram Story */}
      {showInstaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 max-w-[95vw] w-full max-w-md flex flex-col items-center relative">
            <button className="absolute top-2 right-2 text-xl" onClick={() => setShowInstaModal(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">Condividi su Instagram Story</h2>
            {instaImg && (
              <img src={instaImg} alt="Anteprima coupon" className="w-full rounded-lg mb-4 border shadow" />
            )}
            <ol className="text-sm mb-3 list-decimal pl-4 text-left">
              <li>Salva l'immagine sul tuo dispositivo (tieni premuto o clicca destro sull'immagine).</li>
              <li>Apri Instagram e crea una nuova storia.</li>
              <li>Seleziona l'immagine appena salvata come sfondo della storia.</li>
            </ol>
            <a
              href={instaImg || '#'}
              download="coupon-instagram.png"
              className="inline-block px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 font-semibold mb-2"
            >
              Scarica immagine
            </a>
            <button
              className="inline-block px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
              onClick={() => {
                setShowInstaModal(false);
                setInstaImg(null);
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
