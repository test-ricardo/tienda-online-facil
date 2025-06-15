
import { useQuickActions } from './useQuickActions';
import { useProductOperations } from './useProductOperations';
import { useSaleCompletion } from './useSaleCompletion';
import { useKeyboardNavigation } from './useKeyboardNavigation';

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
  const { handleQuickActions } = useQuickActions({
    setShowCalculator,
    setShowQuickCustomer,
    setShowCashRegister,
  });

  const { handleAddProduct, handleAddCombo } = useProductOperations({
    cartItems,
    addToCart,
    getProductStock,
    getComboMaxQuantity,
  });

  const { handleCompleteSale, confirmSale } = useSaleCompletion({
    cartItems,
    paymentMethod,
    customerSelected,
    setShowConfirmation,
    searchInputRef,
  });

  const { handleTabNavigation, handleSearchKeyPress } = useKeyboardNavigation();

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
