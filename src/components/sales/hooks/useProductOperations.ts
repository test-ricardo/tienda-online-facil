
import { useToast } from '@/hooks/use-toast';

interface UseProductOperationsProps {
  cartItems: any[];
  addToCart: (item: any, quantity?: number) => void;
  getProductStock: (productId: string) => Promise<number>;
  getComboMaxQuantity: (comboId: string) => Promise<number>;
}

export const useProductOperations = ({
  cartItems,
  addToCart,
  getProductStock,
  getComboMaxQuantity,
}: UseProductOperationsProps) => {
  const { toast } = useToast();

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

  return {
    handleAddProduct,
    handleAddCombo,
  };
};
