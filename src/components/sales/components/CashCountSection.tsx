
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
  sessionId?: string | null;
}

interface CashCountSectionProps {
  cashCount: {[key: number]: number};
  registerState: CashRegisterState;
  onCountChange: (value: number, newCount: number) => void;
  calculateTotal: () => number;
  // Nuevo props para flujo de cierre:
  showCloseSummary?: boolean;
  onShowCloseSummary?: (show: boolean) => void;
  closeNote?: string;
  setCloseNote?: (txt: string) => void;
  onConfirmClose?: () => void;
  isClosing?: boolean;
}

const CashCountSection: React.FC<CashCountSectionProps> = ({
  cashCount,
  registerState,
  onCountChange,
  calculateTotal,
  showCloseSummary,
  onShowCloseSummary,
  closeNote,
  setCloseNote,
  onConfirmClose,
  isClosing,
}) => {
  const denominations = [
    { value: 20000, label: '$20000', color: 'bg-amber-100 text-amber-800' },
    { value: 10000, label: '$10000', color: 'bg-emerald-100 text-emerald-800' },
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

  const totalCounted = calculateTotal();
  const difference = totalCounted - registerState.currentAmount;

  // Si aún no se completó el arqueo, bloquea el cierre
  const allCounted = denominations.some(d => (cashCount[d.value] || 0) > 0);

  // Cierre automatizado: mostrar resumen si showCloseSummary es true
  if (showCloseSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cierre de Caja — Resumen final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center text-lg">
              <span>Total contado:</span>
              <span className="text-green-600 font-semibold">${totalCounted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Efectivo esperado:</span>
              <span className="text-gray-800">${registerState.currentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Diferencia:</span>
              <span className={difference === 0 ? 'text-green-600' : 'text-red-600'}>
                ${difference.toLocaleString()}
              </span>
            </div>
          </div>
          {difference !== 0 && setCloseNote && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Motivo de la diferencia (requerido):
              </label>
              <Input
                value={closeNote}
                onChange={e => setCloseNote(e.target.value)}
                required
                placeholder="Agrega comentario..."
                className="w-full"
              />
            </div>
          )}
          <Button
            variant="default"
            className="w-full"
            onClick={onConfirmClose}
            disabled={isClosing || (difference !== 0 && !closeNote)}
          >
            {isClosing ? 'Cerrando caja...' : 'Confirmar cierre y guardar'}
          </Button>
          {onShowCloseSummary && (
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => onShowCloseSummary(false)}
              disabled={isClosing}
            >
              Volver
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arqueo de Caja</CardTitle>
        <p className="text-sm text-gray-600">
          Cuenta el efectivo disponible en la caja
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {denominations.map((denom) => (
            <div key={denom.value} className="space-y-2">
              <Badge className={denom.color} variant="secondary">
                {denom.label}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCountChange(denom.value, Math.max(0, (cashCount[denom.value] || 0) - 1))}
                >-</Button>
                <Input
                  type="number"
                  min="0"
                  value={cashCount[denom.value] || ''}
                  onChange={(e) => onCountChange(denom.value, parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCountChange(denom.value, (cashCount[denom.value] || 0) + 1)}
                >+</Button>
              </div>
              <p className="text-xs text-gray-600 text-center">
                ${(denom.value * (cashCount[denom.value] || 0)).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Contado:</span>
            <span className="text-green-600">${totalCounted.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
            <span>Diferencia:</span>
            <span className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${difference.toLocaleString()}
            </span>
          </div>
        </div>
        {(registerState.isOpen && onShowCloseSummary) && (
          <Button
            variant="default"
            className="w-full mt-4"
            onClick={() => onShowCloseSummary(true)}
            disabled={!allCounted}
          >
            Continuar y cerrar caja
          </Button>
        )}
        {!allCounted && registerState.isOpen && (
          <p className="text-xs text-red-700 mt-2 text-center font-semibold">
            Ingresa al menos la cantidad de un billete antes de continuar con el cierre.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CashCountSection;
