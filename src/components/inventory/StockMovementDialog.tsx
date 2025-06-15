
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSuccess: () => void;
}

const StockMovementDialog: React.FC<StockMovementDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    movement_type: 'entry',
    quantity: '',
    expiration_date: '',
    batch_number: '',
    supplier: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;

    setLoading(true);

    try {
      // Crear movimiento de stock
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: product.id,
          movement_type: formData.movement_type,
          quantity: parseFloat(formData.quantity),
          notes: formData.notes || null,
          created_by: user.id,
        }]);

      if (movementError) throw movementError;

      // Si es entrada, agregar al inventario directamente
      if (formData.movement_type === 'entry') {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert([{
            product_id: product.id,
            quantity: parseFloat(formData.quantity),
            expiration_date: formData.expiration_date || null,
            batch_number: formData.batch_number || null,
            supplier: formData.supplier || null,
            notes: formData.notes || null,
          }]);

        if (inventoryError) throw inventoryError;
      }

      toast({
        title: 'Movimiento registrado',
        description: 'El movimiento de stock se ha registrado correctamente.',
      });

      setFormData({
        movement_type: 'entry',
        quantity: '',
        expiration_date: '',
        batch_number: '',
        supplier: '',
        notes: '',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const movementTypes = [
    { value: 'entry', label: 'Entrada' },
    { value: 'exit', label: 'Salida' },
    { value: 'adjustment', label: 'Ajuste' },
    { value: 'waste', label: 'Merma' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Movimiento de Stock</DialogTitle>
          <DialogDescription>
            Registrar movimiento para: {product?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="movement_type">Tipo de Movimiento *</Label>
              <Select 
                value={formData.movement_type} 
                onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          {formData.movement_type === 'entry' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiration_date">Fecha de Vencimiento</Label>
                  <Input
                    id="expiration_date"
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_number">Número de Lote</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementDialog;
