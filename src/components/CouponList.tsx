import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { type Coupon } from '@/data/mockData';
import { CouponForm } from './CouponForm';
import { Eye, Edit, Download, Copy, Trash2, RefreshCcw, Calendar, Users, Percent } from 'lucide-react';

interface CouponListProps {
  coupons: Coupon[];
  onUpdate: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export const CouponList = ({ coupons, onUpdate, onDelete }: CouponListProps) => {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Codice copiato!",
      description: `Il codice "${code}" è stato copiato negli appunti.`,
    });
  };

  const duplicateCoupon = (coupon: Coupon) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: (Math.random() * 1000).toString(),
      title: `${coupon.title} (Copia)`,
      code: `${coupon.code}COPY`,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    onUpdate(newCoupon);
    toast({
      title: "Coupon duplicato!",
      description: `Il coupon "${newCoupon.title}" è stato creato.`,
    });
  };

  const downloadCoupon = (coupon: Coupon) => {
    // Simula il download di un PDF
    toast({
      title: "Download avviato!",
      description: `Il coupon "${coupon.title}" sarà scaricato a breve.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-mint-green text-white';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'expired': return 'Scaduto';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl md:text-2xl font-montserrat font-bold text-elegant-anthracite">
          Gestione Coupon ({coupons.length})
        </h2>
      </div>

      {/* Coupon Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 animate-scale-in">
            <CardHeader className="pb-3 px-4 md:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="font-montserrat text-base md:text-lg text-elegant-anthracite line-clamp-2">
                    {coupon.title}
                  </CardTitle>
                  <CardDescription className="font-roboto mt-1 text-sm">
                    Creato il {new Date(coupon.createdAt).toLocaleDateString('it-IT')}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(coupon.status)} text-xs whitespace-nowrap ml-2`}>
                  {getStatusText(coupon.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-4 md:px-6">
              {/* Coupon Code */}
              <div className="flex items-center justify-between p-3 bg-smoke-gray rounded-lg">
                <code className="font-mono font-bold text-spice-red text-base md:text-lg">
                  {coupon.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(coupon.code)}
                  className="h-8 w-8 p-0 hover:bg-smoke-gray-dark"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Discount Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-turmeric-yellow">
                  <Percent className="h-4 w-4 mr-1" />
                  <span className="font-semibold text-base">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{coupon.usageCount}</span>
                  {coupon.maxUsage && <span>/{coupon.maxUsage}</span>}
                </div>
              </div>

              {/* Expiry Date */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Scade il {new Date(coupon.expiryDate).toLocaleDateString('it-IT')}
              </div>

              {/* Description */}
              {coupon.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 font-roboto">
                  {coupon.description}
                </p>
              )}

              {/* Action Buttons - Mobile Optimized */}
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 pt-2">
                {/* View Details */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setSelectedCoupon(coupon)} className="h-9">
                      <Eye className="h-4 w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Dettagli</span>
                      <span className="sm:hidden">Info</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-4 md:mx-auto">
                    <DialogHeader>
                      <DialogTitle className="font-montserrat text-base md:text-lg">{selectedCoupon?.title}</DialogTitle>
                      <DialogDescription>Dettagli completi del coupon</DialogDescription>
                    </DialogHeader>
                    {selectedCoupon && (
                      <div className="space-y-4 font-roboto text-sm">
                        <div>
                          <strong>Codice:</strong> <code className="font-mono bg-smoke-gray px-2 py-1 rounded text-xs">{selectedCoupon.code}</code>
                        </div>
                        <div>
                          <strong>Sconto:</strong> {selectedCoupon.discountType === 'percentage' ? `${selectedCoupon.discountValue}%` : `€${selectedCoupon.discountValue}`}
                        </div>
                        <div>
                          <strong>Scadenza:</strong> {new Date(selectedCoupon.expiryDate).toLocaleDateString('it-IT')}
                        </div>
                        <div>
                          <strong>Utilizzi:</strong> {selectedCoupon.usageCount}{selectedCoupon.maxUsage && ` / ${selectedCoupon.maxUsage}`}
                        </div>
                        {selectedCoupon.description && (
                          <div>
                            <strong>Descrizione:</strong>
                            <p className="mt-1 text-muted-foreground text-xs">{selectedCoupon.description}</p>
                          </div>
                        )}
                        {selectedCoupon.conditions && (
                          <div>
                            <strong>Condizioni:</strong>
                            <p className="mt-1 text-muted-foreground text-xs">{selectedCoupon.conditions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setEditingCoupon(coupon)} className="h-9">
                      <Edit className="h-4 w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Modifica</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
                    <DialogHeader>
                      <DialogTitle>Modifica Coupon</DialogTitle>
                      <DialogDescription>Aggiorna i dettagli del coupon</DialogDescription>
                    </DialogHeader>
                    {editingCoupon && (
                      <CouponForm
                        initialData={editingCoupon}
                        onSave={(updatedData) => {
                          onUpdate({ ...editingCoupon, ...updatedData });
                          setEditingCoupon(null);
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                {/* Secondary Actions Row */}
                <div className="col-span-2 md:col-span-1 flex gap-2 mt-2 md:mt-0">
                  {/* Download */}
                  <Button size="sm" variant="outline" onClick={() => downloadCoupon(coupon)} className="flex-1 md:flex-none h-9">
                    <Download className="h-4 w-4" />
                  </Button>

                  {/* Duplicate */}
                  <Button size="sm" variant="outline" onClick={() => duplicateCoupon(coupon)} className="flex-1 md:flex-none h-9">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive flex-1 md:flex-none h-9">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="mx-4 md:mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare il coupon?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Questa azione non può essere annullata. Il coupon "{coupon.title}" sarà eliminato definitivamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(coupon.id)} className="bg-destructive hover:bg-destructive/90">
                          Elimina
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coupons.length === 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground font-roboto text-base md:text-lg">
              Nessun coupon trovato. Crea il tuo primo coupon per iniziare!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};