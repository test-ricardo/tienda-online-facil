
import React, { useState, useRef, useEffect } from 'react';
import { useCartData } from './hooks/useCartData';
import { useSalesData } from './hooks/useSalesData';
import ProductSearchSection from './components/ProductSearchSection';
import SaleConfigurationSection from './components/SaleConfigurationSection';
import CartSection from './components/CartSection';
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
    getComboMaxQuantity,
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
    console.log('Agregando producto:', product.name, 'cantidad:', quantity);
    
    try {
      const currentStock = await getProductStock(product.id);
      console.log('Stock disponible:', currentStock);
      
      // Verificar stock actual en el carrito
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
      
      // Verificar cuántos combos ya están en el carrito
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

  // Manejo de búsqueda por código de barras
  const handleSearchKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // No hacer nada si no hay término de búsqueda
      if (!searchTerm.trim()) {
        return;
      }
      
      // Buscar producto exacto por código de barras, SKU o nombre
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
        // Ir al input de cantidad para que el usuario pueda especificar la cantidad
        setTimeout(() => {
          if (quantityInputRef.current) {
            quantityInputRef.current.focus();
            quantityInputRef.current.select();
          }
        }, 100);
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
        <div className="lg:col-span-2">
          <ProductSearchSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
            quantityInputRef={quantityInputRef}
            customerSelectorRef={customerSelectorRef}
            filteredProducts={filteredProducts}
            filteredCombos={filteredCombos}
            handleSearchKeyPress={handleSearchKeyPress}
            handleTabNavigation={handleTabNavigation}
            handleAddProduct={handleAddProduct}
            handleAddCombo={handleAddCombo}
          />
        </div>

        {/* Cart and Configuration Section */}
        <div className="space-y-6">
          <SaleConfigurationSection
            customerSelectorRef={customerSelectorRef}
            paymentMethodRef={paymentMethodRef}
            customers={customers || []}
            customerSelected={customerSelected}
            setCustomerSelected={setCustomerSelected}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            discount={discount}
            setDiscount={setDiscount}
            handleTabNavigation={handleTabNavigation}
            handleCompleteSale={handleCompleteSale}
          />

          <CartSection
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            getSubtotal={getSubtotal}
            getDiscountAmount={getDiscountAmount}
            getTotal={getTotal}
            discount={discount}
            handleCompleteSale={handleCompleteSale}
            isCreatingSale={isCreatingSale}
          />
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
