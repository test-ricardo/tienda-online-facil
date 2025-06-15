
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StockMovementFormData {
  movement_type: string;
  quantity: string;
  expiration_date: string;
  batch_number: string;
  supplier: string;
  notes: string;
}

export const useStockMovementForm = () => {
  const [formData, setFormData] = useState<StockMovementFormData>({
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

  const resetForm = () => {
    setFormData({
      movement_type: 'entry',
      quantity: '',
      expiration_date: '',
      batch_number: '',
      supplier: '',
      notes: '',
    });
  };

  const handleAdjustmentMovement = async (product: any, quantity: number) => {
    const { data: currentStock } = await supabase
      .rpc('get_product_stock', { product_id: product.id });

    const stockDifference = quantity - (currentStock || 0);

    if (stockDifference === 0) {
      toast({
        title: 'Sin cambios',
        description: 'El stock ya está en el valor indicado.',
      });
      return null;
    }

    const finalMovementType = stockDifference > 0 ? 'entry' : 'exit';
    const finalQuantity = Math.abs(stockDifference);
    const finalNotes = `Ajuste de stock a ${quantity} ${product.stock_unit}. ${formData.notes || ''}`.trim();

    return { finalMovementType, finalQuantity, finalNotes };
  };

  const insertStockMovement = async (product: any, movementType: string, quantity: number, notes: string) => {
    const { error } = await supabase
      .from('stock_movements')
      .insert([{
        product_id: product.id,
        movement_type: movementType,
        quantity,
        notes: notes || null,
        created_by: user!.id,
      }]);

    if (error) throw error;
  };

  const updateInventoryInfo = async (product: any) => {
    if ((formData.movement_type === 'entry' || formData.movement_type === 'adjustment') && 
        (formData.expiration_date || formData.batch_number || formData.supplier)) {
      
      const { data: latestInventory } = await supabase
        .from('inventory')
        .select('id')
        .eq('product_id', product.id)
        .order('entry_date', { ascending: false })
        .limit(1);

      if (latestInventory && latestInventory.length > 0) {
        await supabase
          .from('inventory')
          .update({
            expiration_date: formData.expiration_date || null,
            batch_number: formData.batch_number || null,
            supplier: formData.supplier || null,
          })
          .eq('id', latestInventory[0].id);
      }
    }
  };

  const submitMovement = async (product: any, onSuccess: () => void) => {
    if (!product || !user) return;

    setLoading(true);

    try {
      const quantity = parseFloat(formData.quantity);
      
      if (quantity <= 0) {
        toast({
          title: 'Error',
          description: 'La cantidad debe ser mayor a 0.',
          variant: 'destructive',
        });
        return;
      }

      let finalMovementType = formData.movement_type;
      let finalQuantity = quantity;
      let finalNotes = formData.notes;

      // Handle adjustment movement
      if (formData.movement_type === 'adjustment') {
        const adjustmentResult = await handleAdjustmentMovement(product, quantity);
        if (!adjustmentResult) return;
        
        ({ finalMovementType, finalQuantity, finalNotes } = adjustmentResult);
      }

      // Insert stock movement
      await insertStockMovement(product, finalMovementType, finalQuantity, finalNotes);

      // Update inventory info if needed
      await updateInventoryInfo(product);

      const successMessage = formData.movement_type === 'adjustment' 
        ? `Stock ajustado a ${quantity} ${product.stock_unit}`
        : 'El movimiento de stock se ha registrado correctamente.';

      toast({
        title: 'Movimiento registrado',
        description: successMessage,
      });

      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error in stock movement:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    submitMovement,
    resetForm,
  };
};
