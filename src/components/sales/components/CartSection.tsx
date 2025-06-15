
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

interface CartItem {
  id: string;
  type: 'product' | 'combo';
  name: string;
  price: number;
  quantity: number;
  stock_unit?: string;
}

interface CartSectionProps {
  cartItems: CartItem[];
  updateQuantity: (itemId: string, itemType: string, newQuantity: number) => void;
  removeFromCart: (itemId: string, itemType: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  discount: number;
  handleCompleteSale: () => void;
  isCreatingSale: boolean;
}

const CartSection: React.FC<CartSectionProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getSubtotal,
  getDiscountAmount,
  getTotal,
  discount,
  handleCompleteSale,
  isCreatingSale,
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-blue-800">
          Carrito ({cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 max-h-80 overflow-y-auto p-4">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.type}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-gray-600 text-xs">
                  ${item.price.toFixed(2)} {item.stock_unit && `/ ${item.stock_unit}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                  className="h-7 w-7 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold w-12 text-center bg-gray-100 py-1 rounded">
                  {item.quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromCart(item.id, item.type)}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {cartItems.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">El carrito está vacío</p>
              <p className="text-xs text-gray-400">Busca productos para agregar</p>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-base text-green-600">
                  <span>Descuento ({discount}%):</span>
                  <span className="font-semibold">-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-blue-800 border-t pt-2">
                <span>TOTAL:</span>
                <span className="bg-blue-100 px-3 py-1 rounded">${getTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button
                onClick={handleCompleteSale}
                disabled={isCreatingSale}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-3"
              >
                {isCreatingSale ? 'Procesando...' : 'Completar Venta (Enter)'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSection;
