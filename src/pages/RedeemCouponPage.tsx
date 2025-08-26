import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FaCheckCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RedeemCouponPage: React.FC = () => {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [discounted, setDiscounted] = useState<number | null>(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      setLoading(true);
      setError(null);
      // @ts-ignore
      const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single();
      if (error || !data) {
        setError("Coupon non trovato o già riscattato.");
        setCoupon(null);
      } else {
        setCoupon(data);
      }
      setLoading(false);
    };
    if (id) fetchCoupon();
  }, [id]);

  useEffect(() => {
    if (!coupon) return;
    const val = parseFloat(amount.replace(",", "."));
    if (isNaN(val) || val <= 0) {
      setDiscounted(null);
      return;
    }
    let discounted = val;
    if (coupon.discount_type === "percentage") {
      discounted = val - (val * coupon.discount_value / 100);
    } else if (coupon.discount_type === "fixed") {
      discounted = Math.max(0, val - coupon.discount_value);
    }
    setDiscounted(Number(discounted.toFixed(2)));
  }, [amount, coupon]);

  if (loading) return <div className="text-center mt-12">Caricamento...</div>;
  if (error) return <div className="text-center text-red-600 mt-12">{error}</div>;
  if (!coupon) return null;

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-spice-red/10 to-mint-green/10 p-4">
        <Card className="max-w-md w-full shadow-lg border border-spice-red/40 bg-white/95 p-0 rounded-3xl">
          <CardHeader className="flex flex-col items-center pt-8 pb-2">
            <FaCheckCircle className="text-green-500 text-4xl mb-2" />
            <CardTitle className="text-3xl font-montserrat text-spice-red text-center mb-1 font-bold tracking-tight">
              Coupon valido!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-8 pb-8">
            <div className="flex flex-col gap-1 text-base text-elegant-anthracite font-roboto">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Nome coupon:</span>
                <span>{coupon.title}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Codice:</span>
                <span className="font-mono tracking-wider">{coupon.code}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Descrizione:</span>
                <span className="text-right">{coupon.description}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Sconto:</span>
                <span className="text-spice-red font-bold">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`}</span>
              </div>
              {coupon.expires_at && (
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="font-semibold">Scadenza:</span>
                  <span>{new Date(coupon.expires_at).toLocaleDateString('it-IT')}</span>
                </div>
              )}
            </div>
            <form className="mt-6 flex flex-col items-center gap-3">
              <label className="font-semibold text-base text-elegant-anthracite w-full text-center">
                Importo speso dal cliente (€):
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="border-2 border-spice-red/40 rounded-xl px-4 py-2 w-48 text-2xl text-center font-mono focus:outline-none focus:ring-2 focus:ring-spice-red/60 transition"
                placeholder="0.00"
                autoFocus
              />
              {discounted !== null && (
                <div className="w-full flex flex-col items-center mt-2">
                  <div className="bg-green-100 border border-green-400 rounded-xl px-4 py-3 text-green-800 text-lg font-bold shadow-sm">
                    Prezzo scontato: <span className="text-2xl text-green-700 font-extrabold">€ {discounted.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default RedeemCouponPage;
