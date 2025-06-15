
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CashRegisterState {
  isOpen: boolean;
  currentAmount: number;
  startTime: Date | null;
  endTime: Date | null;
}

interface CashCountSectionProps {
  cashCount: {[key: number]: number};
  registerState: CashRegisterState;
  onCountChange: (value: number, newCount: number) => void;
  calculateTotal: () => number;
}

const CashCountSection: React.FC<CashCountSectionProps> = ({
  cashCount,
  registerState,
  onCountChange,
  calculateTotal,
}) => {
  const denominations = [
    { value: 1000, label: '$1000', color: 'bg-purple-100 text-purple-800' },
    { value: 500, label: '$500', color: 'bg-blue-100 text-blue-800' },
    { value: 200, label: '$200', color: 'bg-green-100 text-green-800' },
    { value: 100, label: '$100', color: 'bg-yellow-100 text-yellow-800' },
    { value: 50, label: '$50', color: 'bg-orange-100 text-orange-800' },
    { value: 20, label: '$20', color: 'bg-red-100 text-red-800' },
    { value: 10, label: '$10', color: 'bg-gray-100 text-gray-800' },
    { value: 5, label: '$5', color: 'bg-indigo-100 text-indigo-800' },
    { value: 1, label: '$1', color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arqueo de Caja</CardTitle>
        <p className="text-sm text-gray-600">
          Cuenta el efectivo disponible en la caja
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {denominations.map((denom) => (
            <div key={denom.value} className="space-y-2">
              <Badge className={denom.color} variant="secondary">
                {denom.label}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCountChange(denom.value, cashCount[denom.value] - 1)}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={cashCount[denom.value] || 0}
                  onChange={(e) => onCountChange(denom.value, parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCountChange(denom.value, cashCount[denom.value] + 1)}
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-gray-600 text-center">
                ${(denom.value * (cashCount[denom.value] || 0)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Contado:</span>
            <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
            <span>Diferencia:</span>
            <span className={calculateTotal() >= registerState.currentAmount ? 'text-green-600' : 'text-red-600'}>
              ${(calculateTotal() - registerState.currentAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashCountSection;
