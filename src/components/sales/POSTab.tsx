
import React from 'react';
import { usePOSState } from './hooks/usePOSState';
import { usePOSHandlers } from './hooks/usePOSHandlers';
import { useCartData } from './hooks/useCartData';
import { useSalesData } from './hooks/useSalesData';
import ProductSearchSection from './components/ProductSearchSection';
import SaleConfigurationSection from './components/SaleConfigurationSection';
import CartSection from './components/CartSection';
import SaleConfirmationDialog from './components/SaleConfirmationDialog';
import QuickActions from './components/QuickActions';
import Calculator from './components/Calculator';
import QuickCustomerDialog from './components/QuickCustomerDialog';
import CashRegisterDialog from './components/CashRegisterDialog';

const POSTab = () => {
  const {
    searchTerm,
    setSearchTerm,
    showConfirmation,
    setShowConfirmation,
    showCalculator,
    setShowCalculator,
    showQuickCustomer,
    setShowQuickCustomer,
    showCashRegister,
    setShowCashRegister,
    searchInputRef,
    quantityInputRef,
    customerSelectorRef,
    paymentMethodRef,
  } = usePOSState();

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
    getComboMaxQuantity,
  } = useSalesData();

  const {
    handleQuickActions,
    handleAddProduct,
    handleAddCombo,
    handleCompleteSale,
    handleTabNavigation,
    handleSearchKeyPress,
    confirmSale,
  } = usePOSHandlers({
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
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredCombos = combos?.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            handleSearchKeyPress={(e) => handleSearchKeyPress(e, filteredProducts, filteredCombos, quantityInputRef, searchTerm)}
            handleTabNavigation={handleTabNavigation}
            handleAddProduct={handleAddProduct}
            handleAddCombo={handleAddCombo}
          />
        </div>

        {/* Cart and Configuration Section */}
        <div className="space-y-6">
          <QuickActions
            onCalculatorOpen={handleQuickActions.calculator}
            onPrintLastSale={handleQuickActions.printLastSale}
            onQuickCustomer={handleQuickActions.quickCustomer}
            onCashRegister={handleQuickActions.cashRegister}
          />

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

      {/* Modales */}
      <SaleConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        cartItems={cartItems}
        subtotal={getSubtotal()}
        discount={discount}
        total={getTotal()}
        paymentMethod={paymentMethod}
        customer={customerSelected}
        onConfirm={() => confirmSale(createSale, clearCart, setShowConfirmation, getDiscountAmount)}
        isProcessing={isCreatingSale}
      />

      <Calculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />

      <QuickCustomerDialog
        open={showQuickCustomer}
        onOpenChange={setShowQuickCustomer}
        onCustomerCreated={setCustomerSelected}
      />

      <CashRegisterDialog
        open={showCashRegister}
        onOpenChange={setShowCashRegister}
      />
    </>
  );
};

export default POSTab;
