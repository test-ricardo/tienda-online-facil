
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useCartData } from './hooks/useCartData';
import { useSalesData } from './hooks/useSalesData';
import CustomerSelector from './components/CustomerSelector';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import SaleConfirmationDialog from './components/SaleConfirmationDialog';
import { useToast } from '@/hooks/use-toast';

const POSTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  
  // Referencias para navegación por teclado
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const customerSelectorRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  
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

  // Autoenfoque en el buscador al montar el componente
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredCombos = combos?.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddProduct = async (product: any, quantity: number = 1) => {
    const stock = await getProductStock(product.id);
    if (stock >= quantity) {
      addToCart({
        id: product.id,
        type: 'product',
        name: product.name,
        price: product.price,
        maxQuantity: stock,
        stock_unit: product.stock_unit,
        productId: product.id,
      }, quantity);
    } else {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${stock} unidades disponibles`,
        variant: 'destructive',
      });
    }
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

  // Manejo de búsqueda por código de barras
  const handleSearchKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Buscar producto exacto por código de barras, SKU o nombre
      const exactProduct = filteredProducts.find(p => 
        p.barcode === searchTerm || 
        p.sku === searchTerm ||
        p.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactProduct) {
        // Si el producto es fraccionable, ir al input de cantidad
        if (exactProduct.sell_by_weight || exactProduct.stock_unit !== 'unit') {
          setSearchTerm('');
          setTimeout(() => {
            if (quantityInputRef.current) {
              quantityInputRef.current.focus();
              quantityInputRef.current.select();
            }
          }, 100);
        } else {
          // Agregar directamente si es producto unitario
          await handleAddProduct(exactProduct);
          setSearchTerm('');
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      } else if (filteredProducts.length === 1) {
        // Si solo hay un resultado, agregarlo
        await handleAddProduct(filteredProducts[0]);
        setSearchTerm('');
      }
    }
  };

  // Navegación por teclado con Tab
  const handleTabNavigation = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (nextRef.current) {
        nextRef.current.focus();
      }
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

  const confirmSale = () => {
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
    
    // Volver el foco al buscador
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 500);
  };

  return (
    <>
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
                  ref={searchInputRef}
                  placeholder="Buscar por nombre, SKU o código de barras... (Enter para agregar)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10 text-lg"
                  autoComplete="off"
                />
              </div>
              
              {/* Input de cantidad para productos fraccionables */}
              {filteredProducts.length === 1 && (filteredProducts[0].sell_by_weight || filteredProducts[0].stock_unit !== 'unit') && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Cantidad ({filteredProducts[0].stock_unit}):
                  </label>
                  <Input
                    ref={quantityInputRef}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ingresa la cantidad"
                    className="w-32"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter') {
                        const quantity = parseFloat((e.target as HTMLInputElement).value);
                        if (quantity > 0) {
                          await handleAddProduct(filteredProducts[0], quantity);
                          setSearchTerm('');
                          (e.target as HTMLInputElement).value = '';
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }
                      }
                    }}
                    onKeyDown={(e) => handleTabNavigation(e, customerSelectorRef)}
                  />
                </div>
              )}
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

        {/* Cart Section - Más visible */}
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
              <div ref={customerSelectorRef} tabIndex={-1}>
                <CustomerSelector
                  customers={customers || []}
                  selectedCustomer={customerSelected}
                  onSelectCustomer={setCustomerSelected}
                  onKeyDown={(e) => handleTabNavigation(e, paymentMethodRef)}
                />
              </div>
              
              <div ref={paymentMethodRef} tabIndex={-1}>
                <PaymentMethodSelector
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  customerSelected={customerSelected}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descuento (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCompleteSale();
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cart Items - Mejorado y más visible */}
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
        </div>
      </div>

      {/* Modal de confirmación */}
      <SaleConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        cartItems={cartItems}
        subtotal={getSubtotal()}
        discount={discount}
        total={getTotal()}
        paymentMethod={paymentMethod}
        customer={customerSelected}
        onConfirm={confirmSale}
        isProcessing={isCreatingSale}
      />
    </>
  );
};

export default POSTab;
