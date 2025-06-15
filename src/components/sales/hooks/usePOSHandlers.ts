
import { useToast } from '@/hooks/use-toast';

interface UsePOSHandlersProps {
  cartItems: any[];
  paymentMethod: string;
  customerSelected: any;
  setShowConfirmation: (show: boolean) => void;
  setShowCalculator: (show: boolean) => void;
  setShowQuickCustomer: (show: boolean) => void;
  setShowCashRegister: (show: boolean) => void;
  addToCart: (item: any, quantity?: number) => void;
  getProductStock: (productId: string) => Promise<number>;
  getComboMaxQuantity: (comboId: string) => Promise<number>;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const usePOSHandlers = ({
  cartItems,
  paymentMethod,
  customerSelected,
  setShowConfirmation,
  setShowCalculator,
  setShowQuickCustomer,
  setShowCashRegister,
  addToCart,
  getProductStock,
  getComboMaxQuantity,
  searchInputRef,
}: UsePOSHandlersProps) => {
  const { toast } = useToast();

  const handleQuickActions = {
    calculator: () => setShowCalculator(true),
    printLastSale: () => {
      toast({
        title: 'Función pendiente',
        description: 'La impresión de última venta estará disponible próximamente',
      });
    },
    quickCustomer: () => setShowQuickCustomer(true),
    cashRegister: () => setShowCashRegister(true),
  };

  const handleAddProduct = async (product: any, quantity: number = 1) => {
    console.log('Agregando producto:', product.name, 'cantidad:', quantity);
    
    try {
      const currentStock = await getProductStock(product.id);
      console.log('Stock disponible:', currentStock);
      
      const existingItem = cartItems.find(item => item.id === product.id && item.type === 'product');
      const quantityInCart = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = quantityInCart + quantity;
      
      if (currentStock < totalRequestedQuantity) {
        toast({
          title: 'Stock insuficiente',
          description: `Solo hay ${currentStock} disponibles. Ya tienes ${quantityInCart} en el carrito.`,
          variant: 'destructive',
        });
        return;
      }

      addToCart({
        id: product.id,
        type: 'product',
        name: product.name,
        price: product.price,
        maxQuantity: currentStock,
        stock_unit: product.stock_unit,
        productId: product.id,
      }, quantity);
      
    } catch (error) {
      console.error('Error al verificar stock:', error);
      toast({
        title: 'Error',
        description: 'No se pudo verificar el stock del producto',
        variant: 'destructive',
      });
    }
  };

  const handleAddCombo = async (combo: any, quantity: number = 1) => {
    try {
      const maxComboQuantity = await getComboMaxQuantity(combo.id);
      console.log('Cantidad máxima de combos disponibles:', maxComboQuantity);
      
      const existingItem = cartItems.find(item => item.id === combo.id && item.type === 'combo');
      const quantityInCart = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = quantityInCart + quantity;
      
      if (maxComboQuantity < totalRequestedQuantity) {
        toast({
          title: 'Stock insuficiente para combo',
          description: `Solo se pueden formar ${maxComboQuantity} combos con el stock disponible. Ya tienes ${quantityInCart} en el carrito.`,
          variant: 'destructive',
        });
        return;
      }

      addToCart({
        id: combo.id,
        type: 'combo',
        name: combo.name,
        price: combo.combo_price,
        maxQuantity: maxComboQuantity,
        comboId: combo.id,
      }, quantity);
      
    } catch (error) {
      console.error('Error al verificar stock del combo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo verificar el stock del combo',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteSale = () => {
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

  const handleTabNavigation = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleSearchKeyPress = async (e: React.KeyboardEvent, filteredProducts: any[], filteredCombos: any[], quantityInputRef: React.RefObject<HTMLInputElement>, searchTerm: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (!searchTerm.trim()) {
        return;
      }
      
      const exactProduct = filteredProducts.find(p => 
        p.barcode === searchTerm || 
        p.sku === searchTerm ||
        p.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      const exactCombo = filteredCombos.find(c =>
        c.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactProduct || exactCombo || filteredProducts.length === 1 || 
          (filteredProducts.length === 0 && filteredCombos.length === 1)) {
        setTimeout(() => {
          if (quantityInputRef.current) {
            quantityInputRef.current.focus();
            quantityInputRef.current.select();
          }
        }, 100);
      }
    }
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
    handleQuickActions,
    handleAddProduct,
    handleAddCombo,
    handleCompleteSale,
    handleTabNavigation,
    handleSearchKeyPress,
    confirmSale,
  };
};
