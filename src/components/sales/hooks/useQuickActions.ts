
import { useToast } from '@/hooks/use-toast';

interface UseQuickActionsProps {
  setShowCalculator: (show: boolean) => void;
  setShowQuickCustomer: (show: boolean) => void;
  setShowCashRegister: (show: boolean) => void;
}

export const useQuickActions = ({
  setShowCalculator,
  setShowQuickCustomer,
  setShowCashRegister,
}: UseQuickActionsProps) => {
  const { toast } = useToast();

  const handleQuickActions = {
    calculator: () => setShowCalculator(true),
    printLastSale: () => {
      toast({
        title: 'Función pendiente',
        description: 'La impresión de última venta estará disponible próximamente',
      });
    },
    quickCustomer: () => setShowQuickCustomer(true),
    cashRegister: () => setShowCashRegister(true),
  };

  return {
    handleQuickActions,
  };
};
