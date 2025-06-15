
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Receipt, Users, CreditCard, Clock, DollarSign } from 'lucide-react';

interface QuickActionsProps {
  onCalculatorOpen: () => void;
  onPrintLastSale: () => void;
  onQuickCustomer: () => void;
  onCashRegister: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCalculatorOpen,
  onPrintLastSale,
  onQuickCustomer,
  onCashRegister,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCalculatorOpen}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculadora
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onPrintLastSale}
            className="flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" />
            Última Venta
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onQuickCustomer}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Cliente Rápido
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCashRegister}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Caja
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
