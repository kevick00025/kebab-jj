import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { type Coupon } from '@/data/mockData';
import { Plus, Percent, Euro } from 'lucide-react';

interface CouponFormProps {
  onSave: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => void;
  initialData?: Coupon;
}

export const CouponForm = ({ onSave, initialData }: CouponFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    code: initialData?.code || '',
    discountType: initialData?.discountType || 'percentage' as 'percentage' | 'fixed',
    discountValue: initialData?.discountValue || 0,
    expiryDate: initialData?.expiryDate || '',
    status: initialData?.status || 'active' as 'active' | 'expired' | 'archived',
    maxUsage: initialData?.maxUsage || undefined,
    conditions: initialData?.conditions || ''
  });

  const generateCode = () => {
    const prefix = formData.title.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, '') || 'NEW';
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code: `${prefix}${suffix}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.code || !formData.expiryDate) {
      toast({
        title: "Errore di validazione",
        description: "Compila tutti i campi obbligatori.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    
    toast({
      title: "Coupon salvato!",
      description: `Il coupon "${formData.title}" è stato creato con successo.`,
    });

    // Reset form if not editing
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
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Title & Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-roboto font-medium text-sm md:text-base">
                Titolo Offerta *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="es. Sconto Benvenuto"
                className="font-roboto h-11 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="font-roboto font-medium text-sm md:text-base">
                Codice Coupon *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="CODICE20"
                  className="font-mono font-medium h-11 text-base"
                  required
                />
                <Button
                  type="button"
                  onClick={generateCode}
                  variant="outline"
                  className="shrink-0 h-11 px-4"
                >
                  <span className="hidden sm:inline">Genera</span>
                  <span className="sm:hidden">Gen</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-roboto font-medium text-sm md:text-base">
              Descrizione
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrizione dettagliata dell'offerta..."
              className="font-roboto min-h-20 text-base"
            />
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-roboto font-medium text-sm md:text-base">Tipo Sconto</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: 'percentage' | 'fixed') => 
                  setFormData(prev => ({ ...prev, discountType: value }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="percentage">
                    <div className="flex items-center">
                      <Percent className="mr-2 h-4 w-4" />
                      Percentuale
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center">
                      <Euro className="mr-2 h-4 w-4" />
                      Importo Fisso
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue" className="font-roboto font-medium text-sm md:text-base">
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
                className="font-roboto h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsage" className="font-roboto font-medium text-sm md:text-base">
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
                className="font-roboto h-11 text-base"
              />
            </div>
          </div>

          {/* Expiry & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="font-roboto font-medium text-sm md:text-base">
                Data Scadenza *
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="font-roboto h-11 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-roboto font-medium text-sm md:text-base">Stato</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'expired' | 'archived') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="expired">Scaduto</SelectItem>
                  <SelectItem value="archived">Archiviato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <Label htmlFor="conditions" className="font-roboto font-medium text-sm md:text-base">
              Condizioni d'Uso
            </Label>
            <Textarea
              id="conditions"
              value={formData.conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
              placeholder="es. Valido solo per primi acquisti, minimo 25€"
              className="font-roboto min-h-16 text-base"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-spice-red hover:bg-spice-red-dark text-white font-montserrat font-semibold h-12 md:h-14 shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-lg"
          >
            {initialData ? 'Aggiorna Coupon' : 'Crea Coupon'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};