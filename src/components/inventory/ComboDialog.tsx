
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface ComboDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combo?: any;
  onSuccess: () => void;
}

const ComboDialog: React.FC<ComboDialogProps> = ({
  open,
  onOpenChange,
  combo,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    combo_price: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: products } = useQuery({
    queryKey: ['products-for-combo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (combo) {
      setFormData({
        name: combo.name || '',
        description: combo.description || '',
        combo_price: combo.combo_price?.toString() || '',
        is_active: combo.is_active ?? true,
        start_date: combo.start_date ? combo.start_date.split('T')[0] : '',
        end_date: combo.end_date ? combo.end_date.split('T')[0] : '',
      });
      setSelectedItems(combo.combo_items || []);
    } else {
      setFormData({
        name: '',
        description: '',
        combo_price: '',
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      setSelectedItems([]);
    }
  }, [combo, open]);

  const addItem = () => {
    if (!selectedProduct || !itemQuantity) return;

    const product = products?.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingIndex = selectedItems.findIndex(item => item.product_id === selectedProduct);
    if (existingIndex >= 0) {
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex].quantity = parseFloat(itemQuantity);
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([...selectedItems, {
        product_id: selectedProduct,
        product: product,
        quantity: parseFloat(itemQuantity),
      }]);
    }

    setSelectedProduct('');
    setItemQuantity('');
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.product_id !== productId));
  };

  const calculateTotalCost = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe agregar al menos un producto al combo.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const comboData = {
        ...formData,
        combo_price: parseFloat(formData.combo_price),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      let comboId;

      if (combo) {
        const { error } = await supabase
          .from('product_combos')
          .update(comboData)
          .eq('id', combo.id);
        if (error) throw error;
        comboId = combo.id;

        // Eliminar items existentes
        await supabase
          .from('combo_items')
          .delete()
          .eq('combo_id', combo.id);
      } else {
        const { data, error } = await supabase
          .from('product_combos')
          .insert([comboData])
          .select()
          .single();
        if (error) throw error;
        comboId = data.id;
      }

      // Insertar nuevos items
      const itemsData = selectedItems.map(item => ({
        combo_id: comboId,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('combo_items')
        .insert(itemsData);
      if (itemsError) throw itemsError;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {combo ? 'Editar Combo' : 'Nuevo Combo'}
          </DialogTitle>
          <DialogDescription>
            {combo ? 'Modifica los datos del combo' : 'Crea un nuevo combo promocional'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Combo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combo_price">Precio del Combo *</Label>
              <Input
                id="combo_price"
                type="number"
                step="0.01"
                value={formData.combo_price}
                onChange={(e) => setFormData({ ...formData, combo_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Combo activo</Label>
          </div>

          <div className="space-y-4">
            <Label>Productos del Combo</Label>
            
            <div className="flex gap-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.001"
                placeholder="Cantidad"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                className="w-32"
              />
              <Button type="button" onClick={addItem} disabled={!selectedProduct || !itemQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.product.name}</span>
                    <Badge variant="outline">
                      {item.quantity}x ${item.product.price} = ${(item.quantity * item.product.price).toFixed(2)}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.product_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="p-3 bg-blue-50 rounded">
                <div className="flex justify-between text-sm">
                  <span>Precio individual total:</span>
                  <span>${calculateTotalCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Precio del combo:</span>
                  <span>${formData.combo_price || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Ahorro:</span>
                  <span>${Math.max(0, calculateTotalCost() - parseFloat(formData.combo_price || '0')).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : combo ? 'Actualizar' : 'Crear Combo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComboDialog;
