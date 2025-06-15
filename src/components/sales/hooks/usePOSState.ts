
import { useState, useRef, useEffect } from 'react';

export const usePOSState = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [showCashRegister, setShowCashRegister] = useState(false);
  
  // Referencias para navegación por teclado
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const customerSelectorRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);

  // Autoenfoque en el buscador al montar el componente
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return {
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
  };
};
