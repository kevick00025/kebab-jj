import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
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
  <ProtectedRoute redirectTo="/">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-spice-red/10 to-mint-green/10 px-2 py-4">
        <Card className="w-full max-w-md shadow-lg border border-spice-red/40 bg-white/95 p-0 rounded-3xl mx-auto">
          <CardHeader className="flex flex-col items-center pt-8 pb-2">
            <FaCheckCircle className="text-green-500 text-3xl sm:text-4xl mb-2" />
            <CardTitle className="text-2xl sm:text-3xl font-montserrat text-spice-red text-center mb-1 font-bold tracking-tight">
              Coupon valido!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 sm:px-8 pb-8">
            <div className="flex flex-col gap-1 text-base sm:text-lg text-elegant-anthracite font-roboto">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Nome coupon:</span>
                <span className="truncate max-w-[60%] text-right">{coupon.title}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Codice:</span>
                <span className="font-mono tracking-wider text-right">{coupon.code}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Descrizione:</span>
                <span className="text-right truncate max-w-[60%]">{coupon.description}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-semibold">Sconto:</span>
                <span className="text-spice-red font-bold text-right">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`}</span>
              </div>
              {coupon.expires_at && (
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="font-semibold">Scadenza:</span>
                  <span className="text-right">{new Date(coupon.expires_at).toLocaleDateString('it-IT')}</span>
                </div>
              )}
            </div>
            <form className="mt-6 flex flex-col items-center gap-3">
              <label className="font-semibold text-base sm:text-lg text-elegant-anthracite w-full text-center">
                Importo speso dal cliente (€):
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="border-2 border-spice-red/40 rounded-xl px-4 py-3 w-full max-w-xs text-xl sm:text-2xl text-center font-mono focus:outline-none focus:ring-2 focus:ring-spice-red/60 transition"
                placeholder="0.00"
                autoFocus
              />
              {discounted !== null && (
                <div className="w-full flex flex-col items-center mt-2">
                  <div className="bg-green-100 border border-green-400 rounded-xl px-4 py-3 text-green-800 text-lg font-bold shadow-sm">
                    Prezzo scontato: <span className="text-xl sm:text-2xl text-green-700 font-extrabold">€ {discounted.toFixed(2)}</span>
                  </div>
                </div>
              )}
            {/* Pulsante Riscatta */}
            <div className="w-full flex flex-col items-center mt-4">
              <Button
                type="button"
                className="w-full max-w-xs py-3 text-lg font-bold"
                disabled={discounted === null}
                onClick={async () => {
                  if (!coupon) return;
                  // Se il coupon ha un limite di utilizzo
                  if (coupon.max_usage !== null && coupon.max_usage !== undefined) {
                    if (coupon.usage_count !== null && coupon.usage_count !== undefined) {
                      if (coupon.usage_count >= coupon.max_usage) {
                        setError("Limite di utilizzi raggiunto per questo coupon.");
                        toast({
                          title: "Limite raggiunto",
                          description: "Hai già raggiunto il numero massimo di utilizzi per questo coupon.",
                          variant: "destructive"
                        });
                        return;
                      }
                    }
                    // Aggiorna usage_count su Supabase e ottieni il nuovo valore
                    const { data, error: updateError } = await supabase
                      .from('coupons')
                      .update({ usage_count: (coupon.usage_count || 0) + 1 })
                      .eq('id', coupon.id)
                      .select()
                      .single();
                    if (updateError) {
                      setError("Errore durante il riscatto. Riprova.");
                      toast({
                        title: "Errore",
                        description: "Errore durante il riscatto. Riprova.",
                        variant: "destructive"
                      });
                      return;
                    }
                    setCoupon(data);
                  }
                  setError(null);
                  toast({
                    title: "Coupon riscattato!",
                    description: "Il coupon è stato riscattato con successo.",
                    variant: "default"
                  });
                }}
              >
                Riscatta
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default RedeemCouponPage;
