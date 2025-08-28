import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Percent, Euro } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CouponFormProps {
  initialData?: any;
  onClose?: () => void;
  onSave?: (coupon: any) => void;
}

export const CouponForm = ({ initialData, onClose, onSave }: CouponFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    code: initialData?.code || '',
    discountType: initialData?.discount_type || 'percentage',
    discountValue: initialData?.discount_value || 0,
    expiryDate: initialData?.expires_at ? initialData.expires_at.split('T')[0] : '',
    status: initialData?.status || 'active',
    maxUsage: initialData?.max_usage || undefined,
    conditions: initialData?.conditions || ''
  });
  const [expiryEnabled, setExpiryEnabled] = useState(!!formData.expiryDate);

  const generateCode = () => {
    const prefix = formData.title.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, '') || 'NEW';
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code: `${prefix}${suffix}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.code) {
      toast({
        title: "Errore di validazione",
        description: "Compila tutti i campi obbligatori.",
        variant: "destructive",
      });
      return;
    }
    const couponData: any = {
      title: formData.title,
      description: formData.description,
      code: formData.code,
      discount_type: formData.discountType,
      discount_value: formData.discountValue,
      status: formData.status,
      conditions: formData.conditions,
    };
  if (formData.maxUsage) couponData.max_usage = formData.maxUsage;
  if (expiryEnabled && formData.expiryDate) couponData.expires_at = formData.expiryDate;
  let result;
  if (initialData?.id) {
      // @ts-ignore
      result = await supabase.from('coupons').update(couponData).eq('id', initialData.id);
    } else {
      // @ts-ignore
      result = await supabase.from('coupons').insert(couponData).select();
    }
    if (result.error) {
      toast({
        title: "Errore salvataggio",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Coupon salvato!",
        description: `Il coupon \"${formData.title}\" è stato creato con successo.`,
      });
      if (!initialData && result.data && result.data[0]?.id) {
        navigate(`/coupon/${result.data[0].id}`);
      }
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          expiryDate: '',
          status: 'active',
          maxUsage: undefined,
          conditions: ''
        });
      }
    if (onSave) onSave(couponData);
    if (onClose) onClose();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-0 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-spice-red to-spice-red-dark text-white px-4 md:px-6">
        <CardTitle className="font-montserrat text-xl flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          {initialData ? 'Modifica Coupon' : 'Crea Nuovo Coupon'}
        </CardTitle>
        <CardDescription className="text-white/90 text-sm md:text-base">
          {initialData ? 'Modifica i dettagli del coupon esistente' : 'Compila i dettagli per creare un nuovo coupon promozionale'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sezione Dati Principali */}
          <div className="rounded-lg border-2 border-spice-red/60 bg-white/80 p-4 mb-2 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-roboto font-medium text-sm md:text-base text-spice-red">
                  Titolo Offerta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="es. Sconto Benvenuto"
                  className="font-roboto h-11 text-base border-spice-red/40 focus:border-spice-red"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="font-roboto font-medium text-sm md:text-base text-spice-red">
                  Codice Coupon <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="CODICE20"
                    className="font-mono font-medium h-11 text-base border-spice-red/40 focus:border-spice-red"
                    required
                  />
                  <Button
                    type="button"
                    onClick={generateCode}
                    variant="outline"
                    className="shrink-0 h-11 px-4 border-spice-red/40 text-spice-red"
                  >
                    <span className="hidden sm:inline">Genera</span>
                    <span className="sm:hidden">Gen</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="description" className="font-roboto font-medium text-sm md:text-base text-spice-red">
                Descrizione
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione dettagliata dell'offerta..."
                className="font-roboto min-h-20 text-base border-spice-red/40 focus:border-spice-red"
              />
            </div>
          </div>

          {/* Sezione Sconto */}
          <div className="rounded-lg border-2 border-turmeric-yellow/60 bg-turmeric-yellow/10 p-4 mb-2 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-roboto font-medium text-sm md:text-base text-turmeric-yellow">Tipo Sconto</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData(prev => ({ ...prev, discountType: value }))
                  }
                >
                  <SelectTrigger className="h-11 border-turmeric-yellow/40 focus:border-turmeric-yellow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="percentage">
                      <div className="flex items-center">
                        <Percent className="mr-2 h-4 w-4 text-turmeric-yellow" />
                        Percentuale
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center">
                        <Euro className="mr-2 h-4 w-4 text-turmeric-yellow" />
                        Importo Fisso
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue" className="font-roboto font-medium text-sm md:text-base text-turmeric-yellow">
                  Valore Sconto
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                  min="0"
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  className="font-roboto h-11 text-base border-turmeric-yellow/40 focus:border-turmeric-yellow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsage" className="font-roboto font-medium text-sm md:text-base text-turmeric-yellow">
                  Utilizzi Massimi
                </Label>
                <Input
                  id="maxUsage"
                  type="number"
                  value={formData.maxUsage || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maxUsage: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="Illimitato"
                  min="1"
                  className="font-roboto h-11 text-base border-turmeric-yellow/40 focus:border-turmeric-yellow"
                />
              </div>
            </div>
          </div>

          {/* Sezione Limiti e Stato */}
          <div className="rounded-lg border-2 border-mint-green/60 bg-mint-green/10 p-4 mb-2 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-roboto font-medium text-sm md:text-base text-mint-green flex items-center gap-2">
                  <span>Data Scadenza</span>
                  <Button
                    type="button"
                    variant={expiryEnabled ? 'default' : 'outline'}
                    className={`ml-2 px-3 py-1 text-xs h-8 ${expiryEnabled ? 'bg-mint-green text-white' : 'bg-white text-mint-green border-mint-green'}`}
                    onClick={() => setExpiryEnabled(e => !e)}
                  >
                    {expiryEnabled ? 'Abilitata' : 'Disabilitata'}
                  </Button>
                </Label>
                {expiryEnabled && (
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="font-roboto h-11 text-base border-mint-green/40 focus:border-mint-green"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-roboto font-medium text-sm md:text-base text-mint-green">Stato</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'expired' | 'archived') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="h-11 border-mint-green/40 focus:border-mint-green">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="expired">Scaduto</SelectItem>
                    <SelectItem value="archiviato">Archiviato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sezione Condizioni */}
          <div className="rounded-lg border-2 border-elegant-anthracite/60 bg-elegant-anthracite/10 p-4 mb-2 shadow-sm">
            <Label htmlFor="conditions" className="font-roboto font-medium text-sm md:text-base text-elegant-anthracite">
              Condizioni d'Uso
            </Label>
            <Textarea
              id="conditions"
              value={formData.conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
              placeholder="es. Valido solo per primi acquisti, minimo 25€"
              className="font-roboto min-h-16 text-base border-elegant-anthracite/40 focus:border-elegant-anthracite"
            />
          </div>


          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-spice-red to-turmeric-yellow hover:from-spice-red-dark hover:to-turmeric-yellow-dark text-white font-montserrat font-semibold h-12 md:h-14 shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-lg border-0"
          >
            {initialData ? 'Aggiorna Coupon' : 'Crea Coupon'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};