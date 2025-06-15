
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  type: 'product' | 'combo';
  name: string;
  price: number;
  quantity: number;
  maxQuantity?: number;
  stock_unit?: string;
  productId?: string;
  comboId?: string;
}

export const useCartData = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerSelected, setCustomerSelected] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const { toast } = useToast();

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('addToCart llamado con:', item.name, 'cantidad:', quantity, 'tipo:', item.type);
    
    const existingItemIndex = cartItems.findIndex(
      cartItem => 
        cartItem.id === item.id && 
        cartItem.type === item.type
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      const currentQuantity = updatedItems[existingItemIndex].quantity;
      const maxQuantity = item.maxQuantity || Infinity;
      const newQuantity = currentQuantity + quantity;

      console.log('Item existente. Cantidad actual:', currentQuantity, 'nueva cantidad:', newQuantity, 'máximo:', maxQuantity);

      if (newQuantity <= maxQuantity) {
        updatedItems[existingItemIndex].quantity = newQuantity;
        // Actualizar también maxQuantity por si cambió el stock
        updatedItems[existingItemIndex].maxQuantity = item.maxQuantity;
        setCartItems(updatedItems);
        
        const unitText = item.type === 'combo' ? 'combo(s)' : (item.stock_unit || 'unidad(es)');
        toast({
          title: `${item.type === 'combo' ? 'Combo' : 'Producto'} agregado`,
          description: `${quantity} ${unitText} de ${item.name} agregado al carrito`,
        });
      } else {
        console.log('Stock insuficiente para agregar más');
        const unitText = item.type === 'combo' ? 'combos' : (item.stock_unit || 'unidades');
        toast({
          title: 'Stock insuficiente',
          description: `No hay suficiente stock de ${item.name}. Stock disponible: ${maxQuantity}, en carrito: ${currentQuantity}`,
          variant: 'destructive',
        });
      }
    } else {
      const maxQuantity = item.maxQuantity || Infinity;
      
      console.log('Item nuevo. Cantidad:', quantity, 'máximo:', maxQuantity, 'tipo:', item.type);
      
      if (quantity <= maxQuantity) {
        setCartItems([...cartItems, { ...item, quantity }]);
        
        const unitText = item.type === 'combo' ? 'combo(s)' : (item.stock_unit || 'unidad(es)');
        toast({
          title: `${item.type === 'combo' ? 'Combo' : 'Producto'} agregado`,
          description: `${quantity} ${unitText} de ${item.name} agregado al carrito`,
        });
      } else {
        console.log('Cantidad solicitada excede el stock');
        const unitText = item.type === 'combo' ? 'combos' : (item.stock_unit || 'unidades');
        toast({
          title: 'Stock insuficiente',
          description: `Solo hay ${maxQuantity} ${unitText} disponibles de ${item.name}`,
          variant: 'destructive',
        });
      }
    }
  };

  const updateQuantity = (itemId: string, itemType: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, itemType);
      return;
    }

    setCartItems(items =>
      items.map(item => {
        if (item.id === itemId && item.type === itemType) {
          const maxQuantity = item.maxQuantity || Infinity;
          const finalQuantity = Math.min(newQuantity, maxQuantity);
          
          if (finalQuantity < newQuantity) {
            toast({
              title: 'Cantidad ajustada',
              description: `Cantidad ajustada a ${finalQuantity} por stock disponible`,
              variant: 'destructive',
            });
          }
          
          return { ...item, quantity: finalQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string, itemType: string) => {
    setCartItems(items =>
      items.filter(item => !(item.id === itemId && item.type === itemType))
    );
    toast({
      title: 'Producto eliminado',
      description: 'El producto ha sido eliminado del carrito',
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerSelected(null);
    setPaymentMethod('cash');
    setDiscount(0);
    toast({
      title: 'Carrito limpiado',
      description: 'Todos los productos han sido eliminados del carrito',
    });
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    return (getSubtotal() * discount) / 100;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  return {
    cartItems,
    customerSelected,
    setCustomerSelected,
    paymentMethod,
    setPaymentMethod,
    discount,
    setDiscount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTotal,
  };
};
