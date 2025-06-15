
import React, { useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, CreditCard } from 'lucide-react';

interface SaleConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customer: any;
  onConfirm: () => void;
  isProcessing: boolean;
}

const SaleConfirmationDialog: React.FC<SaleConfirmationDialogProps> = ({
  open,
  onOpenChange,
  cartItems,
  subtotal,
  discount,
  total,
  paymentMethod,
  customer,
  onConfirm,
  isProcessing,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Autoenfoque en el botón de confirmar al abrir
  useEffect(() => {
    if (open && confirmButtonRef.current) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Manejar Enter para confirmar
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      onConfirm();
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      account: 'A Cuenta',
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="max-w-md"
        onKeyDown={handleKeyPress}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Confirmar Venta
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Revisa los detalles de la venta antes de procesar:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Resumen de productos */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Productos ({cartItems.length}):</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.type}`} className="flex justify-between text-xs">
                  <span className="truncate flex-1 mr-2">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cliente */}
          {customer && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{customer.name}</span>
            </div>
          )}

          {/* Método de pago */}
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <CreditCard className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              Método de pago: {getPaymentMethodLabel(paymentMethod)}
            </span>
          </div>

          {/* Totales */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({discount}%):</span>
                <span>-${((subtotal * discount) / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>TOTAL:</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Cancelar (Esc)
          </AlertDialogCancel>
          <AlertDialogAction
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Venta (Enter)'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaleConfirmationDialog;
