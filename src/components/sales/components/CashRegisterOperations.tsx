
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CashRegisterState {
  isOpen: boolean;
  currentAmount: number;
  startTime: Date | null;
  endTime: Date | null;
}

interface CashRegisterOperationsProps {
  registerState: CashRegisterState;
  onOpenRegister: (amount: number) => boolean;
  onCloseRegister: () => void;
}

const CashRegisterOperations: React.FC<CashRegisterOperationsProps> = ({
  registerState,
  onOpenRegister,
  onCloseRegister,
}) => {
  const [initialAmount, setInitialAmount] = useState('');

  const handleOpenRegister = () => {
    const amount = parseFloat(initialAmount);
    const success = onOpenRegister(amount);
    if (success) {
      setInitialAmount('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Operaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!registerState.isOpen ? (
          <div>
            <Label htmlFor="initial-amount">Monto inicial</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="initial-amount"
                type="number"
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0.00"
              />
              <Button onClick={handleOpenRegister}>
                Abrir Caja
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-green-600 font-medium">
              ✓ Caja abierta y operativa
            </p>
            <Button 
              variant="outline" 
              onClick={onCloseRegister}
              className="w-full"
            >
              Cerrar Caja
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashRegisterOperations;
