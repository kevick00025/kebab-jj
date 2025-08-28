import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeCanvas } from "qrcode.react";
import { getDesignerState, clearDesignerState } from "@/lib/canvasState";
import PreviewCanvas from "./PreviewCanvas";
import html2canvas from "html2canvas";


const CouponPreview: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [designerData, setDesignerData] = useState<any | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [instaImg, setInstaImg] = useState<string|null>(null);
  const [showInstaModal, setShowInstaModal] = useState(false);

  const handleInstagramStory = async () => {
    const node = document.getElementById(designerData ? "preview-canvas-sheet" : "coupon-sheet");
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: null, useCORS: true, scale: 2 });
    const url = canvas.toDataURL("image/png");
    setInstaImg(url);
    setShowInstaModal(true);
  };

  useEffect(() => {
    // Se esiste stato designer, usalo per la preview custom
    const data = getDesignerState();
    if (data && data.state && data.elements) {
      setDesignerData(data);
      setLoading(false);
      return;
    }
    // Altrimenti carica i dati coupon classici (fallback)
    const fetchCoupon = async () => {
      setLoading(true);
      // @ts-ignore
      const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single();
      if (error) {
        setCoupon(null);
      } else {
        setCoupon(data);
      }
      setLoading(false);
    };
    if (id) fetchCoupon();
  }, [id]);

  const handleDownload = async () => {
    if (designerData) {
      const node = document.getElementById("preview-canvas-sheet");
      if (!node) return;
      const canvas = await html2canvas(node, { backgroundColor: null, useCORS: true, scale: 2 });
      const url = canvas.toDataURL("image/png");
      setDownloadUrl(url);
      const link = document.createElement("a");
      link.download = `coupon-preview.png`;
      link.href = url;
      link.click();
      clearDesignerState();
    } else if (coupon) {
      // fallback: screenshot del card classico
      const node = document.getElementById("coupon-sheet");
      if (!node) return;
      const canvas = await html2canvas(node, { backgroundColor: null, useCORS: true, scale: 2 });
      const url = canvas.toDataURL("image/png");
      setDownloadUrl(url);
      const link = document.createElement("a");
      link.download = `coupon-preview.png`;
      link.href = url;
      link.click();
    }
  };

  if (loading) return <div>Caricamento...</div>;
  if (!designerData && !coupon) return <div>Coupon non trovato.</div>;

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-spice-red/10 to-mint-green/10 px-2 py-6">
      {designerData ? (
        <>
          <div className="w-full max-w-lg flex flex-col items-center mx-auto">
            <PreviewCanvas
              state={designerData.state}
              elements={designerData.elements}
              size={{ w: 500, h: 300 }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-lg mx-auto">
            <Button onClick={handleDownload} className="bg-spice-red text-white font-bold w-full py-3 rounded shadow-lg hover:bg-spice-red-dark text-base sm:text-lg">
              Scarica Coupon
            </Button>
            <Button variant="outline" onClick={() => { clearDesignerState(); navigate('/dashboard'); }} className="font-bold w-full py-3 rounded shadow-lg text-base sm:text-lg">
              Torna alla Dashboard
            </Button>
          </div>
        </>
      ) : (
        <>
          <Card id="coupon-sheet" className="w-full max-w-lg shadow-2xl border-2 border-spice-red/60 bg-white/90 p-4 sm:p-6 relative mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-montserrat text-spice-red text-center mb-2">
                {coupon.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <QRCodeCanvas value={`${window.location.origin}/riscatta/${coupon.id}`} size={112} bgColor="#ffffff" fgColor="#d7263d" />
                <div className="font-mono text-lg text-spice-red break-all">{coupon.code}</div>
              </div>
              <div className="text-elegant-anthracite text-base sm:text-lg font-roboto text-center">
                {coupon.description}
              </div>
              <div className="flex flex-col sm:flex-row justify-between mt-4 text-sm sm:text-base gap-2">
                <div>
                  <strong>Sconto:</strong> {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`}
                </div>
                {coupon.expires_at && (
                  <div>
                    <strong>Scadenza:</strong> {new Date(coupon.expires_at).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-lg mx-auto">
            <Button onClick={handleDownload} className="bg-spice-red text-white font-bold w-full py-3 rounded shadow-lg hover:bg-spice-red-dark text-base sm:text-lg">
              Scarica Coupon
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="font-bold w-full py-3 rounded shadow-lg text-base sm:text-lg">
              Torna alla Dashboard
            </Button>
          </div>
        </>
      )}
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
};

export default CouponPreview;
