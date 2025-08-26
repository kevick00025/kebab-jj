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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-spice-red/10 to-mint-green/10 p-6">
      {designerData ? (
        <>
          <div className="max-w-lg w-full flex flex-col items-center">
            <PreviewCanvas
              state={designerData.state}
              elements={designerData.elements}
              size={{ w: 500, h: 300 }}
            />
          </div>
          <div className="flex gap-4 mt-8">
            <Button onClick={handleDownload} className="bg-spice-red text-white font-bold px-6 py-2 rounded shadow-lg hover:bg-spice-red-dark">
              Scarica Coupon
            </Button>
            <Button variant="outline" onClick={() => { clearDesignerState(); navigate('/dashboard'); }} className="font-bold px-6 py-2 rounded shadow-lg">
              Torna alla Dashboard
            </Button>
          </div>
        </>
      ) : (
        <>
          <Card id="coupon-sheet" className="max-w-lg w-full shadow-2xl border-2 border-spice-red/60 bg-white/90 p-6 relative">
            <CardHeader>
              <CardTitle className="text-3xl font-montserrat text-spice-red text-center mb-2">
                {coupon.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <QRCodeCanvas value={coupon.code} size={128} bgColor="#ffffff" fgColor="#d7263d" />
                <div className="font-mono text-lg text-spice-red">{coupon.code}</div>
              </div>
              <div className="text-elegant-anthracite text-base font-roboto text-center">
                {coupon.description}
              </div>
              <div className="flex justify-between mt-4 text-sm">
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
          <div className="flex gap-4 mt-8">
            <Button onClick={handleDownload} className="bg-spice-red text-white font-bold px-6 py-2 rounded shadow-lg hover:bg-spice-red-dark">
              Scarica Coupon
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="font-bold px-6 py-2 rounded shadow-lg">
              Torna alla Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CouponPreview;
