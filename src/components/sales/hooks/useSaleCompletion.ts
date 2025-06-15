import { useToast } from '@/hooks/use-toast';
import { useSalesData } from './useSalesData';

interface UseSaleCompletionProps {
  cartItems: any[];
  paymentMethod: string;
  customerSelected: any;
  setShowConfirmation: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const useSaleCompletion = ({
  cartItems,
  paymentMethod,
  customerSelected,
  setShowConfirmation,
  searchInputRef,
}: UseSaleCompletionProps) => {
  const { toast } = useToast();
  const { isCashRegisterOpen } = useSalesData();

  const handleCompleteSale = async () => {
    // Validación de caja abierta ANTES que nada
    const isOpen = await isCashRegisterOpen?.();
    if (!isOpen) {
      toast({
        title: 'Caja cerrada',
        description: 'Debes abrir la caja para realizar ventas.',
        variant: 'destructive',
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega productos al carrito antes de completar la venta',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'account' && !customerSelected) {
      toast({
        title: 'Cliente requerido',
        description: 'Selecciona un cliente para ventas a cuenta',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSale = (createSale: any, clearCart: any, setShowConfirmation: any, getDiscountAmount: any) => {
    const saleData = {
      customer_id: customerSelected?.id,
      customer_name: customerSelected?.name,
      customer_email: customerSelected?.email,
      payment_method: paymentMethod,
      discount_amount: getDiscountAmount(),
      items: cartItems.map(item => ({
        product_id: item.productId,
        combo_id: item.comboId,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      })),
    };

    createSale(saleData);
    clearCart();
    setShowConfirmation(false);
    
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 500);
  };

  return {
    handleCompleteSale,
    confirmSale,
  };
};
