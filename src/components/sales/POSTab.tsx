
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useCartData } from './hooks/useCartData';
import { useSalesData } from './hooks/useSalesData';
import CustomerSelector from './components/CustomerSelector';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import { useToast } from '@/hooks/use-toast';

const POSTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const {
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
  } = useCartData();

  const {
    products,
    combos,
    customers,
    createSale,
    isCreatingSale,
    getProductStock,
    checkComboStock,
  } = useSalesData();

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredCombos = combos?.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddProduct = async (product: any) => {
    const stock = await getProductStock(product.id);
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      maxQuantity: stock,
      stock_unit: product.stock_unit,
      productId: product.id,
    });
  };

  const handleAddCombo = async (combo: any) => {
    const hasStock = await checkComboStock(combo.id);
    if (hasStock) {
      addToCart({
        id: combo.id,
        type: 'combo',
        name: combo.name,
        price: combo.combo_price,
        comboId: combo.id,
      });
    } else {
      toast({
        title: 'Stock insuficiente',
        description: 'No hay suficiente stock para este combo',
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products/Combos Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <Badge variant="secondary">{product.sku}</Badge>
                </div>
                <p className="text-gray-600 text-xs mb-2">
                  {product.categories?.name} {product.subcategories && `- ${product.subcategories.name}`}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredCombos.map((combo) => (
            <Card key={combo.id} className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{combo.name}</h3>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    COMBO
                  </Badge>
                </div>
                <p className="text-gray-600 text-xs mb-2">{combo.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-600">
                    ${combo.combo_price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddCombo(combo)}
                    className="h-8 w-8 p-0 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-6">
        {/* Customer & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Configuración de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSelector
              customers={customers || []}
              selectedCustomer={customerSelected}
              onSelectCustomer={setCustomerSelected}
            />
            
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              customerSelected={customerSelected}
            />

            <div>
              <label className="text-sm font-medium">Descuento (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle>Carrito ({cartItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.type}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item.id, item.type)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento ({discount}%):</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
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
                    className="flex-1"
                  >
                    {isCreatingSale ? 'Procesando...' : 'Completar Venta'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSTab;
