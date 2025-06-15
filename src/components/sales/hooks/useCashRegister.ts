
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CashRegisterState {
  isOpen: boolean;
  currentAmount: number;
  startTime: Date | null;
  endTime: Date | null;
}

export const useCashRegister = () => {
  const [registerState, setRegisterState] = useState<CashRegisterState>({
    isOpen: false,
    currentAmount: 0,
    startTime: null,
    endTime: null,
  });

  const [cashCount, setCashCount] = useState<{[key: number]: number}>({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
  });

  const { toast } = useToast();

  const calculateTotal = () => {
    return Object.entries(cashCount).reduce((total, [value, count]) => {
      return total + (parseInt(value) * count);
    }, 0);
  };

  const handleCountChange = (value: number, newCount: number) => {
    setCashCount(prev => ({
      ...prev,
      [value]: Math.max(0, newCount)
    }));
  };

  const handleOpenRegister = (amount: number) => {
    if (amount > 0) {
      const now = new Date();
      setRegisterState({
        isOpen: true,
        currentAmount: amount,
        startTime: now,
        endTime: null,
      });
      toast({
        title: 'Caja abierta',
        description: `Caja iniciada con $${amount.toFixed(2)} a las ${now.toLocaleTimeString()}`,
      });
      return true;
    } else {
      toast({
        title: 'Monto inválido',
        description: 'Ingresa un monto inicial válido',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleCloseRegister = () => {
    const total = calculateTotal();
    const now = new Date();
    setRegisterState(prev => ({
      ...prev,
      isOpen: false,
      endTime: now,
    }));
    
    const difference = total - registerState.currentAmount;
    toast({
      title: 'Caja cerrada',
      description: `Arqueo completado. Total contado: $${total.toFixed(2)}. Diferencia: $${difference.toFixed(2)}`,
    });
  };

  return {
    registerState,
    cashCount,
    calculateTotal,
    handleCountChange,
    handleOpenRegister,
    handleCloseRegister,
  };
};
