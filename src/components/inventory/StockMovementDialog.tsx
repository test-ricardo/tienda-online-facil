
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStockMovementForm } from './hooks/useStockMovementForm';
import StockMovementFormFields from './components/StockMovementFormFields';

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
  const { formData, setFormData, loading, submitMovement } = useStockMovementForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMovement(product, onSuccess);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Movimiento de Stock</DialogTitle>
          <DialogDescription>
            Registrar movimiento para: {product?.name}
            {product?.totalStock !== undefined && (
              <div className="mt-1 text-sm text-gray-600">
                Stock actual: {product.totalStock.toFixed(3)} {product.stock_unit}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <StockMovementFormFields 
            formData={formData}
            setFormData={setFormData}
          />

          <DialogFooter className="mt-6">
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
