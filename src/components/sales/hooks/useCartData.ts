
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

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingItemIndex = cartItems.findIndex(
      cartItem => 
        cartItem.id === item.id && 
        cartItem.type === item.type
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      const currentQuantity = updatedItems[existingItemIndex].quantity;
      const maxQuantity = item.maxQuantity || Infinity;

      if (currentQuantity < maxQuantity) {
        updatedItems[existingItemIndex].quantity += 1;
        setCartItems(updatedItems);
        toast({
          title: 'Producto agregado',
          description: `${item.name} agregado al carrito`,
        });
      } else {
        toast({
          title: 'Stock insuficiente',
          description: `No hay suficiente stock de ${item.name}`,
          variant: 'destructive',
        });
      }
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
      toast({
        title: 'Producto agregado',
        description: `${item.name} agregado al carrito`,
      });
    }
  };

  const updateQuantity = (itemId: string, itemType: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, itemType);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.id === itemId && item.type === itemType
          ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity || Infinity) }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string, itemType: string) => {
    setCartItems(items =>
      items.filter(item => !(item.id === itemId && item.type === itemType))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerSelected(null);
    setPaymentMethod('cash');
    setDiscount(0);
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
